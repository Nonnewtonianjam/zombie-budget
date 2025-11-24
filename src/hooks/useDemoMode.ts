/**
 * useDemoMode Hook
 * 
 * Manages demo mode state and provides functions to activate/deactivate demo mode.
 * When activated, loads realistic sample data. When deactivated, clears demo data.
 */

import { useState, useCallback } from 'react';
import { useTransactions } from './useTransactions';
import { generateDemoData, generateDemoBudget } from '@/lib/demoData';

/**
 * Hook for managing demo mode
 */
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { replaceTransactions, clearTransactions } = useTransactions();

  /**
   * Activate demo mode
   * Loads realistic sample transactions and budget configuration
   */
  const activateDemoMode = useCallback(() => {
    // Check if demo data already exists
    const existingData = localStorage.getItem('zombie-budget-transactions');
    if (existingData) {
      try {
        const parsed = JSON.parse(existingData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Data already exists, just set demo mode flag
          setIsDemoMode(true);
          if (import.meta.env.DEV) {
            console.log('[DemoMode] Using existing data:', parsed.length, 'transactions');
          }
          return;
        }
      } catch (e) {
        // Invalid data, continue with generation
      }
    }

    // Generate demo data
    const demoTransactions = generateDemoData();
    const demoBudget = generateDemoBudget();

    // Replace current data with demo data
    replaceTransactions(demoTransactions);
    
    // Store demo budget in localStorage
    localStorage.setItem('zombie-budget-config', JSON.stringify(demoBudget));

    // Set demo mode flag
    setIsDemoMode(true);

    if (import.meta.env.DEV) {
      console.log('[DemoMode] Activated with:', {
        transactions: demoTransactions.length,
        budget: demoBudget,
      });
    }
  }, [replaceTransactions]);

  /**
   * Deactivate demo mode
   * Clears all demo data and returns to empty state
   */
  const deactivateDemoMode = useCallback(() => {
    // Clear all transactions from localStorage
    clearTransactions();

    // Clear budget configuration from localStorage
    localStorage.removeItem('zombie-budget-config');

    // Clear demo mode flag
    setIsDemoMode(false);

    if (import.meta.env.DEV) {
      console.log('[DemoMode] Deactivated - all demo data cleared');
    }
  }, [clearTransactions]);

  /**
   * Toggle demo mode on/off
   */
  const toggleDemoMode = useCallback(() => {
    if (isDemoMode) {
      deactivateDemoMode();
    } else {
      activateDemoMode();
    }
  }, [isDemoMode, activateDemoMode, deactivateDemoMode]);

  return {
    isDemoMode,
    activateDemoMode,
    deactivateDemoMode,
    toggleDemoMode,
  };
}
