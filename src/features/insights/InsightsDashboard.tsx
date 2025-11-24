/**
 * InsightsDashboard Component
 * 
 * Displays monthly financial insights including:
 * - Total spending, budget utilization, and savings
 * - Category-specific spending analysis
 * - Highest overspending category identification
 * - 3-5 actionable recommendations based on spending patterns
 * - Real-time updates as transactions change
 * 
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.8
 */

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Budget } from '@/types/budget';

interface InsightsDashboardProps {
  totalBudget: number;
  totalSpent: number;
  overallUtilization: number;
  budgets: Budget[];
}

export function InsightsDashboard({
  totalBudget,
  totalSpent,
  overallUtilization,
  budgets,
}: InsightsDashboardProps) {
  /**
   * Calculate savings (budget minus spending)
   * Positive value means under budget, negative means overspending
   */
  const savings = useMemo(() => {
    return totalBudget - totalSpent;
  }, [totalBudget, totalSpent]);

  /**
   * Determine overall financial health status
   */
  const healthStatus = useMemo(() => {
    if (overallUtilization <= 75) return 'safe';
    if (overallUtilization <= 90) return 'warning';
    return 'critical';
  }, [overallUtilization]);

  /**
   * Identify category with highest overspending
   * Returns the category that exceeded its budget by the largest amount
   * Returns null if no categories are overspending
   */
  const highestOverspendingCategory = useMemo(() => {
    const overspendingCategories = budgets
      .filter((budget) => budget.spent > budget.amount)
      .map((budget) => ({
        category: budget.category,
        overspendAmount: budget.spent - budget.amount,
        utilizationPercent: budget.utilizationPercent,
      }))
      .sort((a, b) => b.overspendAmount - a.overspendAmount);

    return overspendingCategories.length > 0 ? overspendingCategories[0] : null;
  }, [budgets]);

  /**
   * Generate 3-5 actionable recommendations based on spending patterns
   * Requirements: 19.4, 19.7 (themed language)
   */
  const recommendations = useMemo(() => {
    const recs: Array<{ icon: string; text: string; priority: 'high' | 'medium' | 'low' }> = [];

    // Recommendation 1: Address highest overspending category (THEMED)
    if (highestOverspendingCategory) {
      const categoryName = highestOverspendingCategory.category.charAt(0).toUpperCase() + 
                          highestOverspendingCategory.category.slice(1);
      recs.push({
        icon: '🧟',
        text: `Your ${categoryName} defenses were overwhelmed by ${formatCurrency(
          highestOverspendingCategory.overspendAmount
        )}. Reinforce this blockade by cutting back on non-essential ${highestOverspendingCategory.category} purchases to prevent future zombie attacks.`,
        priority: 'high',
      });
    }

    // Recommendation 2: Categories approaching limit (THEMED)
    const approachingLimit = budgets.filter(
      (b) => b.utilizationPercent > 75 && b.utilizationPercent <= 100
    );
    if (approachingLimit.length > 0) {
      const categoryNames = approachingLimit
        .map((b) => b.category.charAt(0).toUpperCase() + b.category.slice(1))
        .join(', ');
      recs.push({
        icon: '⚠️',
        text: `Your ${categoryNames} ${
          approachingLimit.length === 1 ? 'blockade is' : 'blockades are'
        } under heavy assault. The zombie horde is closing in—fortify ${
          approachingLimit.length === 1 ? 'this defense' : 'these defenses'
        } before they breach.`,
        priority: 'medium',
      });
    }

    // Recommendation 3: Overall budget health (THEMED)
    if (overallUtilization > 100) {
      recs.push({
        icon: '💀',
        text: `Your home base has been breached! You've overspent by ${formatCurrency(
          Math.abs(savings)
        )}. The zombie apocalypse is here—immediately cut all non-essential spending to survive.`,
        priority: 'high',
      });
    } else if (overallUtilization > 90) {
      recs.push({
        icon: '🔥',
        text: `Critical alert: Your defenses are at ${overallUtilization.toFixed(
          1
        )}% capacity. The zombie horde is at your gates—freeze all discretionary spending to hold the line.`,
        priority: 'medium',
      });
    } else if (overallUtilization < 50) {
      recs.push({
        icon: '✨',
        text: `Your defenses are holding strong! Only ${overallUtilization.toFixed(
          1
        )}% of your resources deployed. Consider channeling your ${formatCurrency(
          savings
        )} surplus into fortifying your savings vault or eliminating debt zombies.`,
        priority: 'low',
      });
    }

    // Recommendation 4: Multiple overspending categories (THEMED)
    const overspendingCount = budgets.filter((b) => b.spent > b.amount).length;
    if (overspendingCount >= 2) {
      const categories = budgets
        .filter((b) => b.spent > b.amount)
        .map((b) => b.category.charAt(0).toUpperCase() + b.category.slice(1))
        .join(', ');
      recs.push({
        icon: '🛡️',
        text: `Multiple blockades destroyed (${categories})! The zombie swarm has broken through. Execute emergency protocols: essential spending only, reallocate resources from surviving defenses.`,
        priority: 'high',
      });
    }

    // Recommendation 5: Well-performing categories (THEMED)
    const wellPerforming = budgets.filter((b) => b.utilizationPercent <= 50);
    if (wellPerforming.length > 0 && overallUtilization > 75) {
      const categoryNames = wellPerforming
        .map((b) => b.category.charAt(0).toUpperCase() + b.category.slice(1))
        .join(', ');
      recs.push({
        icon: '🔄',
        text: `Your ${categoryNames} ${
          wellPerforming.length === 1 ? 'blockade stands' : 'blockades stand'
        } strong with minimal zombie activity. Redirect reinforcements from ${
          wellPerforming.length === 1 ? 'this fortress' : 'these fortresses'
        } to struggling defenses.`,
        priority: 'medium',
      });
    }

    // Recommendation 6: Balanced spending (THEMED - positive reinforcement)
    if (overallUtilization >= 50 && overallUtilization <= 75 && overspendingCount === 0) {
      recs.push({
        icon: '🎉',
        text: `All defenses holding! Your blockades are perfectly balanced—no zombie breaches detected. The undead threat is contained. Maintain this vigilant defense strategy!`,
        priority: 'low',
      });
    }

    // Sort by priority and return top 3-5
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recs
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 5);
  }, [budgets, highestOverspendingCategory, overallUtilization, savings]);

  /**
   * Format currency for display
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Get color class based on utilization percentage
   */
  const getUtilizationColor = (utilization: number): string => {
    if (utilization <= 75) return 'text-toxic-green';
    if (utilization <= 90) return 'text-warning-orange';
    return 'text-blood-red';
  };

  return (
    <div className="space-y-6 transition-all duration-200">
      {/* Overall Summary */}
      <Card className="transition-all duration-200">
        <h2 className="text-2xl font-bold text-ghost-white mb-6 transition-all duration-200">
          🏰 Defense Status Report
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Budget */}
          <div>
            <p className="text-sm text-decay-gray mb-1">⚔️ Total Defense Budget</p>
            <p className="text-3xl font-bold text-ghost-white font-mono">
              {formatCurrency(totalBudget)}
            </p>
          </div>

          {/* Total Spent */}
          <div>
            <p className="text-sm text-decay-gray mb-1">🧟 Zombie Damage Taken</p>
            <p className="text-3xl font-bold text-ghost-white font-mono">
              {formatCurrency(totalSpent)}
            </p>
          </div>

          {/* Savings/Remaining */}
          <div>
            <p className="text-sm text-decay-gray mb-1">
              {savings >= 0 ? '🛡️ Resources Remaining' : '💀 Defense Breach'}
            </p>
            <p
              className={`text-3xl font-bold font-mono ${
                savings >= 0 ? 'text-toxic-green' : 'text-blood-red'
              }`}
            >
              {formatCurrency(Math.abs(savings))}
            </p>
          </div>
        </div>

        {/* Overall Utilization */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-decay-gray">🎯 Defense Deployment</p>
            <p
              className={`text-lg font-bold font-mono ${getUtilizationColor(
                overallUtilization
              )}`}
            >
              {overallUtilization.toFixed(1)}%
            </p>
          </div>
          <ProgressBar
            value={overallUtilization}
            max={100}
            variant={
              healthStatus === 'safe'
                ? 'healthy'
                : healthStatus === 'warning'
                ? 'warning'
                : 'danger'
            }
          />
        </div>
      </Card>

      {/* Highest Overspending Alert */}
      {highestOverspendingCategory && (
        <Card className="transition-all duration-200 fade-in">
          <div className="flex items-start gap-4 transition-all duration-200">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blood-red/20 flex items-center justify-center">
              <span className="text-2xl">🧟</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blood-red mb-2">
                ⚠️ Blockade Breach Alert: {highestOverspendingCategory.category.charAt(0).toUpperCase() + highestOverspendingCategory.category.slice(1)}
              </h3>
              <p className="text-sm text-ghost-white mb-2">
                Your {highestOverspendingCategory.category} defenses were overwhelmed by{' '}
                <span className="font-bold font-mono text-blood-red">
                  {formatCurrency(highestOverspendingCategory.overspendAmount)}
                </span>
                {' '}in zombie attacks
              </p>
              <p className="text-xs text-decay-gray">
                Defense capacity exceeded: {highestOverspendingCategory.utilizationPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Actionable Recommendations */}
      {recommendations.length > 0 && (
        <Card className="transition-all duration-200 fade-in">
          <h3 className="text-xl font-bold text-ghost-white mb-4 transition-all duration-200">
            📜 Survival Strategy
          </h3>

          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const priorityColors = {
                high: 'border-blood-red/30 bg-blood-red/5',
                medium: 'border-warning-orange/30 bg-warning-orange/5',
                low: 'border-toxic-green/30 bg-toxic-green/5',
              };

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${priorityColors[rec.priority]} transition-all duration-200 hover:scale-[1.01] hover:shadow-lg`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                    <p className="text-sm text-ghost-white leading-relaxed">
                      {rec.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card className="transition-all duration-200 fade-in">
        <h3 className="text-xl font-bold text-ghost-white mb-4 transition-all duration-200">
          🛡️ Blockade Status
        </h3>

        <div className="space-y-4">
          {budgets.map((budget) => {
            const isOverBudget = budget.spent > budget.amount;
            const displayUtilization = Math.min(budget.utilizationPercent, 100);

            return (
              <div key={budget.category}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-sm font-medium text-ghost-white capitalize">
                      {budget.category}
                    </p>
                    <p className="text-xs text-decay-gray">
                      {formatCurrency(budget.spent)} of{' '}
                      {formatCurrency(budget.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold font-mono ${getUtilizationColor(
                        budget.utilizationPercent
                      )}`}
                    >
                      {budget.utilizationPercent.toFixed(1)}%
                    </p>
                    {isOverBudget && (
                      <p className="text-xs text-blood-red">
                        💀 Breached by {formatCurrency(budget.spent - budget.amount)}
                      </p>
                    )}
                  </div>
                </div>
                <ProgressBar
                  value={displayUtilization}
                  max={100}
                  variant={
                    budget.utilizationPercent <= 75
                      ? 'healthy'
                      : budget.utilizationPercent <= 90
                      ? 'warning'
                      : 'danger'
                  }
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Spending Trends Compared to Budget */}
      <Card className="transition-all duration-200 fade-in">
        <h3 className="text-xl font-bold text-ghost-white mb-4 transition-all duration-200">
          📊 Spending Trends vs Budget
        </h3>

        <div className="space-y-6">
          {budgets.map((budget) => {
            const isOverBudget = budget.spent > budget.amount;
            const difference = budget.spent - budget.amount;
            const percentDifference = budget.amount > 0 
              ? ((difference / budget.amount) * 100).toFixed(1)
              : '0.0';

            // Determine trend status
            const trend =
              budget.utilizationPercent <= 75
                ? { label: '✅ Well Below Budget', color: 'text-toxic-green', icon: '🛡️' }
                : budget.utilizationPercent <= 90
                ? { label: '⚠️ Approaching Limit', color: 'text-warning-orange', icon: '⚔️' }
                : budget.utilizationPercent <= 100
                ? { label: '🔥 Near Capacity', color: 'text-warning-orange', icon: '🔥' }
                : { label: '💀 Over Budget', color: 'text-blood-red', icon: '🧟' };

            return (
              <div
                key={budget.category}
                className="p-4 rounded-lg bg-background-tertiary border border-decay-gray/20 transition-all duration-200 hover:border-decay-light hover:shadow-lg hover:scale-[1.01]"
              >
                {/* Category Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-base font-semibold text-ghost-white capitalize mb-1">
                      {trend.icon} {budget.category}
                    </h4>
                    <p className={`text-sm font-medium ${trend.color}`}>
                      {trend.label}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-decay-gray mb-1">Utilization</p>
                    <p
                      className={`text-lg font-bold font-mono ${
                        isOverBudget ? 'text-blood-red' : 'text-ghost-white'
                      }`}
                    >
                      {budget.utilizationPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Spending vs Budget Comparison */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-decay-gray mb-1">💰 Budget Allocated</p>
                    <p className="text-base font-mono text-ghost-white">
                      {formatCurrency(budget.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-decay-gray mb-1">💸 Amount Spent</p>
                    <p className={`text-base font-mono ${
                      isOverBudget ? 'text-blood-red' : 'text-ghost-white'
                    }`}>
                      {formatCurrency(budget.spent)}
                    </p>
                  </div>
                </div>

                {/* Difference Indicator */}
                <div className="flex items-center justify-between p-2 rounded bg-background-secondary">
                  <p className="text-xs text-decay-gray">
                    {isOverBudget ? '⚠️ Over by:' : '✅ Under by:'}
                  </p>
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${
                      isOverBudget ? 'text-blood-red' : 'text-toxic-green'
                    }`}>
                      {isOverBudget ? '+' : '-'}{formatCurrency(Math.abs(difference))}
                    </p>
                    <p className={`text-xs ${
                      isOverBudget ? 'text-blood-red/70' : 'text-toxic-green/70'
                    }`}>
                      ({isOverBudget ? '+' : '-'}{Math.abs(parseFloat(percentDifference))}%)
                    </p>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mt-3">
                  <ProgressBar
                    value={Math.min(budget.utilizationPercent, 100)}
                    max={100}
                    variant={
                      budget.utilizationPercent <= 75
                        ? 'healthy'
                        : budget.utilizationPercent <= 90
                        ? 'warning'
                        : 'danger'
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Trend Summary */}
        <div className="mt-6 p-4 rounded-lg bg-background-secondary border border-decay-gray/30">
          <h4 className="text-sm font-semibold text-ghost-white mb-3">
            📈 Overall Spending Trend
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-decay-gray mb-1">Categories On Track</p>
              <p className="text-xl font-bold text-toxic-green font-mono">
                {budgets.filter(b => b.utilizationPercent <= 90).length} / {budgets.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-decay-gray mb-1">Categories Over Budget</p>
              <p className="text-xl font-bold text-blood-red font-mono">
                {budgets.filter(b => b.utilizationPercent > 100).length} / {budgets.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-decay-gray mb-1">Average Utilization</p>
              <p className={`text-xl font-bold font-mono ${
                overallUtilization <= 75 
                  ? 'text-toxic-green' 
                  : overallUtilization <= 90 
                  ? 'text-warning-orange' 
                  : 'text-blood-red'
              }`}>
                {overallUtilization.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
