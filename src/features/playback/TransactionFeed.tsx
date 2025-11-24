/**
 * TransactionFeed Component
 * 
 * Scrolling transaction feed for playback view.
 * Displays transactions chronologically with real-time highlighting.
 * 
 * Features:
 * - Displays amount, category, date, description
 * - Highlights current transaction being animated
 * - Color-codes transactions (blood red for bad, toxic green for good)
 * - Auto-scrolls to keep current transaction visible
 * - Updates within 50ms of transaction timing
 * 
 * Requirements: 16.1-16.7
 */

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { Transaction } from '../../types/transaction';

interface TransactionFeedProps {
  /** All transactions to display */
  transactions: Transaction[];
  /** Current transaction being animated (ID) */
  currentTransactionId: string | null;
  /** Optional className for styling */
  className?: string;
}

/**
 * Format currency amount with proper styling
 */
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Get category display name
 */
function getCategoryDisplay(category: string): string {
  const categoryMap: Record<string, string> = {
    food: 'Food',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    subscriptions: 'Subscriptions',
    savings: 'Savings',
    debt_payment: 'Debt Payment',
  };
  return categoryMap[category] || category;
}

export function TransactionFeed({
  transactions,
  currentTransactionId,
  className = '',
}: TransactionFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const currentItemRef = useRef<HTMLDivElement>(null);

  // Sort transactions chronologically
  // Ensure dates are Date objects (they might be strings from localStorage)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Auto-scroll to keep current transaction visible (with delay to slow down)
  useEffect(() => {
    if (currentItemRef.current && feedRef.current) {
      // Add a small delay to make scrolling feel less frantic
      const scrollTimeout = setTimeout(() => {
        currentItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest', // Changed from 'center' to 'nearest' for less aggressive scrolling
        });
      }, 200); // 200ms delay to slow down the scroll
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [currentTransactionId]);

  return (
    <div
      ref={feedRef}
      className={`overflow-y-auto overflow-x-hidden ${className}`}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#8b5cf6 #1a1a24',
      }}
    >
      <h3 className="text-neutral-100 text-xl font-bold mb-4 sticky top-0 pb-3 z-10 border-b-2 border-brand-purple/30" style={{ backgroundColor: '#0f0a1f' }}>
        Recent Transactions
      </h3>

      {sortedTransactions.length === 0 ? (
        <div className="text-ghost-dim text-sm text-center py-8">
          No transactions to display
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTransactions.map((transaction) => {
            const isCurrent = transaction.id === currentTransactionId;
            const isGood = transaction.isGoodSpending;

            return (
              <div
                key={transaction.id}
                ref={isCurrent ? currentItemRef : null}
                className={`
                  p-4 rounded-xl transition-all duration-200
                  ${
                    isCurrent
                      ? isGood
                        ? 'bg-accent-green/20 border-2 border-accent-green shadow-lg shadow-accent-green/30 animate-pulse-subtle'
                        : 'bg-accent-red/20 border-2 border-accent-red shadow-lg shadow-accent-red/30 animate-pulse-subtle'
                      : 'bg-background-tertiary/50 border border-brand-purple/20 hover:bg-background-tertiary/80 hover:border-brand-purple/40'
                  }
                `}
              >
                {/* Amount and Category */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`
                      text-xl font-bold font-mono transition-colors duration-200
                      ${
                        isCurrent
                          ? isGood
                            ? 'text-toxic-green'
                            : 'text-blood-red'
                          : 'text-ghost-white'
                      }
                    `}
                  >
                    {formatAmount(transaction.amount)}
                  </span>
                  <span
                    className={`
                      text-xs px-2 py-1 rounded transition-all duration-200
                      ${
                        isCurrent
                          ? isGood
                            ? 'bg-toxic-green/30 text-toxic-green'
                            : 'bg-blood-red/30 text-blood-red'
                          : 'bg-decay-gray/30 text-ghost-dim'
                      }
                    `}
                  >
                    {getCategoryDisplay(transaction.category)}
                  </span>
                </div>

                {/* Description */}
                <div
                  className={`
                    text-sm mb-1 transition-colors duration-200
                    ${isCurrent ? 'text-ghost-white' : 'text-ghost-dim'}
                  `}
                >
                  {transaction.description}
                </div>

                {/* Date */}
                <div
                  className={`
                    text-xs font-mono transition-colors duration-200
                    ${isCurrent ? 'text-ghost-white/80' : 'text-ghost-dim/60'}
                  `}
                >
                  {format(transaction.date, 'MMM d, yyyy')}
                </div>

                {/* Current indicator with animation */}
                {isCurrent && (
                  <div
                    className={`
                      mt-2 text-xs font-semibold uppercase tracking-wide flex items-center gap-2
                      ${isGood ? 'text-toxic-green' : 'text-blood-red'}
                    `}
                  >
                    <span className="animate-pulse-subtle">
                      {isGood ? '✓' : '⚠'}
                    </span>
                    <span>{isGood ? 'Healing Blockades' : 'Zombie Spawned'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
