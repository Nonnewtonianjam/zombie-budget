/**
 * BudgetManager Component
 * 
 * Complete budget management interface.
 * Integrates BudgetConfiguration with useBudget hook and transaction data.
 */

import React from 'react';
import { BudgetConfiguration } from './BudgetConfiguration';
import { useBudget } from '@/hooks/useBudget';
import { useTransactions } from '@/hooks/useTransactions';

/**
 * BudgetManager Component
 * 
 * Provides a complete interface for managing budgets:
 * - Configure budget amounts for each category
 * - View current spending and utilization
 * - Reset to default values
 */
export const BudgetManager: React.FC = () => {
  const { transactions } = useTransactions();
  const {
    budgetConfig,
    updateBudgetConfig,
    resetBudget,
    totalBudget,
    totalSpent,
    overallUtilization,
    error,
  } = useBudget(transactions);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-blood-red/10 border border-blood-red rounded-lg">
          <p className="text-blood-red text-sm">
            <strong>Error:</strong> {error.message}
          </p>
        </div>
      )}

      {/* Budget Configuration */}
      <BudgetConfiguration
        budgetConfig={budgetConfig}
        onUpdate={updateBudgetConfig}
        onReset={resetBudget}
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        overallUtilization={overallUtilization}
      />
    </div>
  );
};
