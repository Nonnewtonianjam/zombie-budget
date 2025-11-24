/**
 * useBudget Hook
 * 
 * Custom hook for managing budget configuration with localStorage persistence.
 * Calculates budget utilization based on transactions.
 */

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { BudgetConfig, Budget, BudgetCategory } from '@/types/budget';
import { DEFAULT_BUDGET_CONFIG } from '@/types/budget';
import type { Transaction } from '@/types/transaction';

const BUDGET_STORAGE_KEY = 'zombie-budget-config';

/**
 * Validator to ensure budget config is valid
 */
function isValidBudgetConfig(value: unknown): value is BudgetConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const config = value as any;
  return (
    typeof config.food === 'number' &&
    typeof config.entertainment === 'number' &&
    typeof config.shopping === 'number' &&
    typeof config.subscriptions === 'number' &&
    config.food > 0 &&
    config.entertainment > 0 &&
    config.shopping > 0 &&
    config.subscriptions > 0
  );
}

/**
 * Hook for managing budget configuration
 */
export function useBudget(transactions: Transaction[]) {
  const [budgetConfig, setBudgetConfig, removeBudgetConfig, error] = useLocalStorage<BudgetConfig>(
    BUDGET_STORAGE_KEY,
    DEFAULT_BUDGET_CONFIG,
    {
      validator: isValidBudgetConfig,
      syncAcrossTabs: true,
    }
  );

  /**
   * Update budget for a specific category
   */
  const updateCategoryBudget = useCallback(
    (category: BudgetCategory, amount: number) => {
      if (amount <= 0 || !isFinite(amount)) {
        console.error('Invalid budget amount:', amount);
        return;
      }

      setBudgetConfig((prev) => ({
        ...prev,
        [category]: amount,
      }));
    },
    [setBudgetConfig]
  );

  /**
   * Update entire budget configuration
   */
  const updateBudgetConfig = useCallback(
    (newConfig: BudgetConfig) => {
      if (!isValidBudgetConfig(newConfig)) {
        console.error('Invalid budget configuration:', newConfig);
        return;
      }

      setBudgetConfig(newConfig);
    },
    [setBudgetConfig]
  );

  /**
   * Reset budget to default values
   */
  const resetBudget = useCallback(() => {
    setBudgetConfig(DEFAULT_BUDGET_CONFIG);
  }, [setBudgetConfig]);

  /**
   * Clear budget configuration
   */
  const clearBudget = useCallback(() => {
    removeBudgetConfig();
  }, [removeBudgetConfig]);

  /**
   * Calculate budget utilization for each category
   * Memoized for performance
   */
  const budgets = useMemo((): Budget[] => {
    const categories: BudgetCategory[] = ['food', 'entertainment', 'shopping', 'subscriptions'];

    return categories.map((category) => {
      const amount = budgetConfig[category];

      // Calculate spent amount from transactions
      const spent = transactions
        .filter((tx) => tx.category === category && !tx.isGoodSpending)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const remaining = Math.max(0, amount - spent);
      const utilizationPercent = amount > 0 ? (spent / amount) * 100 : 0;

      return {
        category,
        amount,
        spent,
        remaining,
        utilizationPercent,
      };
    });
  }, [budgetConfig, transactions]);

  /**
   * Get budget for a specific category
   */
  const getBudgetForCategory = useCallback(
    (category: BudgetCategory): Budget | undefined => {
      return budgets.find((b) => b.category === category);
    },
    [budgets]
  );

  /**
   * Calculate total budget across all categories
   */
  const totalBudget = useMemo(() => {
    return budgetConfig.food + budgetConfig.entertainment + budgetConfig.shopping + budgetConfig.subscriptions;
  }, [budgetConfig]);

  /**
   * Calculate total spent across all categories
   */
  const totalSpent = useMemo(() => {
    return budgets.reduce((sum, budget) => sum + budget.spent, 0);
  }, [budgets]);

  /**
   * Calculate total remaining across all categories
   */
  const totalRemaining = useMemo(() => {
    return Math.max(0, totalBudget - totalSpent);
  }, [totalBudget, totalSpent]);

  /**
   * Calculate overall budget utilization percentage
   */
  const overallUtilization = useMemo(() => {
    return totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  }, [totalBudget, totalSpent]);

  /**
   * Check if any category is over budget
   */
  const hasOverspending = useMemo(() => {
    return budgets.some((budget) => budget.spent > budget.amount);
  }, [budgets]);

  /**
   * Get categories that are over budget
   */
  const overspentCategories = useMemo(() => {
    return budgets.filter((budget) => budget.spent > budget.amount);
  }, [budgets]);

  return {
    // State
    budgetConfig,
    budgets,
    error,

    // Update operations
    updateCategoryBudget,
    updateBudgetConfig,
    resetBudget,
    clearBudget,

    // Query operations
    getBudgetForCategory,

    // Calculated values
    totalBudget,
    totalSpent,
    totalRemaining,
    overallUtilization,
    hasOverspending,
    overspentCategories,
  };
}
