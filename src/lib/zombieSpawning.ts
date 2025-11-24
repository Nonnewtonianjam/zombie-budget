/**
 * Zombie Spawning Logic
 * 
 * Handles the logic for spawning zombies based on overspending transactions.
 * 
 * Rules:
 * - Each bad transaction (overspending) spawns 1 zombie
 * - Zombie strength = transaction amount / 10
 * - Zombies target specific blockades based on category
 * - Good spending (savings, debt_payment) does NOT spawn zombies
 * - Transactions within budget do NOT spawn zombies (they heal blockades instead)
 */

import type { Transaction, TransactionCategory } from '../types/transaction';
import type { Zombie, IsometricPosition } from '../types/zombie';
import { 
  getZombieTypeFromCategory, 
  calculateZombieStrength, 
  getZombieSpeed 
} from '../types/zombie';
import { getBlockadePosition } from '../types/blockade';
import { getDirectionFromVector } from './sprites';
import { spawnZombieFromPool } from './zombiePool';
import { calculateLanePositions, getZombieSpawnX } from './lanePositioning';

/**
 * Budget configuration for determining overspending
 * Maps category to budget amount
 */
export interface BudgetConfig {
  food: number;
  entertainment: number;
  shopping: number;
  subscriptions: number;
}

/**
 * Spending tracker to determine if transaction is overspending
 * Tracks cumulative spending per category
 */
export interface SpendingTracker {
  food: number;
  entertainment: number;
  shopping: number;
  subscriptions: number;
}

/**
 * Determine if a transaction should spawn a zombie
 * 
 * A transaction spawns a zombie if:
 * 1. It's NOT good spending (savings/debt_payment)
 * 2. It's a negative transaction (spending money)
 * 
 * Every bad spending transaction spawns a zombie!
 * 
 * @param transaction - The transaction to evaluate
 * @param budget - Budget configuration for all categories
 * @param currentSpending - Current spending totals per category (unused now, kept for compatibility)
 * @returns true if zombie should spawn, false otherwise
 */
export function shouldSpawnZombie(
  transaction: Transaction,
  budget: BudgetConfig,
  _currentSpending: SpendingTracker // Prefixed with _ to indicate intentionally unused
): boolean {
  // Good spending never spawns zombies
  if (transaction.isGoodSpending) {
    return false;
  }

  // Check if category is one that can spawn zombies
  const category = transaction.category as keyof BudgetConfig;
  if (!(category in budget)) {
    return false; // Unknown category
  }

  // Every negative transaction spawns a zombie!
  return true;
}

/**
 * Calculate spawn position for zombie based on category
 * Zombies spawn from southeast and southwest (bottom of screen)
 * and travel north toward blockades
 * 
 * In isometric coordinates:
 * - Southeast = positive X, positive Y (bottom-right on screen)
 * - Southwest = negative X, positive Y (bottom-left on screen)
 * 
 * @param category - Transaction category
 * @returns Isometric position for zombie spawn
 */
export function getZombieSpawnPosition(category: TransactionCategory): IsometricPosition {
  // Use shared lane positioning system for perfect alignment with barriers
  // Use window.innerHeight to match the actual screen dimensions
  const screenHeight = window.innerHeight;
  const { lanes } = calculateLanePositions(screenHeight);
  
  const lane = lanes.find(l => l.category === category);
  const yPosition = lane ? lane.y : lanes[0].y;
  const spawnX = getZombieSpawnX();
  
  console.log(`🧟 Spawning ${category} zombie at (${spawnX}, ${yPosition.toFixed(0)}) with screenHeight=${screenHeight}`);
  
  return { x: spawnX, y: yPosition, z: 0 };
}

/**
 * Get target blockade ID for a zombie based on transaction category
 * 
 * @param category - Transaction category
 * @returns Blockade ID that zombie should target
 */
export function getTargetBlockadeId(category: TransactionCategory): string {
  // Blockade IDs are typically the category name
  // This matches the BlockadeType enum values
  return category;
}

/**
 * Create a zombie from an overspending transaction
 * Uses object pooling to reuse defeated zombies for better performance
 * 
 * @param transaction - The transaction that triggered zombie spawn
 * @param spawnTime - Optional spawn time in milliseconds (for playback synchronization)
 * @returns New zombie entity from pool
 */
