/**
 * App Store (Zustand)
 * 
 * Global state management for application-wide state.
 * Manages demo mode, navigation, and other app-level concerns.
 * 
 * @example
 * // Use entire store
 * const { isDemoMode, setDemoMode, toggleDemoMode } = useAppStore();
 * 
 * @example
 * // Use selector for optimized re-renders
 * const isDemoMode = useAppStore(selectDemoMode);
 * 
 * @example
 * // Use multiple selectors
 * const { soundEnabled, animationsEnabled } = useAppStore(selectUserPreferences);
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * App store state interface
 */
interface AppState {
  // Demo mode
  isDemoMode: boolean;
  
  // User preferences
  hasVisitedBefore: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  
  // UI state
  isSidebarOpen: boolean;
  currentView: 'dashboard' | 'playback' | 'insights';
  
  // Actions - Demo mode
  setDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  
  // Actions - User preferences
  setHasVisitedBefore: (visited: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  toggleAnimations: () => void;
  
  // Actions - UI
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentView: (view: 'dashboard' | 'playback' | 'insights') => void;
  
  // Actions - Reset
  resetAppState: () => void;
}

/**
 * Create app store with Zustand
 * 
 * Uses persist middleware to save preferences to localStorage
 * Uses devtools middleware for debugging in development
 */
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        isDemoMode: false,
        hasVisitedBefore: false,
        soundEnabled: true,
        animationsEnabled: true,
        isSidebarOpen: false,
        currentView: 'dashboard',

        // Demo mode actions
        setDemoMode: (enabled) =>
          set({ isDemoMode: enabled }, false, 'setDemoMode'),

        toggleDemoMode: () =>
          set((state) => ({ isDemoMode: !state.isDemoMode }), false, 'toggleDemoMode'),

        // User preference actions
        setHasVisitedBefore: (visited) =>
          set({ hasVisitedBefore: visited }, false, 'setHasVisitedBefore'),

        setSoundEnabled: (enabled) =>
          set({ soundEnabled: enabled }, false, 'setSoundEnabled'),

        setAnimationsEnabled: (enabled) =>
          set({ animationsEnabled: enabled }, false, 'setAnimationsEnabled'),

        toggleSound: () =>
          set((state) => ({ soundEnabled: !state.soundEnabled }), false, 'toggleSound'),

        toggleAnimations: () =>
          set(
            (state) => ({ animationsEnabled: !state.animationsEnabled }),
            false,
            'toggleAnimations'
          ),

        // UI actions
        setSidebarOpen: (open) =>
          set({ isSidebarOpen: open }, false, 'setSidebarOpen'),

        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'toggleSidebar'),

        setCurrentView: (view) =>
          set({ currentView: view }, false, 'setCurrentView'),

        // Reset action
        resetAppState: () =>
          set(
            {
              isDemoMode: false,
              soundEnabled: true,
              animationsEnabled: true,
              isSidebarOpen: false,
              currentView: 'dashboard',
              // Don't reset hasVisitedBefore
            },
            false,
            'resetAppState'
          ),
      }),
      {
        name: 'zombie-budget-app-store',
        // Only persist certain fields
        partialize: (state) => ({
          hasVisitedBefore: state.hasVisitedBefore,
          soundEnabled: state.soundEnabled,
          animationsEnabled: state.animationsEnabled,
        }),
      }
    ),
    {
      name: 'app-store',
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Selectors for optimized component subscriptions
 */

// Select demo mode state
export const selectDemoMode = (state: AppState) => state.isDemoMode;

// Select user preferences
export const selectUserPreferences = (state: AppState) => ({
  soundEnabled: state.soundEnabled,
  animationsEnabled: state.animationsEnabled,
});

// Select UI state
export const selectUIState = (state: AppState) => ({
  isSidebarOpen: state.isSidebarOpen,
  currentView: state.currentView,
});

// Select has visited before
export const selectHasVisitedBefore = (state: AppState) => state.hasVisitedBefore;
