import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Transaction, TransactionCategory } from '@/types/transaction';
import { isGoodSpending } from '@/types/transaction';

/**
 * Zod schema for transaction form validation
 */
const transactionSchema = z.object({
  amount: z
    .number({
      message: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .finite('Amount must be a valid number'),
  category: z.enum(
    ['food', 'entertainment', 'shopping', 'subscriptions', 'savings', 'debt_payment'],
    {
      message: 'Please select a category',
    }
  ),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine(
      (dateStr) => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      },
      { message: 'Invalid date format' }
    )
    .refine(
      (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        return date <= now;
      },
      { message: 'Date cannot be in the future' }
    ),
  description: z.string().max(200, 'Description must be 200 characters or less'),
});

/**
 * Type for form data derived from Zod schema
 */
type TransactionFormData = z.infer<typeof transactionSchema>;

/**
 * Props for TransactionForm component
 */
export interface TransactionFormProps {
  /** Callback when form is submitted with valid data */
  onSubmit: (transaction: Transaction) => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Initial values for editing existing transaction */
  initialValues?: Partial<Transaction>;
  /** Whether the form is in edit mode */
  isEditing?: boolean;
}

/**
 * Category options for the select dropdown
 */
const CATEGORY_OPTIONS: { value: TransactionCategory; label: string }[] = [
  { value: 'food', label: 'Food' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'savings', label: 'Savings' },
  { value: 'debt_payment', label: 'Debt Payment' },
];

/**
 * TransactionForm Component
 *
 * Form for creating and editing transactions with validation.
 * Uses React Hook Form for form state management and Zod for validation.
 */
export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isEditing = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: initialValues?.amount || undefined,
      category: initialValues?.category || undefined,
      date: initialValues?.date
        ? new Date(initialValues.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      description: initialValues?.description || '',
    },
  });

  /**
   * Handle form submission
   */
  const onFormSubmit = (data: TransactionFormData) => {
    const now = new Date();
    const transactionDate = new Date(data.date);

    const transaction: Transaction = {
      id: initialValues?.id || uuidv4(),
      amount: data.amount,
      category: data.category as TransactionCategory,
      date: transactionDate,
      description: data.description || '',
      isGoodSpending: isGoodSpending(data.category as TransactionCategory),
      createdAt: initialValues?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(transaction);
    
    // Reset form after successful submission (only for new transactions)
    if (!isEditing) {
      reset();
    }
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Amount Field */}
      <div>
        <Input
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
      </div>

      {/* Category Field */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-ghost-white mb-2"
        >
          Category
        </label>
        <select
          id="category"
          className={`w-full px-4 py-2 font-sans text-ghost-white bg-background-secondary border rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
            errors.category
              ? 'border-blood-red focus:ring-blood-red focus:border-blood-red hover:border-blood-red hover:shadow-lg hover:shadow-blood-red/20'
              : 'border-decay-gray focus:ring-toxic-green focus:border-toxic-green hover:border-decay-light hover:shadow-lg hover:shadow-decay-gray/30'
          }`}
          {...register('category')}
        >
          <option value="">Select a category</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-2 text-sm text-blood-red flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.category.message}
          </p>
        )}
      </div>

      {/* Date Field */}
      <div>
        <Input
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      {/* Description Field */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-ghost-white mb-2"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={200}
          placeholder="Add a description..."
          className={`w-full px-4 py-2 font-sans text-ghost-white bg-background-secondary border rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary placeholder:text-ghost-dim/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
            errors.description
              ? 'border-blood-red focus:ring-blood-red focus:border-blood-red hover:border-blood-red hover:shadow-lg hover:shadow-blood-red/20'
              : 'border-decay-gray focus:ring-toxic-green focus:border-toxic-green hover:border-decay-light hover:shadow-lg hover:shadow-decay-gray/30'
          }`}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-2 text-sm text-blood-red flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.description.message}
          </p>
        )}
        <p className="mt-2 text-sm text-ghost-dim">
          {register('description').name && (
            <span>Maximum 200 characters</span>
          )}
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEditing ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </div>
    </form>
  );
};
