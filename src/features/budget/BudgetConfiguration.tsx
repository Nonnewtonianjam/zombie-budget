/**
 * BudgetConfiguration Component
 * 
 * UI for configuring budget amounts for each spending category.
 * Displays budget inputs with validation and real-time feedback.
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { BudgetConfig, BudgetCategory } from '@/types/budget';
import { CATEGORY_NAMES, CATEGORY_ICONS } from '@/types/budget';

interface BudgetConfigurationProps {
  budgetConfig: BudgetConfig;
  onUpdate: (config: BudgetConfig) => void;
  onReset: () => void;
  totalBudget: number;
  totalSpent: number;
  overallUtilization: number;
}

export function BudgetConfiguration({
  budgetConfig,
  onUpdate,
  onReset,
  totalBudget,
  totalSpent,
  overallUtilization,
}: BudgetConfigurationProps) {
  const [localConfig, setLocalConfig] = useState<BudgetConfig>(budgetConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<BudgetCategory, string>>>({});

  // Sync local state with prop changes
  useEffect(() => {
    setLocalConfig(budgetConfig);
    setHasChanges(false);
    setErrors({});
  }, [budgetConfig]);

  const categories: BudgetCategory[] = ['food', 'entertainment', 'shopping', 'subscriptions'];

  const validateAmount = (_category: BudgetCategory, value: string): string | null => {
    // Empty value is allowed during editing
    if (value === '' || value === undefined) {
      return null;
    }

    const amount = parseFloat(value);

    // Check if it's a valid number
    if (isNaN(amount)) {
      return 'Please enter a valid number';
    }

    // Check if it's positive
    if (amount <= 0) {
      return 'Budget must be greater than $0';
    }

    // Check if it's finite
    if (!isFinite(amount)) {
      return 'Please enter a valid amount';
    }

    return null;
  };

  const handleCategoryChange = (category: BudgetCategory, value: string) => {
    // Allow empty string for clearing the field
    if (value === '') {
      setLocalConfig((prev) => ({
        ...prev,
        [category]: 0,
      }));
      setErrors((prev) => ({
        ...prev,
        [category]: 'Budget must be greater than $0',
      }));
      setHasChanges(true);
      return;
    }

    const amount = parseFloat(value);
    
    // Validate the input
    const error = validateAmount(category, value);
    
    // Update errors state
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[category] = error;
      } else {
        delete newErrors[category];
      }
      return newErrors;
    });

    // Only update if it's a valid number (even if it fails other validation)
    if (!isNaN(amount) && amount >= 0) {
      setLocalConfig((prev) => ({
        ...prev,
        [category]: amount,
      }));
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    // Validate all amounts are positive
    const validationErrors: Partial<Record<BudgetCategory, string>> = {};
    
    categories.forEach((category) => {
      const amount = localConfig[category];
      const error = validateAmount(category, amount.toString());
      if (error) {
        validationErrors[category] = error;
      }
    });

    // If there are any validation errors, update state and prevent save
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onUpdate(localConfig);
    setHasChanges(false);
    setErrors({});
  };

  const handleCancel = () => {
    setLocalConfig(budgetConfig);
    setHasChanges(false);
    setErrors({});
  };

  const handleReset = () => {
    if (confirm('Reset budget to default values?')) {
      onReset();
    }
  };

  const localTotal = Object.values(localConfig).reduce((sum, amount) => sum + amount, 0);

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-ghost-white mb-2">Budget Configuration</h2>
          <p className="text-ghost-dim text-sm">
            Set your monthly budget limits for each category. These determine your blockade strength.
          </p>
        </div>

        {/* Category Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <label htmlFor={`budget-${category}`} className="flex items-center gap-2 text-ghost-white font-medium">
                <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
                <span>{CATEGORY_NAMES[category]}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost-dim z-10">$</span>
                <Input
                  id={`budget-${category}`}
                  type="number"
                  min="0.01"
                  step="10"
                  value={localConfig[category] || ''}
                  onChange={(e) => handleCategoryChange(category, e.target.value)}
                  className="pl-8"
                  placeholder="0.00"
                  error={errors[category]}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total Budget Display */}
        <div className="border-t border-decay-gray pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-ghost-white font-medium">Total Monthly Budget:</span>
            <span className="text-2xl font-bold text-ghost-white font-mono">
              ${localTotal.toFixed(2)}
            </span>
          </div>
          
          {hasChanges && (
            <div className="text-warning-orange text-sm">
              Unsaved changes
            </div>
          )}
        </div>

        {/* Current Utilization (only show if no unsaved changes) */}
        {!hasChanges && totalBudget > 0 && (
          <div className="border-t border-decay-gray pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ghost-dim">Current Spending:</span>
                <span className="text-ghost-white font-mono">${totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ghost-dim">Remaining:</span>
                <span className={`font-mono ${totalSpent > totalBudget ? 'text-blood-red' : 'text-toxic-green'}`}>
                  ${Math.max(0, totalBudget - totalSpent).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ghost-dim">Utilization:</span>
                <span className={`font-mono ${overallUtilization > 100 ? 'text-blood-red' : 'text-ghost-white'}`}>
                  {overallUtilization.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {hasChanges ? (
            <>
              <Button 
                onClick={handleSave} 
                variant="primary" 
                className="flex-1"
                disabled={Object.keys(errors).length > 0}
              >
                Save Budget
              </Button>
              <Button onClick={handleCancel} variant="secondary" className="flex-1">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleReset} variant="secondary" className="w-full">
              Reset to Defaults
            </Button>
          )}
        </div>
        
        {/* Validation Error Summary */}
        {hasChanges && Object.keys(errors).length > 0 && (
          <div className="text-blood-red text-sm text-center">
            Please fix validation errors before saving
          </div>
        )}
      </div>
    </Card>
  );
}
