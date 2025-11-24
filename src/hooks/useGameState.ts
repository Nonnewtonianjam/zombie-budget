/**
 * useGameState Hook
 * 
 * Manages the game state including zombies, blockades, and home base.
 * Synchronizes game state with transactions and budget configuration.
 * 
 * Features:
 * - Zombie spawning from transactions
 * - Blockade health management
 * - Combat processing
 * - Particle effects
 * - Automatic updates when transactions change
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Zombie } from '@/types/zombie';
import type { Blockade } from '@/types/blockade';
import type { HomeBase } from '@/types/homebase';
import type { Transaction } from '@/types/transaction';
import type { Particle } from '@/lib/particles';
import { createAllBlockades, updateBlockadeHealth } from '@/components/game/Blockade';
import { processTransactionsForZombies, type BudgetConfig } from '@/lib/zombieSpawning';
import { CombatManager, calculateHealAmount, getHealTargetCategory } from '@/lib/combat';
import { clearZombiePool } from '@/lib/zombiePool';

/**
 * Default budget configuration
 * Used when no budget is provided
 */
const DEFAULT_BUDGET: BudgetConfig = {
  food: 500,
  entertainment: 300,
  shopping: 400,
  subscriptions: 200,
};

/**
 * Game state interface
 */
export interface GameState {
  zombies: Zombie[];
  blockades: Blockade[];
  homeBase: HomeBase;
  particles: Particle[];
  combatManager: CombatManager;
}

/**
 * Hook options
 */
export interface UseGameStateOptions {
  /** Budget configuration for categories */
  budget?: BudgetConfig;
  /** Enable automatic combat processing */
  enableCombat?: boolean;
}

/**
 * Hook for managing game state
 * 
 * @param transactions - Current transactions
 * @param options - Configuration options
 * @returns Game state and control functions
 */
export function useGameState(
  transactions: Transaction[],
  options: UseGameStateOptions = {}
) {
  const {
    budget = DEFAULT_BUDGET,
    enableCombat = false, // Disabled by default, enabled during playback
  } = options;

  // Game state
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [blockades, setBlockades] = useState<Blockade[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Combat manager (persistent across renders)
  const [combatManager] = useState(() => new CombatManager());

  // Home base state (calculated from blockades)
  const homeBase = useMemo((): HomeBase => {
    const totalMaxHealth = blockades.reduce((sum, b) => sum + b.maxHealth, 0);
    const totalCurrentHealth = blockades.reduce((sum, b) => sum + b.currentHealth, 0);
    
    const healthPercent = totalMaxHealth > 0 
      ? (totalCurrentHealth / totalMaxHealth) * 100 
      : 100;
    
    let state: HomeBase['state'];
    if (healthPercent >= 75) {
      state = 'safe';
    } else if (healthPercent >= 50) {
      state = 'threatened';
    } else {
      state = 'critical';
    }

    return {
      health: totalCurrentHealth,
      maxHealth: totalMaxHealth,
      state,
      position: { x: 0, y: 0, z: 0 },
    };
  }, [blockades]);

  /**
   * Initialize or update blockades and zombies when budget or transactions change
   * This single effect handles both budget updates and transaction processing
   * to avoid conflicts between multiple effects modifying the same state
   */
  useEffect(() => {
    // Step 1: Create or update blockades based on budget
    setBlockades(prevBlockades => {
      let updatedBlockades: Blockade[];
      
      // If no existing blockades, create new ones
      if (prevBlockades.length === 0) {
        updatedBlockades = createAllBlockades(budget);
      } else {
        // Otherwise, update existing blockades with new budget amounts
        // This preserves current damage state
        updatedBlockades = updateBlockadeHealth(prevBlockades, budget);
      }

      // Step 2: Process healing from good spending transactions
      // Apply healing to the updated blockades
      const sortedTransactions = [...transactions].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
      
      sortedTransactions.forEach(transaction => {
        if (transaction.isGoodSpending) {
          const healAmount = calculateHealAmount(transaction.amount);
          const targetCategory = getHealTargetCategory(transaction.category);
          
          const result = combatManager.processHealing(
            transaction.id,
            targetCategory,
            healAmount,
            updatedBlockades,
            Date.now() / 1000
          );
          
          updatedBlockades = result.blockades;
        }
      });

      return updatedBlockades;
    });

    // Step 3: Clear zombie pool and spawn new zombies from transactions
    clearZombiePool();
    const newZombies = processTransactionsForZombies(transactions, budget);
    setZombies(newZombies);
  }, [transactions, budget.food, budget.entertainment, budget.shopping, budget.subscriptions, combatManager]);

  /**
   * Add a zombie to the game
   */
  const addZombie = useCallback((zombie: Zombie) => {
    setZombies(prev => [...prev, zombie]);
  }, []);

  /**
   * Remove a zombie from the game
   */
  const removeZombie = useCallback((zombieId: string) => {
    setZombies(prev => prev.filter(z => z.id !== zombieId));
    combatManager.clearAttackState(zombieId);
  }, [combatManager]);

  /**
   * Update a zombie
   */
  const updateZombie = useCallback((zombieId: string, updates: Partial<Zombie>) => {
    setZombies(prev => prev.map(z => 
      z.id === zombieId ? { ...z, ...updates } : z
    ));
  }, []);

  /**
   * Update blockades
   */
  const updateBlockades = useCallback((newBlockades: Blockade[]) => {
    setBlockades(newBlockades);
  }, []);

  /**
   * Add particles
   */
  const addParticles = useCallback((newParticles: Particle[]) => {
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  /**
   * Update particles (removes expired ones)
   */
  const updateParticles = useCallback((newParticles: Particle[]) => {
    setParticles(newParticles);
  }, []);

  /**
   * Clear all particles
   */
  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  /**
   * Reset game state
   */
  const reset = useCallback(() => {
    clearZombiePool();
    setZombies([]);
    setParticles([]);
    combatManager.reset();
    
    // Reset blockades to full health
    const resetBlockades = createAllBlockades(budget);
    setBlockades(resetBlockades);
  }, [budget, combatManager]);

  /**
   * Process combat (attacks and healing)
   * Call this from game loop when combat is enabled
   */
  const processCombat = useCallback((currentTime: number) => {
    if (!enableCombat) return;

    const result = combatManager.processAttacks(zombies, blockades, currentTime);
    
    setZombies(result.zombies);
    setBlockades(result.blockades);
    
    // TODO: Create particles for attack events
    // This will be implemented when particle system is integrated
  }, [enableCombat, zombies, blockades, combatManager]);

  return {
    // State
    zombies,
    blockades,
    homeBase,
    particles,
    combatManager,

    // Actions
    addZombie,
    removeZombie,
    updateZombie,
    updateBlockades,
    addParticles,
    updateParticles,
    clearParticles,
    processCombat,
    reset,
  };
}
