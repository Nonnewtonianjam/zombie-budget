/**
 * Blockade type based on transaction category
 * Each category has a dedicated defensive blockade
 */
export type BlockadeType = 
  | 'food'
  | 'entertainment'
  | 'shopping'
  | 'subscriptions';

/**
 * Blockade type constants for convenience
 */
export const BlockadeType = {
  FOOD: 'food' as const,
  ENTERTAINMENT: 'entertainment' as const,
  SHOPPING: 'shopping' as const,
  SUBSCRIPTIONS: 'subscriptions' as const,
} as const;

/**
 * Blockade visual state based on health percentage
 * Determines sprite/visual representation
 */
export type BlockadeState = 
  | 'intact'      // 75-100% health
  | 'damaged'     // 50-74% health
  | 'critical'    // 25-49% health
  | 'destroyed';  // 0-24% health

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
 * Blockade interface with health system
 * Represents budget allocation for a category as a defensive structure
 * 
 * Sprite specifications:
 * - Size: 128x128 pixels
 * - Positioned around home base (4 cardinal directions)
 * - Visual degradation based on health state
 * 
 * Health System:
 * - maxHealth = budget amount for category
 * - currentHealth = remaining after damage/healing
 * - Takes damage from zombie attacks (zombie strength)
 * - Heals from good spending transactions in category
 */
export interface Blockade {
  id: string;                      // Unique blockade identifier
  category: BlockadeType;          // Category this blockade defends
  maxHealth: number;               // Budget amount (initial health)
  currentHealth: number;           // Remaining health after damage/healing
  position: IsometricPosition;     // 3D position in isometric space
  state: BlockadeState;            // Visual state based on health percentage
  visualLevel: number;             // 0-3 for granular visual representation
}

/**
 * Helper function to calculate blockade state from health
 */
export function getBlockadeState(currentHealth: number, maxHealth: number): BlockadeState {
  if (maxHealth === 0) return 'destroyed';
  
  const healthPercent = (currentHealth / maxHealth) * 100;
  
  if (healthPercent >= 75) return 'intact';
  if (healthPercent >= 50) return 'damaged';
  if (healthPercent >= 25) return 'critical';
  return 'destroyed';
}

/**
 * Helper function to calculate visual level (0-3) from health
 * Provides more granular visual feedback than state alone
 */
export function getVisualLevel(currentHealth: number, maxHealth: number): number {
  if (maxHealth === 0) return 0;
  
  const healthPercent = (currentHealth / maxHealth) * 100;
  
  if (healthPercent >= 75) return 3;  // Intact
  if (healthPercent >= 50) return 2;  // Damaged
  if (healthPercent >= 25) return 1;  // Critical
  return 0;                           // Destroyed
}

/**
 * Helper function to apply damage to blockade
 * Returns new health value (cannot go below 0)
 */
export function applyDamage(currentHealth: number, damageAmount: number): number {
  return Math.max(0, currentHealth - damageAmount);
}

/**
 * Helper function to apply healing to blockade
 * Returns new health value (cannot exceed maxHealth)
 */
export function applyHealing(currentHealth: number, healAmount: number, maxHealth: number): number {
  return Math.min(maxHealth, currentHealth + healAmount);
}

/**
 * Helper function to check if blockade is destroyed
 */
export function isBlockadeDestroyed(currentHealth: number): boolean {
  return currentHealth <= 0;
}

/**
 * Helper function to get blockade position based on category
 * Positions blockades in isometric diamond pattern around home base
 * Assumes home base is at (0, 0, 0)
 * 
 * In isometric view:
 * - +X = right-forward (southeast on screen)
 * - +Y = left-forward (southwest on screen)
 * 
 * @deprecated Use getBlockadePositions() for multiple blockades per side
 */
