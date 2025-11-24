/**
 * Zombie type based on transaction category
 * Each category spawns a different zombie variant
 */
export type ZombieType = 
  | 'fast_food'      // Food category
  | 'impulse'        // Shopping category
  | 'subscription'   // Subscriptions category
  | 'luxury';        // Entertainment category

/**
 * Zombie type constants for convenience
 */
export const ZombieType = {
  FAST_FOOD: 'fast_food' as const,
  IMPULSE: 'impulse' as const,
  SUBSCRIPTION: 'subscription' as const,
  LUXURY: 'luxury' as const,
} as const;

/**
 * Zombie state during its lifecycle
 */
export type ZombieState = 
  | 'spawning'   // Initial spawn animation
  | 'moving'     // Shambling toward blockade
  | 'attacking'  // Attacking blockade
  | 'defeated';  // Destroyed/removed

/**
 * Isometric position in 3D space
 * Used for proper depth layering and rendering
 */
export interface IsometricPosition {
  x: number;  // Horizontal position
  y: number;  // Vertical position
  z: number;  // Height/depth for layering
}

/**
 * Zombie interface with isometric properties
 * Represents overspending transactions as game entities
 * 
 * Sprite specifications:
 * - Size: 128x256 pixels
 * - Pivot: x:0.5, y:0.19 (center horizontally, near bottom)
 * - Projection: 30-degree isometric angle
 */
export interface Zombie {
  id: string;                      // Unique zombie identifier
  type: ZombieType;                // Zombie variant based on transaction category
  visualVariant: number;           // Visual sprite variant (1-5 for CityZombie 1-5)
  strength: number;                // Damage dealt to blockade (transaction amount / 10)
  position: IsometricPosition;     // Current 3D position in isometric space
  targetBlockade: string;          // ID of blockade being attacked
  speed: number;                   // Movement speed (varies by type, shambling effect)
  state: ZombieState;              // Current lifecycle state
  transactionId: string;           // Reference to source transaction
  spriteFrame: number;             // Current animation frame (0-based)
  spawnedFrom: string;             // Transaction ID for tracking (duplicate of transactionId for clarity)
  direction?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'; // Facing direction for sprite selection
  spawnPosition?: IsometricPosition; // Initial spawn position (for playback time synchronization)
  spawnTime?: number;              // Time when zombie spawned in milliseconds (for playback synchronization)
}

/**
 * Zombie generation rules:
 * - Each bad transaction spawns 1 zombie
 * - Zombie strength = transaction amount / 10
 * - Zombies target specific blockades based on category
 * - Movement includes slight randomness for shambling effect
 */

/**
 * Helper function to map transaction category to zombie type
 */
export function getZombieTypeFromCategory(category: string): ZombieType {
  switch (category) {
    case 'food':
      return ZombieType.FAST_FOOD;
    case 'shopping':
      return ZombieType.IMPULSE;
    case 'subscriptions':
      return ZombieType.SUBSCRIPTION;
    case 'entertainment':
      return ZombieType.LUXURY;
    default:
      return ZombieType.IMPULSE; // Default fallback
  }
}

/**
 * Helper function to calculate zombie strength from transaction amount
 */
export function calculateZombieStrength(transactionAmount: number): number {
  return transactionAmount / 10;
}

/**
 * Helper function to get base speed for zombie type
 * Returns pixels per frame at 60fps
 */
export function getZombieSpeed(type: ZombieType): number {
  switch (type) {
    case ZombieType.FAST_FOOD:
      return 1.2;  // Slightly faster (impulse spending)
    case ZombieType.IMPULSE:
      return 1.5;  // Fastest (quick purchases)
    case ZombieType.SUBSCRIPTION:
      return 0.8;  // Slower (recurring, persistent)
    case ZombieType.LUXURY:
      return 1.0;  // Medium speed
    default:
      return 1.0;
  }
}

/**
 * Helper function to calculate z-index for proper depth layering
 * Objects further back (higher x+y) should render first
 * 
 * @deprecated Use calculateZIndexFromPosition from lib/isometric.ts instead
 */
export function calculateZIndex(position: IsometricPosition): number {
  return Math.floor(position.x + position.y + position.z * 1000);
}
