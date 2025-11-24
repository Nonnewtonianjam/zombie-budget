/**
 * Transaction category type
 * Defines the spending categories for budget tracking
 */
export type TransactionCategory =
  | 'food'
  | 'entertainment'
  | 'shopping'
  | 'subscriptions'
  | 'savings' // Good spending
  | 'debt_payment'; // Good spending

/**
 * Transaction category constants for convenience
 */
export const TransactionCategory = {
  FOOD: 'food' as const,
  ENTERTAINMENT: 'entertainment' as const,
  SHOPPING: 'shopping' as const,
  SUBSCRIPTIONS: 'subscriptions' as const,
  SAVINGS: 'savings' as const,
  DEBT_PAYMENT: 'debt_payment' as const,
} as const;

/**
 * Transaction interface
 * Represents a financial transaction with all required fields
 */
export interface Transaction {
  id: string; // UUID
  amount: number; // Positive number (validated)
  category: TransactionCategory; // Food | Entertainment | Shopping | Subscriptions | Savings | Debt Payment
  date: Date; // Transaction date
  description: string; // User-provided description (max 200 chars)
  isGoodSpending: boolean; // Determines zombie spawn or healing
  zombieGenerated?: string; // Reference to spawned zombie ID (if bad spending)
  createdAt: Date; // Record creation timestamp
  updatedAt: Date; // Last modification timestamp
}

/**
 * Helper function to determine if a transaction is good spending
 */
export function isGoodSpending(category: TransactionCategory): boolean {
  return category === 'savings' || category === 'debt_payment';
}

/**
 * Helper function to validate transaction amount
 */
export function isValidAmount(amount: number): boolean {
  return amount > 0 && isFinite(amount);
}

/**
 * Helper function to validate transaction description length
 */
export function isValidDescription(description: string): boolean {
  return description.length <= 200;
}