export function getBlockadePosition(category: BlockadeType): IsometricPosition {
  // Plants vs Zombies style: barriers in 4 horizontal lanes
  // Positioned to the right of homebase
  const blockadeX = 370; // X position (pixels) - further right
  const gameAreaHeight = 480; // Fixed game area height (matches zombieSpawning.ts)
  const gameAreaTop = 80; // Top offset (below controls)
  const laneHeight = gameAreaHeight / 4; // 120px per lane
  
  switch (category) {
    case BlockadeType.FOOD:
      return { x: blockadeX, y: gameAreaTop + laneHeight * 0.5, z: 0 };  // Lane 1: 140
    case BlockadeType.ENTERTAINMENT:
      return { x: blockadeX, y: gameAreaTop + laneHeight * 1.5, z: 0 };  // Lane 2: 260
    case BlockadeType.SHOPPING:
      return { x: blockadeX, y: gameAreaTop + laneHeight * 2.5, z: 0 };  // Lane 3: 380
    case BlockadeType.SUBSCRIPTIONS:
      return { x: blockadeX, y: gameAreaTop + laneHeight * 3.5, z: 0 };  // Lane 4: 500
    default:
      return { x: blockadeX, y: gameAreaTop + gameAreaHeight / 2, z: 0 };
  }
}

/**
 * Helper function to get all blockade positions for a category
 * Positions 2 blockades on each side of the home base (8 total)
 * Assumes home base is at (0, 0, 0)
 * 
 * Layout in isometric view:
 * - Food: 2 blockades on Northeast side
 * - Entertainment: 2 blockades on Northwest side
 * - Shopping: 2 blockades on Southeast side
 * - Subscriptions: 2 blockades on Southwest side
 * 
 * @param category - Blockade category
 * @returns Array of 2 positions for the category
 */
export function getBlockadePositions(category: BlockadeType): IsometricPosition[] {
  const distance = 2; // Units from home base
  const offset = 0.8; // Offset between two blockades on same side
  
  switch (category) {
    case BlockadeType.FOOD:
      // Northeast side: two blockades
      return [
        { x: distance * 0.7 - offset * 0.5, y: -distance * 0.7 - offset * 0.5, z: 0 },
        { x: distance * 0.7 + offset * 0.5, y: -distance * 0.7 + offset * 0.5, z: 0 },
      ];
    case BlockadeType.ENTERTAINMENT:
      // Northwest side: two blockades
      return [
        { x: -distance * 0.7 - offset * 0.5, y: -distance * 0.7 + offset * 0.5, z: 0 },
        { x: -distance * 0.7 + offset * 0.5, y: -distance * 0.7 - offset * 0.5, z: 0 },
      ];
    case BlockadeType.SHOPPING:
      // Southeast side: two blockades
      return [
        { x: distance * 0.7 - offset * 0.5, y: distance * 0.7 + offset * 0.5, z: 0 },
        { x: distance * 0.7 + offset * 0.5, y: distance * 0.7 - offset * 0.5, z: 0 },
      ];
    case BlockadeType.SUBSCRIPTIONS:
      // Southwest side: two blockades
      return [
        { x: -distance * 0.7 + offset * 0.5, y: distance * 0.7 + offset * 0.5, z: 0 },
        { x: -distance * 0.7 - offset * 0.5, y: distance * 0.7 - offset * 0.5, z: 0 },
      ];
    default:
      return [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
      ];
  }
}

/**
 * Helper function to get all blockade positions for all categories
 * Returns 8 positions total (2 per category)
 * 
 * @returns Array of position objects with category and position
 */
export function getAllBlockadePositions(): Array<{ category: BlockadeType; position: IsometricPosition; index: number }> {
  const categories: BlockadeType[] = [
    BlockadeType.FOOD,
    BlockadeType.ENTERTAINMENT,
    BlockadeType.SHOPPING,
    BlockadeType.SUBSCRIPTIONS,
  ];
  
  const positions: Array<{ category: BlockadeType; position: IsometricPosition; index: number }> = [];
  
  categories.forEach(category => {
    const categoryPositions = getBlockadePositions(category);
    categoryPositions.forEach((position, index) => {
      positions.push({ category, position, index });
    });
  });
  
  return positions;
}
