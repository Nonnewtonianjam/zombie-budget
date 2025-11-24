/**
 * PlaybackView Component
 * 
 * Main view for the cinematic playback experience.
 * Integrates GameCanvas with playback controls and synchronizes zombie spawning.
 * 
 * Features:
 * - 30-45 second animated playback of monthly transactions
 * - Synchronized zombie spawning at transaction timestamps
 * - Synchronized particle effects for visual feedback
 * - Real-time chart updates
 * - Transaction feed
 * - Playback controls (play, pause, restart, speed)
 * 
 * Layout (Requirement 4.9):
 * - 60% Game view (flex-[3] = 3/5 = 60%)
 * - 25% Charts (flex-[5] of 40% column = 5/8 * 40% = 25%)
 *   - 12.5% Spending chart
 *   - 12.5% Category breakdown
 * - 15% Transaction feed (flex-[3] of 40% column = 3/8 * 40% = 15%)
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixiGameCanvas } from '../../components/game/PixiGameCanvas';
import { PlaybackControls } from './PlaybackControls';
import { SpendingChart } from '../charts/SpendingChart';
import { TransactionFeed } from './TransactionFeed';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { usePlayback } from '../../hooks/usePlayback';
import { useTransactions } from '../../hooks/useTransactions';
import { useBudget } from '../../hooks/useBudget';
import type { Transaction } from '../../types/transaction';
import type { PlaybackEvent } from '../../types/playback';
import type { Zombie } from '../../types/zombie';
import type { Blockade } from '../../types/blockade';
// import type { Particle } from '../../lib/particles';
import { spawnZombieFromTransaction } from '../../lib/zombieSpawning';
import { createAllBlockades, damageBlockade, healBlockade } from '../../components/game/Blockade';
import { calculateHealAmount, getHealTargetCategory } from '../../lib/combat';
// import { createBloodParticles, createToxicParticles, createDustParticles } from '../../lib/particles';
// import { isoToScreen } from '../../lib/isometric';
import { playSoundEffect } from '../../lib/soundEffects';
import { generateInsights } from '../../lib/insightsGenerator';
import { Home, LayoutDashboard, Shield, AlertTriangle, Award, TrendingUp } from 'lucide-react';

export function PlaybackView() {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const { budgetConfig: budget } = useBudget(transactions);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [lastDamagedCategory, setLastDamagedCategory] = useState<string | null>(null);
  const [lastHealedCategory, setLastHealedCategory] = useState<string | null>(null);
  
  // Active zombies in the game
  const [zombies, setZombies] = useState<Zombie[]>([]);
  
  // Active blockades in the game
  const [blockades, setBlockades] = useState<Blockade[]>([]);
  
  // Active particles for visual effects (not used with PixiJS yet)
  // const [particles, setParticles] = useState<Particle[]>([]);
  // Current transaction being animated (for feed highlighting)
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  
  // Transaction lookup map for quick access
  const transactionMapRef = useRef<Map<string, Transaction>>(new Map());
  
  // Blockades ref for animation loop (avoid dependency array issues)
  const blockadesRef = useRef<Blockade[]>([]);
  
  // Canvas dimensions (not used with PixiJS)
  // const canvasDimensionsRef = useRef({ width: 800, height: 600 });
  
  // Build transaction map
  useEffect(() => {
    const map = new Map<string, Transaction>();
    transactions.forEach(tx => map.set(tx.id, tx));
    transactionMapRef.current = map;
  }, [transactions]);

  // Initialize blockades when budget changes
  useEffect(() => {
    const initialBlockades = createAllBlockades({
      food: budget.food,
      entertainment: budget.entertainment,
      shopping: budget.shopping,
      subscriptions: budget.subscriptions,
    });
    setBlockades(initialBlockades);
    blockadesRef.current = initialBlockades;
    
    // Log barrier positions for debugging
    console.log('🎯 Barrier positions initialized:');
    initialBlockades.forEach(b => {
      console.log(`  ${b.category}: (${b.position.x}, ${b.position.y})`);
    });
  }, [budget]);
  
  // Update blockades ref when blockades change (no dependencies to avoid re-render loop)
  blockadesRef.current = blockades;

  // Particle system disabled for PixiJS version
  // const getScreenPosition = (x: number, y: number, z: number) => {
  //   const centerX = canvasDimensionsRef.current.width / 2;
  //   const centerY = canvasDimensionsRef.current.height / 2;
  //   const screenPos = isoToScreen(x, y, z);
  //   return {
  //     x: centerX + screenPos.x,
  //     y: centerY + screenPos.y,
  //   };
  // };

  /**
   * Handle zombie spawn event from playback
   * Creates zombie from transaction and adds to active zombies
   * Spawns dust particles at spawn location
   */
  const handleSpawnEvent = (event: PlaybackEvent) => {
    // Get transaction from event
    const transaction = transactionMapRef.current.get(event.transactionId);
    if (!transaction) {
      console.warn(`Transaction not found for spawn event: ${event.transactionId}`);
      return;
    }

    // Spawn zombie from transaction
    const zombie = spawnZombieFromTransaction(transaction);
    
    // Add to active zombies
    setZombies(prev => {
      console.log(`🧟 SPAWNING ZOMBIE: ${zombie.id} at position (${zombie.position.x}, ${zombie.position.y}) for transaction ${transaction.id} ($${transaction.amount})`);
      return [...prev, zombie];
    });
    
    // Play spawn sound effect
    playSoundEffect('zombie-spawn', 0.6);
  };

  /**
   * Handle heal event from playback
   * Triggers healing effects on blockades with toxic green particles
   */
  const handleHealEvent = (event: PlaybackEvent) => {
    // Get transaction from event
    const transaction = transactionMapRef.current.get(event.transactionId);
    if (!transaction) {
      console.warn(`Transaction not found for heal event: ${event.transactionId}`);
      return;
    }

    // Calculate heal amount from transaction
    const healAmount = calculateHealAmount(transaction.amount);
    
    // Determine which category to heal
    const targetCategory = getHealTargetCategory(transaction.category);
    
    console.log(`💚 Heal event: ${healAmount} healing to ${targetCategory || 'all categories'}`);

    // Apply healing to blockades
    setBlockades(prev => {
      const updated = prev.map(blockade => {
        // Check if this blockade should be healed
        const shouldHeal = targetCategory === null || blockade.category === targetCategory;
        
        if (shouldHeal) {
          // Split healing evenly if healing all categories
          const actualHealAmount = targetCategory === null 
            ? healAmount / 4  // Divide by 4 categories
            : healAmount / 2; // Divide by 2 blockades per category
          
          // Play heal sound effect
          playSoundEffect('blockade-heal', 0.5);
          
          const healed = healBlockade(blockade, actualHealAmount);
          console.log(`💚 Blockade ${blockade.category} healed: ${healed.currentHealth.toFixed(0)}/${healed.maxHealth.toFixed(0)} (${((healed.currentHealth/healed.maxHealth)*100).toFixed(0)}%)`);
          
          // Flash heal indicator
          setLastHealedCategory(blockade.category);
          setTimeout(() => setLastHealedCategory(null), 500);
          
          return healed;
        }
        
        return blockade;
      });
      
      // Force re-render by creating new array
      return [...updated];
    });
  };

  /**
   * Handle attack event from playback
   * Triggers damage effects on blockades with blood red particles
   */
  const handleAttackEvent = (event: PlaybackEvent) => {
    if (!event.zombieId || !event.blockadeId) {
      console.warn('Attack event missing zombie or blockade ID');
      return;
    }

    // Find the zombie that's attacking
    const zombie = zombies.find(z => z.id === event.zombieId);
    if (!zombie) {
      console.warn(`Zombie not found for attack event: ${event.zombieId}`);
      return;
    }

    console.log(`⚔️ Attack event: zombie ${event.zombieId} (strength ${zombie.strength}) attacking blockade ${event.blockadeId}`);

    // Update zombie state to attacking
    setZombies(prev => prev.map(z => 
      z.id === event.zombieId ? { ...z, state: 'attacking' } : z
    ));

    // Apply damage to the target blockade
    setBlockades(prev => {
      const updated = prev.map(blockade => {
        // Check if this is the target blockade (match by ID or category)
        const isTarget = blockade.id === event.blockadeId || 
                        blockade.category === event.blockadeId;
        
        if (isTarget) {
          // Play attack sound effect
          playSoundEffect('zombie-attack', 0.7);
          
          // Apply damage based on zombie strength
          const damaged = damageBlockade(blockade, zombie.strength);
          console.log(`💥 Blockade ${blockade.category} damaged: ${damaged.currentHealth.toFixed(0)}/${damaged.maxHealth.toFixed(0)} (${((damaged.currentHealth/damaged.maxHealth)*100).toFixed(0)}%)`);
          
          // Flash damage indicator
          setLastDamagedCategory(blockade.category);
          setTimeout(() => setLastDamagedCategory(null), 500);
          
          return damaged;
        }
        
        return blockade;
      });
      
      // Force re-render by creating new array
      return [...updated];
    });
  };

  /**
   * Handle destroy event from playback
   * Removes zombie from active list with blood splatter particles
   */
  const handleDestroyEvent = (event: PlaybackEvent) => {
    if (!event.zombieId) {
      console.warn('Destroy event missing zombie ID');
      return;
    }
    
    // Find the zombie being destroyed
    const zombie = zombies.find(z => z.id === event.zombieId);
    if (zombie) {
      // Particles disabled for PixiJS version
      // const particlePos = getScreenPosition(zombie.position.x, zombie.position.y, zombie.position.z);
      // const bloodParticles = createBloodParticles(particlePos.x, particlePos.y, 12);
      // setParticles(prev => [...prev, ...bloodParticles]);
      
      // Play defeat sound effect
      playSoundEffect('zombie-defeat', 0.6);
    }
    
    console.log(`Destroy event for zombie ${event.zombieId}`);
    
    // Remove zombie from active list
    setZombies(prev => prev.filter(z => z.id !== event.zombieId));
  };

  // Initialize playback with event handlers
  const playback = usePlayback(transactions, budget, {
    onSpawn: (event) => {
      console.log('🎯 SPAWN EVENT TRIGGERED:', event);
      handleSpawnEvent(event);
    },
    onHeal: handleHealEvent,
    onAttack: (event) => {
      console.log('⚔️ ATTACK EVENT TRIGGERED:', event);
      handleAttackEvent(event);
    },
    onDestroy: handleDestroyEvent,
  });
  
  /**
   * Update current transaction ID, animate zombies, and move them toward blockades
   * Polls every frame (60fps) to ensure < 50ms latency
   * Requirement 16.7: Update within 50ms of transaction timing
   */
  useEffect(() => {
    if (!playback.isPlaying) return;
    
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const updateAnimation = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      // Update current transaction
      const currentTx = playback.getCurrentTransaction();
      if (currentTx) {
        setCurrentTransactionId(currentTx.id);
      }
      
      // Debug: Log zombie count every 60 frames (once per second at 60fps)
      if (Math.floor(currentTime / 1000) !== Math.floor((currentTime - deltaTime * 1000) / 1000)) {
        console.log(`🎮 Animation Loop: ${zombies.length} zombies active, playback time: ${playback.currentTime.toFixed(0)}ms / ${playback.duration}ms`);
      }
      
      // Animate zombie sprite frames and move zombies
      setZombies(prevZombies => {
        // Apply continuous damage from attacking zombies
        const attackingZombies = prevZombies.filter((z: Zombie) => z.state === 'attacking');
        if (attackingZombies.length > 0) {
          setBlockades(prevBlockades => {
            return prevBlockades.map(blockade => {
              // Find zombies attacking this blockade
              const attackers = attackingZombies.filter((z: Zombie) => z.targetBlockade === blockade.category);
              if (attackers.length > 0) {
                // Apply damage from all attackers (damage per second)
                const totalDamage = attackers.reduce((sum: number, z: Zombie) => sum + (z.strength * deltaTime * 0.5), 0);
                const damaged = damageBlockade(blockade, totalDamage);
                return damaged;
              }
              return blockade;
            });
          });
        }
        
        return prevZombies.map(zombie => {
        // Update sprite frame based on state - higher frame rates for smoother animation
        let frameRate = 15; // Increased default frame rate for smoother movement
        if (zombie.state === 'spawning') frameRate = 18; // Faster spawn animation
        if (zombie.state === 'attacking') frameRate = 20; // Faster attack animation
        
        let newFrame = zombie.spriteFrame + (frameRate * deltaTime);
        
        // Handle spawning state transition
        if (zombie.state === 'spawning') {
          if (newFrame >= 15) {
            // Spawn animation complete, transition to moving
            return {
              ...zombie,
              state: 'moving' as const,
              spriteFrame: 0,
            };
          }
          // Still spawning, just update frame
          return {
            ...zombie,
            spriteFrame: newFrame,
          };
        }
        
        // Move zombie toward target blockade
        const targetBlockade = blockadesRef.current.find(b => b.category === zombie.targetBlockade);
        if (targetBlockade) {
          if (zombie.state === 'moving') {
            // Check if zombie has reached the barrier (X position check for horizontal movement)
            // Zombie moves from right to left, so distance is positive when zombie is to the right
            const distanceToBarrier = zombie.position.x - targetBlockade.position.x;
            
            // Debug log for first zombie occasionally
            if (zombie.id === prevZombies[0]?.id && Math.random() < 0.05) {
              console.log(`🚶 Zombie ${zombie.id.slice(0, 8)}: x=${zombie.position.x.toFixed(0)}, barrier x=${targetBlockade.position.x.toFixed(0)}, distance=${distanceToBarrier.toFixed(0)}`);
            }
            
            // If reached barrier (within 80 pixels), start attacking
            // Zombie should stop BEFORE reaching the barrier
            if (distanceToBarrier <= 80) {
              console.log(`⚔️ Zombie ${zombie.id.slice(0, 8)} reached barrier, starting attack!`);
              return {
                ...zombie,
                state: 'attacking' as const,
                spriteFrame: 0, // Reset to start of attack animation
                position: {
                  ...zombie.position,
                  x: targetBlockade.position.x + 80, // Stop 80 pixels before barrier
                },
              };
            }
            
            // Move toward target - simple horizontal movement (left)
            // Increased speed for faster gameplay - zombies should reach barriers quickly
            const moveSpeed = zombie.speed * deltaTime * 50; // Scale for pixel movement
            const moveX = -moveSpeed; // Always move left
            const moveY = 0; // Stay in lane
            
            // Always face West (left) for side-scrolling
            const direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' = 'W';
            
            return {
              ...zombie,
              position: {
                x: zombie.position.x + moveX,
                y: zombie.position.y + moveY,
                z: zombie.position.z,
              },
              direction,
              spriteFrame: newFrame % 15,
            };
          } else if (zombie.state === 'attacking') {
            // Zombie is attacking - stay in place and animate
            return {
              ...zombie,
              spriteFrame: newFrame % 15,
              // Position stays the same - don't move while attacking
            };
          }
        }
        
        // Default: just update frame
        return {
          ...zombie,
          spriteFrame: newFrame % 15,
        };
        });
      });
      
      // Continue polling while playing
      if (playback.isPlaying) {
        animationFrameId = requestAnimationFrame(updateAnimation);
      }
    };
    
    // Start polling
    animationFrameId = requestAnimationFrame(updateAnimation);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [playback.isPlaying, playback.getCurrentTransaction]);
  
  /**
   * Filter transactions up to current playback time for real-time chart updates
   * Uses useMemo with throttling to limit updates to ~100ms intervals
   * This ensures chart updates meet the < 100ms requirement while avoiding
   * excessive recalculations (60fps would be every 16ms)
   */
  const visibleTransactions = useMemo(() => {
    if (transactions.length === 0) return [];
    
    // Sort transactions chronologically
    const sorted = transactions.slice().sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    // If playback hasn't started or just started, show all transactions for charts
    if (!playback.isPlaying || playback.currentTime === 0) {
      return sorted;
    }
    
    // Calculate which transactions should be visible based on playback progress
    const throttledTime = Math.floor(playback.currentTime / 100) * 100;
    const progress = throttledTime / playback.duration;
    const visibleCount = Math.max(1, Math.floor(progress * transactions.length));
    
    return sorted.slice(0, visibleCount);
  }, [transactions, playback.currentTime, playback.duration, playback.isPlaying]);
  
  // Handle playback completion - trigger zombie death animations and show insights
  useEffect(() => {
    // When playback completes, trigger death animation for all zombies
    if (playback.isComplete() && zombies.length > 0) {
      console.log('💀 Playback complete, triggering death animations for all zombies');
      setZombies(prev => prev.map(zombie => ({
        ...zombie,
        state: 'defeated' as const,
        spriteFrame: 0, // Start death animation from frame 0
      })));
      
      // Clear zombies after death animation completes (15 frames at 12fps = 1.25 seconds)
      setTimeout(() => {
        console.log('🗑️ Clearing defeated zombies');
        setZombies([]);
        // Show completion modal with insights
        setShowCompletionModal(true);
      }, 1500);
    }
  }, [playback.isComplete(), zombies.length]);
  
  // Clear zombies and reset blockades when playback is explicitly restarted
  // Only clear when currentTime goes back to 0 (restart button clicked)
  const prevTimeRef = useRef(playback.currentTime);
  useEffect(() => {
    // Detect restart: currentTime went from non-zero to zero
    const wasRestarted = prevTimeRef.current > 0 && playback.currentTime === 0;
    prevTimeRef.current = playback.currentTime;
    
    if (wasRestarted) {
      console.log('🔄 Playback restarted, clearing zombies');
      setZombies([]);
      // setParticles([]);
      setCurrentTransactionId(null);
      
      // Reset blockades to full health
      const resetBlockades = createAllBlockades({
        food: budget.food,
        entertainment: budget.entertainment,
        shopping: budget.shopping,
        subscriptions: budget.subscriptions,
      });
      setBlockades(resetBlockades);
    }
  }, [playback.currentTime, budget]);
  


  return (
    <div className="w-full h-screen fixed inset-0 overflow-hidden bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary">
      {/* Premium SaaS Layout - No Overlaps */}
      
      {/* Playback controls at top - full width bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background-card/95 backdrop-blur-xl border-b-2 border-brand-purple/30 shadow-xl">
        {/* Progress bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-800/50 overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ${
              playback.isPlaying 
                ? 'bg-gradient-to-r from-brand-purple to-brand-purple-light' 
                : 'bg-accent-orange'
            }`}
            style={{ width: `${playback.progress}%` }}
          />
        </div>
        
        {/* Three-column layout: Nav | Controls | Empty */}
        <div className="relative px-6 py-3">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Left: Navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-2 bg-background-secondary/60 hover:bg-background-tertiary/80 border border-brand-purple/20 hover:border-brand-purple/50 rounded-lg text-neutral-300 hover:text-neutral-100 transition-all duration-200 hover:scale-105 shadow-sm"
                title="Go to Home"
              >
                <Home size={16} />
                <span className="text-sm font-medium">Home</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 bg-background-secondary/60 hover:bg-background-tertiary/80 border border-brand-purple/20 hover:border-brand-purple/50 rounded-lg text-neutral-300 hover:text-neutral-100 transition-all duration-200 hover:scale-105 shadow-sm"
                title="Go to Dashboard"
              >
                <LayoutDashboard size={16} />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            </div>
            
            {/* Center: Playback controls */}
            <div className="flex justify-center">
              <PlaybackControls
                isPlaying={playback.isPlaying}
                currentTime={playback.currentTime}
                duration={playback.duration}
                speed={playback.speed}
                onPlay={playback.play}
                onPause={playback.pause}
                onRestart={playback.restart}
                onSpeedChange={playback.setSpeed}
                onSeek={playback.seek}
              />
            </div>
            
            {/* Right: Empty (for balance) */}
            <div></div>
          </div>
        </div>
      </div>

      {/* Main content area - game + charts + transactions */}
      <div className="fixed top-16 left-0 right-0 bottom-0 flex">
        {/* Left side: Game canvas (60%) */}
        <div className="flex-[6] relative flex flex-col">
          {/* Game area */}
          <div className="flex-1">
            <PixiGameCanvas 
              className="w-full h-full"
              showFPS={false}
              zombies={zombies}
              blockades={blockades}
            />
          </div>

          {/* Transaction feed - bottom of left side */}
          <div className="h-52 border-t-2 border-brand-purple/20" style={{ backgroundColor: '#0f0a1f' }}>
            <div className="h-full p-4">
              <TransactionFeed
                transactions={transactions}
                currentTransactionId={currentTransactionId}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Right side: Charts & Health (40%) - full height */}
        <div className="flex-[4] bg-background-primary/50 border-l-2 border-brand-purple/20 p-4 flex flex-col gap-4">
          {/* Health Status */}
          <div className="bg-background-card/50 backdrop-blur-sm rounded-xl border-2 border-brand-purple/30 p-4">
            <h3 className="text-sm font-bold text-neutral-100 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-brand-purple" />
              Defense Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {blockades.map(blockade => {
                const healthPercent = blockade.maxHealth > 0 
                  ? (blockade.currentHealth / blockade.maxHealth) * 100 
                  : 0;
                
                // Category-specific colors matching fence tints
                const categoryColors: Record<string, string> = {
                  food: '#dc2626',           // Brighter red
                  entertainment: '#f59e0b',  // Brighter orange
                  shopping: '#8b5cf6',       // Purple
                  subscriptions: '#10b981',  // Brighter green
                };
                const barColor = categoryColors[blockade.category] || '#8b5cf6';
                
                const isDamaged = lastDamagedCategory === blockade.category;
                const isHealed = lastHealedCategory === blockade.category;
                
                return (
                  <div 
                    key={`${blockade.id}-${blockade.currentHealth}`} 
                    className={`bg-background-tertiary/50 rounded-lg p-2 transition-all duration-200 ${
                      isDamaged ? 'ring-2 ring-accent-red animate-pulse' : 
                      isHealed ? 'ring-2 ring-accent-green animate-pulse' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-300 capitalize">{blockade.category}</span>
                      <span className="text-xs font-mono text-neutral-400">{healthPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-background-primary rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${healthPercent}%`,
                          backgroundColor: barColor
                        }}
                      />
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {blockade.currentHealth.toFixed(0)} / {blockade.maxHealth.toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-brand-purple/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Active Zombies</span>
                <span className="font-bold text-accent-red">{zombies.length}</span>
              </div>
            </div>
          </div>

          {/* Spending Chart - takes remaining space */}
          <div className="flex-1 min-h-0">
            <SpendingChart 
              transactions={visibleTransactions}
              budget={budget}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Completion Modal with Insights */}
      <Modal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title="Playback Complete - Monthly Summary"
        size="xlarge"
      >
        <PlaybackSummary
          transactions={transactions}
          budget={budget}
          onRestart={() => {
            setShowCompletionModal(false);
            playback.restart();
          }}
          onDashboard={() => navigate('/dashboard')}
        />
      </Modal>
    </div>
  );
}

// Playback Summary Component
function PlaybackSummary({
  transactions,
  budget,
  onRestart,
  onDashboard,
}: {
  transactions: Transaction[];
  budget: any;
  onRestart: () => void;
  onDashboard: () => void;
}) {
  const insights = generateInsights(transactions, budget);
  const totalSpent = transactions.reduce((sum, tx) => sum + (tx.isGoodSpending ? 0 : tx.amount), 0);
  const totalBudget = Object.values(budget).reduce((sum: number, val) => sum + (val as number), 0);
  
  // Calculate spending per category
  const categorySpending: Record<string, number> = {
    food: 0,
    entertainment: 0,
    shopping: 0,
    subscriptions: 0,
  };
  
  transactions.forEach(tx => {
    if (!tx.isGoodSpending && tx.category in categorySpending) {
      categorySpending[tx.category as keyof typeof categorySpending] += tx.amount;
    }
  });
  
  // Check which categories are over budget
  const overBudgetCategories = Object.keys(categorySpending).filter(cat => {
    const spent = categorySpending[cat as keyof typeof categorySpending];
    const budgetAmount = budget[cat as keyof typeof budget];
    return spent > budgetAmount;
  });
  
  const survived = overBudgetCategories.length === 0;

  return (
    <div className="space-y-6">
      {/* Result Banner */}
      <div className={`text-center py-8 rounded-xl border-2 ${
        survived 
          ? 'bg-accent-green/10 border-accent-green/30' 
          : 'bg-accent-red/10 border-accent-red/30'
      }`}>
        <div className="text-6xl mb-4">{survived ? '🛡️' : '💀'}</div>
        <h2 className="text-3xl font-bold text-neutral-100 mb-2">
          {survived ? 'Budget Success!' : 'Over Budget!'}
        </h2>
        <p className="text-neutral-400">
          {survived 
            ? 'You stayed within budget across all categories!'
            : `You went over budget in ${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? 'category' : 'categories'}.`
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background-card/50 border border-brand-purple/30 rounded-xl p-4 text-center">
          <p className="text-sm text-neutral-400 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-accent-red">${totalSpent.toFixed(0)}</p>
        </div>
        <div className="bg-background-card/50 border border-brand-purple/30 rounded-xl p-4 text-center">
          <p className="text-sm text-neutral-400 mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-brand-purple">${totalBudget.toFixed(0)}</p>
        </div>
        <div className="bg-background-card/50 border border-brand-purple/30 rounded-xl p-4 text-center">
          <p className="text-sm text-neutral-400 mb-1">Over Budget</p>
          <p className={`text-2xl font-bold ${
            overBudgetCategories.length === 0 ? 'text-accent-green' : 'text-accent-red'
          }`}>
            {overBudgetCategories.length} / 4
          </p>
        </div>
      </div>

      {/* Category Budget Status */}
      <div className="bg-background-card/50 border border-brand-purple/30 rounded-xl p-4">
        <h3 className="text-lg font-bold text-neutral-100 mb-3">Category Budget Status</h3>
        <div className="space-y-3">
          {Object.keys(categorySpending).map(category => {
            const spent = categorySpending[category as keyof typeof categorySpending];
            const budgetAmount = budget[category as keyof typeof budget];
            const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
            const isOverBudget = spent > budgetAmount;
            
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-300 capitalize font-medium">{category}</span>
                  <span className="text-sm font-mono text-neutral-400">
                    ${spent.toFixed(0)} / ${budgetAmount.toFixed(0)}
                  </span>
                </div>
                <div className="h-2 bg-background-primary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      isOverBudget ? 'bg-accent-red' : 
                      percentUsed > 90 ? 'bg-accent-orange' : 
                      'bg-accent-green'
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
                {isOverBudget && (
                  <p className="text-xs text-accent-red mt-1">
                    Over by ${(spent - budgetAmount).toFixed(0)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Insights */}
      {insights.length > 0 && (
        <div className="bg-background-card/50 border border-brand-purple/30 rounded-xl p-4">
          <h3 className="text-lg font-bold text-neutral-100 mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-purple" />
            Key Insights
          </h3>
          <div className="space-y-2">
            {insights.slice(0, 3).map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-background-tertiary/50 rounded-lg">
                {insight.type === 'warning' && <AlertTriangle size={16} className="text-accent-red mt-0.5" />}
                {insight.type === 'achievement' && <Award size={16} className="text-accent-green mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-100">{insight.title}</p>
                  <p className="text-xs text-neutral-400 mt-1">{insight.actionable}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={onRestart}
          className="flex-1"
        >
          Watch Again
        </Button>
        <Button
          variant="primary"
          onClick={onDashboard}
          className="flex-1 bg-brand-purple hover:bg-brand-purple-dark"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
