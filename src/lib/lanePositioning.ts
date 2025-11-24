/**
 * Lane Positioning System
 * 
 * Shared positioning logic for barriers and zombies to ensure perfect alignment.
 * Plants vs Zombies style with 4 horizontal lanes.
 */

export interface LanePosition {
  x: number;
  y: number;
  category: 'food' | 'entertainment' | 'shopping' | 'subscriptions';
}

/**
 * Calculate lane positions based on screen dimensions
 * This is the single source of truth for lane positioning
 */
export function calculateLanePositions(screenHeight: number): {
  gameAreaHeight: number;
  gameAreaTop: number;
  laneHeight: number;
  lanes: LanePosition[];
} {
  const gameAreaHeight = screenHeight - 200; // Reserve 200px for bottom UI
  const gameAreaTop = 30; // Start very high for maximum space
  const laneHeight = gameAreaHeight / 3.2; // Much wider lanes for clear separation
  
  // Maximum spacing between lanes to prevent any label overlap
  const lanes: LanePosition[] = [
    { x: 0, y: gameAreaTop + laneHeight * 0.8, category: 'food' },        // Lane 1 (top)
    { x: 0, y: gameAreaTop + laneHeight * 1.8, category: 'entertainment' }, // Lane 2
    { x: 0, y: gameAreaTop + laneHeight * 2.8, category: 'shopping' },     // Lane 3
    { x: 0, y: gameAreaTop + laneHeight * 3.8, category: 'subscriptions' }, // Lane 4 (bottom)
  ];
  
  return { gameAreaHeight, gameAreaTop, laneHeight, lanes };
}

/**
 * Get Y position for a specific category
 */
export function getLaneY(category: string, screenHeight: number): number {
  const { lanes } = calculateLanePositions(screenHeight);
  const lane = lanes.find(l => l.category === category);
  return lane ? lane.y : lanes[0].y;
}

/**
 * Get barrier X position (to the right of homebase)
 */
export function getBarrierX(homebaseX: number): number {
  return homebaseX + 250;
}

/**
 * Get zombie spawn X position (off-screen to the right)
 */
export function getZombieSpawnX(): number {
  return 1000; // Off-screen but not too far (was 800, originally 1200)
}
