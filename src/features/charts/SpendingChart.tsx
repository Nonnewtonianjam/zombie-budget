import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import type { Transaction } from '../../types/transaction';

interface SpendingChartProps {
  /** Transactions to visualize */
  transactions: Transaction[];
  /** Optional budget configuration for comparison lines */
  budget?: {
    food: number;
    entertainment: number;
    shopping: number;
    subscriptions: number;
  };
  /** Optional class name for styling */
  className?: string;
}

interface ChartDataPoint {
  date: string;
  day: number;
  food: number;
  entertainment: number;
  shopping: number;
  subscriptions: number;
  foodBudget?: number;
  entertainmentBudget?: number;
  shoppingBudget?: number;
  subscriptionsBudget?: number;
}

// Category colors matching blockades
const CATEGORY_COLORS = {
  food: '#dc2626',           // Brighter red
  entertainment: '#f59e0b',  // Brighter orange
  shopping: '#8b5cf6',       // Purple
  subscriptions: '#10b981',  // Brighter green
};

/**
 * SpendingChart Component
 *
 * Displays cumulative spending per category over the month as a multi-line chart.
 * Updates in real-time during playback animation.
 *
 * Features:
 * - 4 lines showing spending per category (food, entertainment, shopping, subscriptions)
 * - Optional budget lines for each category
 * - Colors match blockade colors for visual consistency
 * - Responsive to container size
 * - Spooky theme styling (dark background, themed colors)
 * - Optimized for real-time updates during playback
 */
