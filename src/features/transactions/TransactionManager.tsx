/**
 * TransactionManager Component
 * 
 * Complete transaction management interface with CRUD operations.
 * Combines TransactionForm and TransactionList with state management.
 */

import React, { useState } from 'react';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { useTransactions } from '@/hooks/useTransactions';
import type { Transaction } from '@/types/transaction';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/**
 * TransactionManager Component
 * 
 * Provides a complete interface for managing transactions:
 * - Add new transactions
 * - Edit existing transactions
 * - Delete transactions
 * - View filtered transaction list
 */
export const TransactionManager: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    error,
  } = useTransactions();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);

  /**
   * Handle form submission for new or edited transaction
   */
  const handleSubmit = (transaction: Transaction) => {
    if (editingTransaction) {
      updateTransaction(transaction);
      setEditingTransaction(null);
    } else {
      addTransaction(transaction);
    }
    setShowForm(false);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = (transactionId: string) => {
    // Confirm deletion
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(transactionId);
    }
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    setEditingTransaction(null);
    setShowForm(false);
  };

  /**
   * Handle add new transaction button click
   */
  const handleAddNew = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

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

      {/* Transaction Form */}
      {showForm ? (
        <Card>
          <h2 className="text-xl font-semibold text-ghost-white mb-6">
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <TransactionForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialValues={editingTransaction || undefined}
            isEditing={!!editingTransaction}
          />
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleAddNew}>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Transaction
          </Button>
        </div>
      )}

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
