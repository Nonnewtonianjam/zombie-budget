/**
 * useLocalStorage Hook
 * 
 * Custom hook for managing localStorage with automatic serialization,
 * error handling, data validation, and schema migration support.
 * 
 * Features:
 * - Automatic JSON serialization/deserialization
 * - Error handling for QuotaExceededError and invalid JSON
 * - Data validation on read with type guards
 * - Automatic schema migration for data format changes
 * - Graceful fallback to in-memory storage
 * - Optional cross-tab synchronization
 * - Type-safe with TypeScript generics
 * 
 * Basic Usage:
 * ```typescript
 * const [value, setValue, remove, error] = useLocalStorage('key', defaultValue);
 * 
 * // Handle QuotaExceededError
 * if (error?.name === 'QuotaExceededError') {
 *   // Show user notification to clear data
 * }
 * ```
 * 
 * With Validation and Migration:
 * ```typescript
 * const [data, setData, remove, error] = useLocalStorage('key', defaultValue, {
 *   validator: (value): value is MyType => {
 *     // Check if data matches current schema
 *     return typeof value === 'object' && 'requiredField' in value;
 *   },
 *   migrate: (oldValue) => {
 *     // Transform old schema to new schema
 *     return { ...oldValue, newField: 'default' };
 *   },
 *   syncAcrossTabs: true
 * });
 * ```
 * 
 * Migration Flow:
 * 1. Data is loaded from localStorage
 * 2. If validator is provided and fails, migration is attempted
 * 3. If migration succeeds, migrated data is saved and returned
 * 4. If migration fails or no migrator provided, default value is used
 */

import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  /**
   * Validator function to check if loaded data is valid
   * Returns true if valid, false otherwise
   * 
   * @example
   * validator: (value): value is Transaction[] => {
   *   return Array.isArray(value) && value.every(tx => 'id' in tx && 'amount' in tx);
   * }
   */
  validator?: (value: unknown) => value is T;
  
  /**
   * Migration function to transform old data formats to new schema
   * Called automatically when validator fails but data exists in localStorage
   * 
   * Use this to handle schema changes over time:
   * - Rename fields (e.g., 'value' -> 'amount')
   * - Change data types (e.g., Unix timestamp -> Date object)
   * - Add new required fields with default values
   * - Transform nested structures
   * 
   * If migration succeeds, the migrated data is automatically saved to localStorage
   * If migration fails, the default value is used instead
   * 
   * @example
   * migrate: (oldValue) => {
   *   // Migrate from V1 to V2 schema
   *   if (oldValue.version === 1) {
   *     return {
   *       version: 2,
   *       data: transformV1ToV2(oldValue.data)
   *     };
   *   }
   *   throw new Error('Unknown schema version');
   * }
   */
  migrate?: (oldValue: unknown) => T;
  
  /**
   * Whether to sync changes across tabs/windows
   * Default: false
   */
  syncAcrossTabs?: boolean;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Custom hook for localStorage with error handling and validation
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void, Error | null] {
  const { validator, migrate, syncAcrossTabs = false } = options;
  
  const [isAvailable] = useState(isLocalStorageAvailable());
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize state from localStorage or default value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isAvailable) {
      console.warn(`localStorage is not available. Using in-memory storage for key: ${key}`);
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      
      if (item === null) {
        return defaultValue;
      }

      const parsed = JSON.parse(item);
      
      // Validate data if validator provided
      if (validator && !validator(parsed)) {
        console.warn(`Invalid data in localStorage for key: ${key}`);
        
        // Try migration if available
        if (migrate) {
          try {
            const migrated = migrate(parsed);
            localStorage.setItem(key, JSON.stringify(migrated));
            return migrated;
          } catch (migrationError) {
            console.error(`Migration failed for key: ${key}`, migrationError);
            return defaultValue;
          }
        }
        
        return defaultValue;
      }

      return parsed as T;
    } catch (err) {
      console.error(`Error reading from localStorage for key: ${key}`, err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return defaultValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function for functional updates
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);
        
        if (isAvailable) {
          localStorage.setItem(key, JSON.stringify(valueToStore));
          setError(null);
        }
      } catch (err) {
        // Handle QuotaExceededError
        if (err instanceof Error && err.name === 'QuotaExceededError') {
          const quotaError = new Error(
            'localStorage quota exceeded. Please clear some data or export your transactions.'
          );
          setError(quotaError);
          console.error('localStorage quota exceeded', err);
        } else {
          const storageError = new Error('Failed to save to localStorage');
          setError(storageError);
          console.error(`Error writing to localStorage for key: ${key}`, err);
        }
      }
    },
    [key, storedValue, isAvailable]
  );

  // Remove item from localStorage
  const remove = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      
      if (isAvailable) {
        localStorage.removeItem(key);
        setError(null);
      }
    } catch (err) {
      const removeError = new Error('Failed to remove from localStorage');
      setError(removeError);
      console.error(`Error removing from localStorage for key: ${key}`, err);
    }
  }, [key, defaultValue, isAvailable]);

  // Sync across tabs/windows if enabled
  useEffect(() => {
    if (!syncAcrossTabs || !isAvailable) {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue);
          
          // Validate if validator provided
          if (validator && !validator(parsed)) {
            console.warn(`Invalid synced data for key: ${key}`);
            return;
          }
          
          setStoredValue(parsed as T);
        } catch (err) {
          console.error(`Error parsing synced storage for key: ${key}`, err);
        }
      } else if (e.key === key && e.newValue === null) {
        // Key was removed in another tab
        setStoredValue(defaultValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue, validator, syncAcrossTabs, isAvailable]);

  return [storedValue, setValue, remove, error];
}

/**
 * Simple version without options for common use cases
 */
export function useSimpleLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, () => void, Error | null] {
  const [value, setValue, remove, error] = useLocalStorage(key, defaultValue);
  
  const simpleSetValue = useCallback(
    (newValue: T) => setValue(newValue),
    [setValue]
  );
  
  return [value, simpleSetValue, remove, error];
}
