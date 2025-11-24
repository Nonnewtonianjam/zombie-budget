/**
 * Insights Generator
 * 
 * Analyzes spending patterns and generates actionable financial insights
 */

import type { Transaction } from '../types/transaction';

export interface Insight {
  type: 'warning' | 'opportunity' | 'trend' | 'achievement';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: string;
  metric?: string;
}

export function generateInsights(
  transactions: Transaction[],
  budgetConfig: { food: number; entertainment: number; shopping: number; subscriptions: number }
): Insight[] {
  const insights: Insight[] = [];

  if (transactions.length === 0) return insights;

  // Calculate spending by category
  const spending = {
    food: 0,
    entertainment: 0,
    shopping: 0,
    subscriptions: 0,
  };

  transactions.forEach(tx => {
    if (!tx.isGoodSpending && tx.category in spending) {
      spending[tx.category as keyof typeof spending] += tx.amount;
    }
  });

  // Analyze each category
  Object.entries(spending).forEach(([category, amount]) => {
    const budget = budgetConfig[category as keyof typeof budgetConfig];
    const utilization = budget > 0 ? (amount / budget) * 100 : 0;

    console.log(`📊 Insight Analysis - ${category}: $${amount.toFixed(0)} / $${budget.toFixed(0)} (${utilization.toFixed(0)}%)`);

    // Over-budget warning
    if (utilization > 100) {
      insights.push({
        type: 'warning',
        category,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Budget Exceeded`,
        description: `You've spent $${amount.toFixed(0)} against a budget of $${budget.toFixed(0)}, exceeding by ${(utilization - 100).toFixed(0)}%.`,
        impact: 'high',
        actionable: `Reduce ${category} spending by $${(amount - budget).toFixed(0)} to get back on track.`,
        metric: `${utilization.toFixed(0)}% utilized`,
      });
    }
    // Near budget warning
    else if (utilization > 80 && utilization <= 100) {
      insights.push({
        type: 'warning',
        category,
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Budget Nearly Exhausted`,
        description: `You've used ${utilization.toFixed(0)}% of your ${category} budget with $${(budget - amount).toFixed(0)} remaining.`,
        impact: 'medium',
        actionable: `Monitor ${category} spending closely for the rest of the month.`,
        metric: `$${(budget - amount).toFixed(0)} remaining`,
      });
    }
    // Good performance
    else if (utilization < 50 && amount > 0) {
      insights.push({
        type: 'achievement',
        category,
        title: `Excellent ${category.charAt(0).toUpperCase() + category.slice(1)} Management`,
        description: `You've only used ${utilization.toFixed(0)}% of your ${category} budget, showing strong financial discipline.`,
        impact: 'low',
        actionable: `Consider reallocating $${((budget - amount) * 0.3).toFixed(0)} to savings or debt payment.`,
        metric: `${utilization.toFixed(0)}% utilized`,
      });
    }
  });

  // Analyze spending trends
  const sortedTx = [...transactions].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  if (sortedTx.length >= 5) {
    const recentTx = sortedTx.slice(-5);
    const avgRecent = recentTx.reduce((sum, tx) => sum + (tx.isGoodSpending ? 0 : tx.amount), 0) / 5;
    const olderTx = sortedTx.slice(0, Math.min(5, sortedTx.length - 5));
    const avgOlder = olderTx.length > 0 
      ? olderTx.reduce((sum, tx) => sum + (tx.isGoodSpending ? 0 : tx.amount), 0) / olderTx.length 
      : avgRecent;

    if (avgRecent > avgOlder * 1.3) {
      insights.push({
        type: 'trend',
        category: 'overall',
        title: 'Spending Velocity Increasing',
        description: `Your recent transactions average $${avgRecent.toFixed(0)}, up ${((avgRecent / avgOlder - 1) * 100).toFixed(0)}% from earlier this month.`,
        impact: 'high',
        actionable: 'Review recent purchases and identify areas to cut back before month-end.',
        metric: `+${((avgRecent / avgOlder - 1) * 100).toFixed(0)}% trend`,
      });
    } else if (avgRecent < avgOlder * 0.7) {
      insights.push({
        type: 'achievement',
        category: 'overall',
        title: 'Spending Discipline Improving',
        description: `Your recent transactions average $${avgRecent.toFixed(0)}, down ${((1 - avgRecent / avgOlder) * 100).toFixed(0)}% from earlier this month.`,
        impact: 'medium',
        actionable: 'Maintain this positive trend through month-end for maximum savings.',
        metric: `-${((1 - avgRecent / avgOlder) * 100).toFixed(0)}% trend`,
      });
    }
  }

  // Analyze transaction frequency
  const txByCategory = transactions.reduce((acc, tx) => {
    if (!tx.isGoodSpending) {
      acc[tx.category] = (acc[tx.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  Object.entries(txByCategory).forEach(([category, count]) => {
    if (count >= 10) {
      insights.push({
        type: 'opportunity',
        category,
        title: `High ${category.charAt(0).toUpperCase() + category.slice(1)} Transaction Frequency`,
        description: `You've made ${count} ${category} transactions this month, suggesting frequent small purchases.`,
        impact: 'medium',
        actionable: `Consider bulk purchasing or subscription services to reduce ${category} transaction costs.`,
        metric: `${count} transactions`,
      });
    }
  });

  // Sort by impact
  const impactOrder = { high: 0, medium: 1, low: 2 };
  return insights.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
}
