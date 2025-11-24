/**
 * Store Index
 * 
 * Central export point for all Zustand stores.
 * Import stores from here to maintain consistency.
 */

export {
  useGameStore,
  selectZombies,
  selectBlockades,
  selectHomeBase,
  selectParticles,
  selectGameLoopState,
  selectCombatManager,
  selectZombieCount,
  selectActiveZombies,
  selectDefeatedZombies,
} from './gameStore';

export {
  useAppStore,
  selectDemoMode,
  selectUserPreferences,
  selectUIState,
  selectHasVisitedBefore,
} from './appStore';
