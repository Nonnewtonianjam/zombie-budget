/**
 * useTransactions Hook
 * 
 * Custom hook for managing transactions with localStorage persistence.
 * Provides CRUD operations (Create, Read, Update, Delete) for transactions.
 * Integrates with game view for zombie spawning and blockade healing.
 */

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Transaction, TransactionCategory } from '@/types/transaction';

const TRANSACTIONS_STORAGE_KEY = 'zombie-budget-transactions';

/**
 * Validator to ensure transactions data is valid
 */
function isValidTransactions(value: unknown): value is Transaction[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((tx) => {
    return (
      typeof tx === 'object' &&
      tx !== null &&
      'id' in tx &&
      'amount' in tx &&
      'category' in tx &&
      'date' in tx &&
      'isGoodSpending' in tx &&
      typeof tx.id === 'string' &&
      typeof tx.amount === 'number' &&
      typeof tx.category === 'string' &&
      typeof tx.isGoodSpending === 'boolean'
    );
  });
}

/**
 * Migration function to handle old transaction formats
 * Converts date strings to Date objects if needed
 */
function migrateTransactions(oldValue: unknown): Transaction[] {
  if (!Array.isArray(oldValue)) {
    return [];
  }

  return oldValue.map((tx: any) => ({
    ...tx,
    date: typeof tx.date === 'string' ? new Date(tx.date) : tx.date,
    createdAt: typeof tx.createdAt === 'string' ? new Date(tx.createdAt) : tx.createdAt,
    updatedAt: typeof tx.updatedAt === 'string' ? new Date(tx.updatedAt) : tx.updatedAt,
  }));
}

/**
 * Transaction statistics for insights
 */
export interface TransactionStats {
  totalSpending: number;
  totalIncome: number;
  netAmount: number;
  categoryTotals: Record<TransactionCategory, number>;
  transactionCount: number;
  averageTransaction: number;
}

/**
 * Hook for managing transactions
 */
export function useTransactions() {
  const [transactions, setTransactions, removeTransactions, error] = useLocalStorage<Transaction[]>(
    TRANSACTIONS_STORAGE_KEY,
    [],
    {
      validator: isValidTransactions,
      migrate: migrateTransactions,
      syncAcrossTabs: true,
    }
  );

  /**
   * Add a new transaction
   * Persists immediately to localStorage
   */
  const addTransaction = useCallback(
    (transaction: Transaction) => {
      setTransactions((prev) => {
        const updated = [...prev, transaction];
        // Sort by date (newest first) for better UX
        // Ensure dates are Date objects
        return updated.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
      });
    },
    [setTransactions]
  );

  /**
   * Update an existing transaction
   * Persists immediately to localStorage
   */
  const updateTransaction = useCallback(
    (updatedTransaction: Transaction) => {
      setTransactions((prev) => {
        const updated = prev.map((tx) =>
          tx.id === updatedTransaction.id ? updatedTransaction : tx
        );
        // Re-sort after update
        // Ensure dates are Date objects
        return updated.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
      });
    },
    [setTransactions]
  );

  /**
   * Delete a transaction by ID
   * Persists immediately to localStorage
   */
  const deleteTransaction = useCallback(
    (transactionId: string) => {
      setTransactions((prev) => prev.filter((tx) => tx.id !== transactionId));
    },
    [setTransactions]
  );

  /**
   * Get a single transaction by ID
   */
  const getTransaction = useCallback(
    (transactionId: string): Transaction | undefined => {
      return transactions.find((tx) => tx.id === transactionId);
    },
    [transactions]
  );

  /**
   * Clear all transactions
   */
  const clearTransactions = useCallback(() => {
    removeTransactions();
  }, [removeTransactions]);

  /**
   * Get transactions filtered by category
   */
  const getTransactionsByCategory = useCallback(
    (category: TransactionCategory): Transaction[] => {
      return transactions.filter((tx) => tx.category === category);
    },
    [transactions]
  );

  /**
   * Get transactions filtered by date range
   */
  const getTransactionsByDateRange = useCallback(
    (startDate: Date, endDate: Date): Transaction[] => {
      return transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate >= startDate && txDate <= endDate;
      });
    },
    [transactions]
  );

  /**
   * Get transactions that spawn zombies (bad spending)
   */
  const getBadSpendingTransactions = useCallback((): Transaction[] => {
    return transactions.filter((tx) => !tx.isGoodSpending);
  }, [transactions]);

  /**
   * Get transactions that heal blockades (good spending)
   */
  const getGoodSpendingTransactions = useCallback((): Transaction[] => {
    return transactions.filter((tx) => tx.isGoodSpending);
  }, [transactions]);

  /**
   * Calculate transaction statistics
   * Memoized for performance
   */
  const stats = useMemo((): TransactionStats => {
    let totalSpending = 0;
    let totalIncome = 0;
    const categoryTotals: Record<TransactionCategory, number> = {
      food: 0,
      entertainment: 0,
      shopping: 0,
      subscriptions: 0,
      savings: 0,
      debt_payment: 0,
    };

    transactions.forEach((tx) => {
      if (tx.isGoodSpending) {
        totalIncome += tx.amount;
      } else {
        totalSpending += tx.amount;
      }

      categoryTotals[tx.category] += tx.amount;
    });

    const netAmount = totalIncome - totalSpending;
    const transactionCount = transactions.length;
    const averageTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;

    return {
      totalSpending,
      totalIncome,
      netAmount,
      categoryTotals,
      transactionCount,
      averageTransaction,
    };
  }, [transactions]);

  /**
   * Get transactions sorted by date (chronological order)
   * Useful for playback
   */
  const getTransactionsSortedByDate = useCallback((): Transaction[] => {
    return [...transactions].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [transactions]);

  /**
   * Get transactions for current month
   */
  const getCurrentMonthTransactions = useCallback((): Transaction[] => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= startOfMonth && txDate <= endOfMonth;
    });
  }, [transactions]);

  /**
   * Bulk add transactions (useful for demo mode)
   */
  const addTransactions = useCallback(
    (newTransactions: Transaction[]) => {
      setTransactions((prev) => {
        const updated = [...prev, ...newTransactions];
        return updated.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
      });
    },
    [setTransactions]
  );

  /**
   * Replace all transactions (useful for demo mode)
   */
  const replaceTransactions = useCallback(
    (newTransactions: Transaction[]) => {
      const sorted = [...newTransactions].sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      setTransactions(sorted);
    },
    [setTransactions]
  );

  return {
    // State
    transactions,
    stats,
    error,

    // CRUD operations
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    clearTransactions,

    // Bulk operations
    addTransactions,
    replaceTransactions,

    // Query operations
    getTransactionsByCategory,
    getTransactionsByDateRange,
    getBadSpendingTransactions,
    getGoodSpendingTransactions,
    getTransactionsSortedByDate,
    getCurrentMonthTransactions,
  };
}
