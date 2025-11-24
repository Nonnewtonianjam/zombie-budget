/**
 * DemoModeToggle Component
 * 
 * Toggle button for activating/deactivating demo mode.
 * Displays current demo mode status and provides clear visual feedback.
 */

import React from 'react';
import { Button } from './Button';
import { useDemoMode } from '@/hooks/useDemoMode';

interface DemoModeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
}

/**
 * DemoModeToggle Component
 * 
 * Provides a button to toggle demo mode on/off.
 * Shows clear visual indication of current demo mode status.
 */
export const DemoModeToggle: React.FC<DemoModeToggleProps> = ({
  className = '',
  size = 'medium',
}) => {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Demo Mode Indicator */}
      {isDemoMode && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-orange/20 border border-accent-orange rounded-lg">
          <div className="w-2 h-2 bg-accent-orange rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-accent-orange uppercase tracking-wide">
            Demo Mode
          </span>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        variant={isDemoMode ? 'danger' : 'secondary'}
        size={size}
        onClick={toggleDemoMode}
        className={`flex items-center gap-2 ${isDemoMode ? 'bg-accent-red hover:bg-accent-red-dark' : 'border-brand-purple/30 hover:border-brand-purple/60'}`}
      >
        {isDemoMode ? (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear Demo
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Load Demo
          </>
        )}
      </Button>
    </div>
  );
};
