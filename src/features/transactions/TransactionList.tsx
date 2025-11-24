import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Transaction, TransactionCategory } from '@/types/transaction';
import { format } from 'date-fns';

/**
 * Props for TransactionList component
 */
export interface TransactionListProps {
  /** Array of transactions to display */
  transactions: Transaction[];
  /** Callback when edit button is clicked */
  onEdit?: (transaction: Transaction) => void;
  /** Callback when delete button is clicked */
  onDelete?: (transactionId: string) => void;
}

/**
 * Category filter options
 */
const CATEGORY_FILTERS: { value: TransactionCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'food', label: 'Food' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'savings', label: 'Savings' },
  { value: 'debt_payment', label: 'Debt Payment' },
];

/**
 * Get category color classes based on transaction type
 */
function getCategoryColor(isGoodSpending: boolean): string {
  if (isGoodSpending) {
    return 'text-accent-green border-accent-green/30 bg-accent-green/10';
  }
  return 'text-accent-red border-accent-red/30 bg-accent-red/10';
}

/**
 * Get category label
 */
function getCategoryLabel(category: TransactionCategory): string {
  const labels: Record<TransactionCategory, string> = {
    food: 'Food',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    subscriptions: 'Subscriptions',
    savings: 'Savings',
    debt_payment: 'Debt Payment',
  };
  return labels[category];
}

/**
 * TransactionItem Component
 * 
 * Displays a single transaction with edit and delete actions
 */
interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete }) => {
  const categoryColor = getCategoryColor(transaction.isGoodSpending);
  const categoryLabel = getCategoryLabel(transaction.category);

  return (
    <div className="flex items-center justify-between p-4 border border-brand-purple/20 rounded-lg hover:border-brand-purple/40 hover:shadow-lg hover:shadow-brand-purple/20 transition-all duration-200 bg-background-card/30">
      {/* Transaction Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          {/* Category Badge */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${categoryColor}`}
          >
            {categoryLabel}
          </span>
          
          {/* Amount */}
          <span className={`text-lg font-mono font-semibold ${transaction.isGoodSpending ? 'text-accent-green' : 'text-accent-red'}`}>
            ${transaction.amount.toFixed(2)}
          </span>
        </div>

        {/* Description */}
        {transaction.description && (
          <p className="text-sm text-neutral-400 mb-1 truncate">
            {transaction.description}
          </p>
        )}

        {/* Date */}
        <p className="text-xs text-neutral-500">
          {format(new Date(transaction.date), 'MMM dd, yyyy')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        {onEdit && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => onEdit(transaction)}
            aria-label="Edit transaction"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Button>
        )}
        {onDelete && (
          <Button
            variant="danger"
            size="small"
            onClick={() => onDelete(transaction.id)}
            aria-label="Delete transaction"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * TransactionList Component
 * 
 * Displays a list of transactions with filtering by category and date range.
 * Supports edit and delete actions for each transaction.
 */
export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'all'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  /**
   * Filter transactions based on selected filters
   */
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.category === categoryFilter);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((tx) => new Date(tx.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((tx) => new Date(tx.date) <= end);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [transactions, categoryFilter, startDate, endDate]);

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = categoryFilter !== 'all' || startDate !== '' || endDate !== '';

  return (
    <Card>
      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ghost-white">Transactions</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="small" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label
              htmlFor="category-filter"
              className="block text-sm font-medium text-ghost-white mb-2"
            >
              Category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TransactionCategory | 'all')}
              className="w-full px-4 py-2 font-sans text-ghost-white bg-background-secondary border border-decay-gray rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-toxic-green focus:border-toxic-green hover:border-decay-light hover:shadow-lg hover:shadow-decay-gray/30 min-h-[44px]"
            >
              {CATEGORY_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label
              htmlFor="start-date-filter"
              className="block text-sm font-medium text-ghost-white mb-2"
            >
              Start Date
            </label>
            <input
              id="start-date-filter"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 font-sans text-ghost-white bg-background-secondary border border-decay-gray rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-toxic-green focus:border-toxic-green hover:border-decay-light hover:shadow-lg hover:shadow-decay-gray/30 min-h-[44px]"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label
              htmlFor="end-date-filter"
              className="block text-sm font-medium text-ghost-white mb-2"
            >
              End Date
            </label>
            <input
              id="end-date-filter"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 font-sans text-ghost-white bg-background-secondary border border-decay-gray rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-toxic-green focus:border-toxic-green hover:border-decay-light hover:shadow-lg hover:shadow-decay-gray/30 min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-decay-gray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-ghost-dim text-lg mb-2">No transactions found</p>
            <p className="text-ghost-dim text-sm">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Add your first transaction to get started'}
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-ghost-dim mb-3">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </>
        )}
      </div>
    </Card>
  );
};
