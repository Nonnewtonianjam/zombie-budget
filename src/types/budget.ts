/**
 * Budget type definition
 * Represents budget allocation for a spending category
 */

import type { TransactionCategory } from './transaction';

/**
 * Budget category type (only the 4 main spending categories)
 */
export type BudgetCategory = 'food' | 'entertainment' | 'shopping' | 'subscriptions';

/**
 * Budget interface
 * Represents budget allocation and utilization for a category
 */
export interface Budget {
  category: BudgetCategory;
  amount: number; // Budget limit for category
  spent: number; // Current spending in category
  remaining: number; // Calculated: amount - spent
  utilizationPercent: number; // Calculated: (spent / amount) * 100
}

/**
 * Budget configuration (user-set amounts)
 */
export interface BudgetConfig {
  food: number;
  entertainment: number;
  shopping: number;
  subscriptions: number;
}

/**
 * Helper to check if a transaction category is a budget category
 */
export function isBudgetCategory(category: TransactionCategory): category is BudgetCategory {
  return ['food', 'entertainment', 'shopping', 'subscriptions'].includes(category);
}

/**
 * Helper to validate budget amount
 */
export function isValidBudgetAmount(amount: number): boolean {
  return amount > 0 && isFinite(amount);
}

/**
 * Default budget configuration
 */
export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  food: 500,
  entertainment: 200,
  shopping: 300,
  subscriptions: 100,
};

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<BudgetCategory, string> = {
  food: 'Food',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  subscriptions: 'Subscriptions',
};

/**
 * Category icons (using emoji for simplicity)
 */
export const CATEGORY_ICONS: Record<BudgetCategory, string> = {
  food: '🍔',
  entertainment: '🎮',
  shopping: '🛍️',
  subscriptions: '📱',
};