export function SpendingChart({
  transactions,
  budget,
  className = '',
}: SpendingChartProps) {
  // Calculate chart data with cumulative spending per category per day
  // Optimized for < 100ms updates during playback
  const chartData = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    // Get date range for the month - ensure dates are Date objects
    const dates = transactions.map((t) => t.date instanceof Date ? t.date : new Date(t.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const monthStart = startOfMonth(minDate);
    const monthEnd = endOfMonth(maxDate);

    // Generate all days in the month
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Sort transactions by date once - ensure dates are Date objects
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate cumulative spending per category for each day
    const cumulativeByCategory = {
      food: 0,
      entertainment: 0,
      shopping: 0,
      subscriptions: 0,
    };
    let transactionIndex = 0;

    const data: ChartDataPoint[] = allDays.map((day) => {
      const dayTime = day.getTime();
      
      // Add all transactions for this day
      while (transactionIndex < sortedTransactions.length) {
        const txDate = sortedTransactions[transactionIndex].date;
        const txTime = (txDate instanceof Date ? txDate : new Date(txDate)).getTime();
        
        if (txTime > dayTime) break;
        
        const tx = sortedTransactions[transactionIndex];
        // Only count bad spending (not savings or debt payment)
        if (!tx.isGoodSpending) {
          const category = tx.category as keyof typeof cumulativeByCategory;
          if (category in cumulativeByCategory) {
            cumulativeByCategory[category] += tx.amount;
          }
        }
        transactionIndex++;
      }

      const dataPoint: ChartDataPoint = {
        date: format(day, 'MMM d'),
        day: day.getDate(),
        food: cumulativeByCategory.food,
        entertainment: cumulativeByCategory.entertainment,
        shopping: cumulativeByCategory.shopping,
        subscriptions: cumulativeByCategory.subscriptions,
      };

      // Add budget lines if provided
      if (budget) {
        dataPoint.foodBudget = budget.food;
        dataPoint.entertainmentBudget = budget.entertainment;
        dataPoint.shoppingBudget = budget.shopping;
        dataPoint.subscriptionsBudget = budget.subscriptions;
      }

      return dataPoint;
    });

    return data;
  }, [transactions, budget]);

  // Custom tooltip with spooky styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background-secondary border border-decay-gray rounded-lg p-3 shadow-lg">
          <p className="text-ghost-white text-sm font-medium mb-2">
            {data.date}
          </p>
          <div className="space-y-1">
            <p className="text-sm" style={{ color: CATEGORY_COLORS.food }}>
              Food: ${data.food.toFixed(2)}
              {budget && <span className="text-ghost-dim text-xs ml-1">/ ${budget.food}</span>}
            </p>
            <p className="text-sm" style={{ color: CATEGORY_COLORS.entertainment }}>
              Entertainment: ${data.entertainment.toFixed(2)}
              {budget && <span className="text-ghost-dim text-xs ml-1">/ ${budget.entertainment}</span>}
            </p>
            <p className="text-sm" style={{ color: CATEGORY_COLORS.shopping }}>
              Shopping: ${data.shopping.toFixed(2)}
              {budget && <span className="text-ghost-dim text-xs ml-1">/ ${budget.shopping}</span>}
            </p>
            <p className="text-sm" style={{ color: CATEGORY_COLORS.subscriptions }}>
              Subscriptions: ${data.subscriptions.toFixed(2)}
              {budget && <span className="text-ghost-dim text-xs ml-1">/ ${budget.subscriptions}</span>}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-background-secondary rounded-lg border border-decay-gray ${className}`}
      >
        <p className="text-ghost-dim text-sm">No spending data to display</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full min-h-[250px] bg-background-card/50 backdrop-blur-sm rounded-2xl border-2 border-brand-purple/30 p-6 transition-all duration-300 hover:border-brand-purple/60 shadow-xl ${className}`}>
      <h3 className="text-neutral-100 text-lg font-bold mb-4">
        Spending by Category
      </h3>
      <ResponsiveContainer width="100%" height="100%" minHeight={150}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" opacity={0.2} />
          <XAxis
            dataKey="date"
            stroke="#c8c8d0"
            tick={{ fill: '#c8c8d0', fontSize: 11 }}
            tickLine={{ stroke: '#4a4a4a' }}
            axisLine={{ stroke: '#4a4a4a' }}
          />
          <YAxis
            stroke="#c8c8d0"
            tick={{ fill: '#c8c8d0', fontSize: 11 }}
            tickLine={{ stroke: '#4a4a4a' }}
            axisLine={{ stroke: '#4a4a4a' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#e8e8f0', fontSize: 11 }}
            iconType="line"
          />
          
          {/* Category spending lines */}
          <Line
            type="monotone"
            dataKey="food"
            stroke={CATEGORY_COLORS.food}
            strokeWidth={2.5}
            dot={{ fill: CATEGORY_COLORS.food, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CATEGORY_COLORS.food, strokeWidth: 2 }}
            name="Food"
            animationDuration={50}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="entertainment"
            stroke={CATEGORY_COLORS.entertainment}
            strokeWidth={2.5}
            dot={{ fill: CATEGORY_COLORS.entertainment, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CATEGORY_COLORS.entertainment, strokeWidth: 2 }}
            name="Entertainment"
            animationDuration={50}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="shopping"
            stroke={CATEGORY_COLORS.shopping}
            strokeWidth={2.5}
            dot={{ fill: CATEGORY_COLORS.shopping, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CATEGORY_COLORS.shopping, strokeWidth: 2 }}
            name="Shopping"
            animationDuration={50}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="subscriptions"
            stroke={CATEGORY_COLORS.subscriptions}
            strokeWidth={2.5}
            dot={{ fill: CATEGORY_COLORS.subscriptions, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: CATEGORY_COLORS.subscriptions, strokeWidth: 2 }}
            name="Subscriptions"
            animationDuration={50}
            isAnimationActive={true}
          />
          
          {/* Budget lines (dashed) - hidden from legend */}
          {budget && (
            <>
              <Line
                type="monotone"
                dataKey="foodBudget"
                stroke={CATEGORY_COLORS.food}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                animationDuration={50}
                isAnimationActive={true}
                opacity={0.5}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="entertainmentBudget"
                stroke={CATEGORY_COLORS.entertainment}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                animationDuration={50}
                isAnimationActive={true}
                opacity={0.5}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="shoppingBudget"
                stroke={CATEGORY_COLORS.shopping}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                animationDuration={50}
                isAnimationActive={true}
                opacity={0.5}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="subscriptionsBudget"
                stroke={CATEGORY_COLORS.subscriptions}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                animationDuration={50}
                isAnimationActive={true}
                opacity={0.5}
                legendType="none"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
