/**
 * GameView Component
 * 
 * Main game visualization that displays zombies, blockades, and home base.
 * Integrates with transaction system to spawn zombies and update blockades.
 * 
 * Features:
 * - Real-time zombie spawning from transactions
 * - Blockade health visualization
 * - Home base status
 * - Responsive canvas rendering
 */

import { useEffect } from 'react';
import { GameCanvas } from '@/components/game/GameCanvas';
import { useTransactions } from '@/hooks/useTransactions';
import { useGameState } from '@/hooks/useGameState';
import type { BudgetConfig } from '@/lib/zombieSpawning';

interface GameViewProps {
  /** Budget configuration for categories */
  budget?: BudgetConfig;
  /** Canvas width (optional, defaults to container width) */
  width?: number;
  /** Canvas height (optional, defaults to container height) */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show FPS counter */
  showFPS?: boolean;
}

/**
 * GameView Component
 * 
 * Displays the isometric game view with zombies, blockades, and home base.
 * Automatically updates when transactions change.
 */
export function GameView({
  budget,
  width,
  height,
  className = '',
  showFPS = true,
}: GameViewProps) {
  // Get transactions from hook
  const { transactions } = useTransactions();

  // Get game state (zombies, blockades, etc.)
  const {
    zombies,
    blockades,
    homeBase,
    particles,
    updateParticles,
  } = useGameState(transactions, {
    budget,
    enableCombat: false, // Combat is handled during playback
  });

  // Log game state changes for debugging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[GameView] Game state updated:', {
        zombies: zombies.length,
        blockades: blockades.length,
        homeBaseHealth: homeBase.health,
        homeBaseState: homeBase.state,
      });
    }
  }, [zombies, blockades, homeBase]);

  return (
    <div className={`relative ${className}`}>
      {/* Game Canvas */}
      <GameCanvas
        width={width}
        height={height}
        showFPS={showFPS}
        blockades={blockades}
        particles={particles}
        onParticlesUpdate={updateParticles}
      />

      {/* Home Base Status Overlay */}
      <div className="absolute top-4 left-4 bg-background-secondary/90 px-4 py-2 rounded-lg">
        <div className="text-ghost-white font-bold text-sm mb-1">
          Home Base
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-ghost-dim">
            {Math.round(homeBase.health)} / {homeBase.maxHealth}
          </div>
          <div
            className={`text-xs font-bold uppercase ${
              homeBase.state === 'safe'
                ? 'text-toxic-green'
                : homeBase.state === 'threatened'
                ? 'text-warning-orange'
                : 'text-blood-red'
            }`}
          >
            {homeBase.state}
          </div>
        </div>
      </div>

      {/* Zombie Count Overlay */}
      <div className="absolute top-4 right-4 bg-background-secondary/90 px-4 py-2 rounded-lg">
        <div className="text-ghost-white font-bold text-sm mb-1">
          Active Threats
        </div>
        <div className="text-2xl font-mono text-blood-red">
          {zombies.length}
        </div>
      </div>

      {/* Transaction Count Info */}
      <div className="absolute bottom-4 left-4 bg-background-secondary/90 px-4 py-2 rounded-lg">
        <div className="text-xs font-mono text-ghost-dim">
          {transactions.length} transactions
        </div>
      </div>
    </div>
  );
}
