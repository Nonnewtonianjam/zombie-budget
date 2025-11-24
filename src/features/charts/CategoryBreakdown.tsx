import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { Transaction, TransactionCategory } from '../../types/transaction';

interface CategoryBreakdownProps {
  /** Transactions to analyze */
  transactions: Transaction[];
  /** Optional class name for styling */
  className?: string;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

/**
 * Category colors matching the spooky theme
 * Maps transaction categories to their visual representation
 */
const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  food: '#a83232', // Blood red
  entertainment: '#d97548', // Warning orange
  shopping: '#8b5cf6', // Purple
  subscriptions: '#4a9d5f', // Toxic green
  savings: '#4a9d5f', // Toxic green (good spending)
  debt_payment: '#4a9d5f', // Toxic green (good spending)
};

/**
 * Category display names
 */
const CATEGORY_NAMES: Record<TransactionCategory, string> = {
  food: 'Food',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  subscriptions: 'Subscriptions',
  savings: 'Savings',
  debt_payment: 'Debt Payment',
};

/**
 * CategoryBreakdown Component
 *
 * Displays spending distribution across categories as a pie chart.
 * Shows percentage and amount for each category.
 *
 * Features:
 * - Pie chart with category breakdown
 * - Color-coded by category
 * - Percentage and amount labels
 * - Interactive hover states
 * - Responsive to container size
 * - Spooky theme styling
 */
export function CategoryBreakdown({
  transactions,
  className = '',
}: CategoryBreakdownProps) {
  // Calculate spending by category
  // Optimized for < 100ms updates during playback
  // Use JSON.stringify to ensure memo updates when transaction array changes
  const categoryData = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    // Group transactions by category and sum amounts
    const categoryTotals = new Map<TransactionCategory, number>();

    // Single pass through transactions
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      // Only count bad spending for the breakdown
      if (!transaction.isGoodSpending) {
        const current = categoryTotals.get(transaction.category) || 0;
        categoryTotals.set(transaction.category, current + transaction.amount);
      }
    }

    // Calculate total spending
    let totalSpending = 0;
    for (const amount of categoryTotals.values()) {
      totalSpending += amount;
    }

    // If no spending yet, return empty
    if (totalSpending === 0) {
      return [];
    }

    // Convert to chart data format
    const data: CategoryData[] = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category: CATEGORY_NAMES[category],
        amount,
        percentage: (amount / totalSpending) * 100,
        color: CATEGORY_COLORS[category],
      }))
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending

    return data;
  }, [transactions.length, transactions.map(t => t.id).join(',')]);

  // Custom tooltip with spooky styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryData;
      return (
        <div className="bg-background-secondary border border-decay-gray rounded-lg p-3 shadow-lg">
          <p className="text-ghost-white text-sm font-medium mb-1">
            {data.category}
          </p>
          <p className="text-ghost-dim text-sm">
            ${data.amount.toFixed(2)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label renderer with spooky styling
  const renderLabel = (entry: any) => {
    const data = entry as CategoryData;
    return `${data.percentage.toFixed(0)}%`;
  };

  if (categoryData.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-background-secondary rounded-lg border border-decay-gray ${className}`}
      >
        <p className="text-ghost-dim text-sm">No spending data to display</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[250px] bg-background-card/50 backdrop-blur-sm rounded-2xl border-2 border-brand-purple/30 p-6 transition-all duration-300 hover:border-brand-purple/60 shadow-xl flex flex-col ${className}`}>
      <h3 className="text-neutral-100 text-lg font-bold mb-4 flex items-center gap-2 flex-shrink-0">
        <span className="text-accent-orange text-2xl">📊</span>
        <span>Spending by Category</span>
      </h3>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ResponsiveContainer width="100%" height="100%" minHeight={150}>
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={categoryData}
              dataKey="amount"
              nameKey="category"
              cx="35%"
              cy="50%"
              outerRadius="60%"
              label={renderLabel}
              labelLine={false}
              animationDuration={50}
              isAnimationActive={true}
            >
              {categoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="#0a0a0f"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ color: '#e8e8f0', fontSize: 11, paddingLeft: '10px' }}
              iconType="circle"
              formatter={(value, entry: any) => {
                const data = entry.payload as CategoryData;
                return `${value}: $${data.amount.toFixed(0)}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
