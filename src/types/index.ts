/**
 * Central export file for all TypeScript types and interfaces
 */

// Transaction types
export type { Transaction, TransactionCategory } from './transaction';
export { 
  TransactionCategory as TransactionCategoryEnum,
  isGoodSpending,
  isValidAmount,
  isValidDescription
} from './transaction';

// Zombie types
export type { 
  Zombie, 
  ZombieType, 
  ZombieState, 
  IsometricPosition 
} from './zombie';
export { 
  ZombieType as ZombieTypeEnum,
  getZombieTypeFromCategory,
  calculateZombieStrength,
  getZombieSpeed,
  calculateZIndex
} from './zombie';

// Blockade types
export type {
  Blockade,
  BlockadeType,
  BlockadeState
} from './blockade';
export {
  BlockadeType as BlockadeTypeEnum,
  getBlockadeState,
  getVisualLevel,
  applyDamage,
  applyHealing,
  isBlockadeDestroyed,
  getBlockadePosition
} from './blockade';

// HomeBase types
export type {
  HomeBase,
  HomeBaseState
} from './homebase';
export {
  getHomeBaseState,
  calculateOverallHealth,
  calculateMaxHealth,
  isHomeBaseCritical,
  shouldPulseGlow,
  getHomeBasePosition
} from './homebase';

// Playback types
export type {
  PlaybackState,
  PlaybackEvent,
  PlaybackEventType,
  PlaybackTimeline,
  PlaybackAction
} from './playback';
export {
  createInitialPlaybackState,
  calculateEventTimestamp,
  isValidPlaybackSpeed,
  calculateProgress,
  isPlaybackComplete,
  formatPlaybackTime
} from './playback';

// Budget types
export type {
  Budget,
  BudgetCategory,
  BudgetConfig
} from './budget';
export {
  isBudgetCategory,
  isValidBudgetAmount,
  DEFAULT_BUDGET_CONFIG,
  CATEGORY_NAMES,
  CATEGORY_ICONS
} from './budget';