export function spawnZombieFromTransaction(transaction: Transaction, spawnTime?: number): Zombie {
  const zombieType = getZombieTypeFromCategory(transaction.category);
  const strength = calculateZombieStrength(transaction.amount);
  const speed = getZombieSpeed(zombieType);
  const position = getZombieSpawnPosition(transaction.category);
  const targetBlockade = getTargetBlockadeId(transaction.category);
  
  // Calculate initial direction based on spawn position and target blockade
  const targetPosition = getBlockadePosition(transaction.category as any);
  const dx = targetPosition.x - position.x;
  const dy = targetPosition.y - position.y;
  const direction = getDirectionFromVector(dx, dy);

  // Randomly select visual variant (1-5) for variety
  const visualVariant = Math.floor(Math.random() * 5) + 1;

  // Acquire zombie from pool instead of creating new instance
  return spawnZombieFromPool({
    type: zombieType,
    visualVariant,
    strength,
    position,
    targetBlockade,
    speed,
    transactionId: transaction.id,
    direction,
    spawnTime, // Pass spawn time for playback synchronization
  });
}

/**
 * Process a transaction and determine if it spawns a zombie
 * 
 * This is the main entry point for zombie spawning logic.
 * Call this when a new transaction is added or during playback.
 * 
 * @param transaction - The transaction to process
 * @param budget - Budget configuration
 * @param currentSpending - Current spending tracker
 * @param spawnTime - Optional spawn time in milliseconds (for playback synchronization)
 * @returns Zombie if spawned, null otherwise
 */
export function processTransactionForZombieSpawn(
  transaction: Transaction,
  budget: BudgetConfig,
  currentSpending: SpendingTracker,
  spawnTime?: number
): Zombie | null {
  if (shouldSpawnZombie(transaction, budget, currentSpending)) {
    return spawnZombieFromTransaction(transaction, spawnTime);
  }
  return null;
}

/**
 * Process multiple transactions and spawn zombies for overspending
 * Useful for batch processing or playback initialization
 * 
 * @param transactions - Array of transactions to process (should be sorted by date)
 * @param budget - Budget configuration
 * @returns Array of spawned zombies
 */
export function processTransactionsForZombies(
  transactions: Transaction[],
  budget: BudgetConfig
): Zombie[] {
  const zombies: Zombie[] = [];
  const spending: SpendingTracker = {
    food: 0,
    entertainment: 0,
    shopping: 0,
    subscriptions: 0,
  };

  // Sort transactions by date to process chronologically
  const sortedTransactions = [...transactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  for (const transaction of sortedTransactions) {
    // Check if this transaction spawns a zombie
    const zombie = processTransactionForZombieSpawn(transaction, budget, spending);
    
    if (zombie) {
      zombies.push(zombie);
    }

    // Update spending tracker (only for non-good spending)
    if (!transaction.isGoodSpending) {
      const category = transaction.category as keyof SpendingTracker;
      if (category in spending) {
        spending[category] += transaction.amount;
      }
    }
  }

  return zombies;
}

/**
 * Calculate overspending amount for a transaction
 * Returns how much the transaction exceeds the remaining budget
 * 
 * @param transaction - The transaction to evaluate
 * @param budget - Budget configuration
 * @param currentSpending - Current spending tracker
 * @returns Overspending amount (0 if within budget)
 */
export function calculateOverspending(
  transaction: Transaction,
  budget: BudgetConfig,
  currentSpending: SpendingTracker
): number {
  if (transaction.isGoodSpending) {
    return 0;
  }

  const category = transaction.category as keyof BudgetConfig;
  if (!(category in budget)) {
    return 0;
  }

  const newSpending = currentSpending[category] + transaction.amount;
  const categoryBudget = budget[category];
  const overspending = newSpending - categoryBudget;

  return Math.max(0, overspending);
}

/**
 * Update spending tracker with a new transaction
 * 
 * @param spending - Current spending tracker
 * @param transaction - Transaction to add
 * @returns Updated spending tracker
 */
export function updateSpendingTracker(
  spending: SpendingTracker,
  transaction: Transaction
): SpendingTracker {
  // Good spending doesn't count toward category spending
  if (transaction.isGoodSpending) {
    return spending;
  }

  const category = transaction.category as keyof SpendingTracker;
  if (!(category in spending)) {
    return spending;
  }

  return {
    ...spending,
    [category]: spending[category] + transaction.amount,
  };
}
