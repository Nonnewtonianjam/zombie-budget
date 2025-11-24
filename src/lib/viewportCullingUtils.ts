/**
 * Viewport Culling Utilities
 * 
 * Helper functions for applying viewport culling to game objects.
 * These utilities demonstrate best practices for culling zombies, blockades,
 * and other game entities to optimize rendering performance.
 */

import { cullOffScreen, type Viewport, type IsoPosition } from './isometric';

/**
 * Game object interface with position
 */
interface GameObject {
  position: IsoPosition;
}

/**
 * Cull zombies that are off-screen
 * 
 * Filters out zombies that are not visible in the current viewport.
 * This is critical for performance when dealing with many zombies.
 * 
 * @param zombies - All zombies in the game
 * @param viewport - Current viewport bounds
 * @returns Array of visible zombies only
 * 
 * @example
 * const allZombies = gameState.zombies; // 100 zombies
 * const visibleZombies = cullZombies(allZombies, viewport); // 20 zombies
 * // 80% reduction in objects to render!
 */
export function cullZombies<T extends GameObject>(
  zombies: T[],
  viewport: Viewport
): T[] {
  return cullOffScreen(zombies, viewport);
}

/**
 * Cull blockades that are off-screen
 * 
 * Filters out blockades that are not visible in the current viewport.
 * Note: Blockades are typically positioned near the home base (center),
 * so most or all will usually be visible. However, culling is still
 * good practice for consistency and edge cases.
 * 
 * @param blockades - All blockades in the game
 * @param viewport - Current viewport bounds
 * @returns Array of visible blockades only
 * 
 * @example
 * const allBlockades = gameState.blockades; // 8 blockades
 * const visibleBlockades = cullBlockades(allBlockades, viewport); // Usually 8
 */
export function cullBlockades<T extends GameObject>(
  blockades: T[],
  viewport: Viewport
): T[] {
  return cullOffScreen(blockades, viewport);
}

/**
 * Cull particles that are off-screen
 * 
 * Filters out particle effects that are not visible.
 * Particles can be numerous and short-lived, so culling is important.
 * 
 * @param particles - All particles in the game
 * @param viewport - Current viewport bounds
 * @returns Array of visible particles only
 * 
 * @example
 * const allParticles = particleSystem.particles; // 200 particles
 * const visibleParticles = cullParticles(allParticles, viewport); // 50 particles
 */
export function cullParticles<T extends GameObject>(
  particles: T[],
  viewport: Viewport
): T[] {
  return cullOffScreen(particles, viewport);
}

/**
 * Check if home base is visible
 * 
 * The home base is typically at the center (0, 0, 0), so it's almost
 * always visible. However, this function can be used for consistency
 * or if the camera ever moves away from center.
 * 
 * @param homeBase - Home base object
 * @param viewport - Current viewport bounds
 * @returns True if home base is visible
 * 
 * @example
 * if (isHomeBaseVisible(homeBase, viewport)) {
 *   renderHomeBase(ctx, homeBase, centerX, centerY);
 * }
 */
export function isHomeBaseVisible<T extends GameObject>(
  homeBase: T,
  viewport: Viewport
): boolean {
  const visible = cullOffScreen([homeBase], viewport);
  return visible.length > 0;
}

/**
 * Cull all game objects by type
 * 
 * Convenience function that culls all game object types at once.
 * Returns an object with culled arrays for each type.
 * 
 * @param gameObjects - Object containing arrays of all game object types
 * @param viewport - Current viewport bounds
 * @returns Object with culled arrays for each type
 * 
 * @example
 * const culled = cullAllGameObjects({
 *   zombies: allZombies,
 *   blockades: allBlockades,
 *   particles: allParticles,
 * }, viewport);
 * 
 * // Render only visible objects
 * culled.zombies.forEach(z => renderZombie(ctx, z));
 * culled.blockades.forEach(b => renderBlockade(ctx, b));
 * culled.particles.forEach(p => renderParticle(ctx, p));
 */
export function cullAllGameObjects<T extends GameObject>(
  gameObjects: {
    zombies: T[];
    blockades: T[];
    particles?: T[];
  },
  viewport: Viewport
): {
  zombies: T[];
  blockades: T[];
  particles: T[];
} {
  return {
    zombies: cullZombies(gameObjects.zombies, viewport),
    blockades: cullBlockades(gameObjects.blockades, viewport),
    particles: cullParticles(gameObjects.particles || [], viewport),
  };
}

/**
 * Calculate culling statistics
 * 
 * Useful for debugging and performance monitoring.
 * Shows how many objects were culled and the efficiency percentage.
 * 
 * @param totalObjects - Total number of objects before culling
 * @param visibleObjects - Number of objects after culling
 * @returns Statistics object with counts and percentages
 * 
 * @example
 * const stats = calculateCullingStats(100, 20);
 * console.log(`Culled ${stats.culledPercent}% of objects`);
 * // Output: "Culled 80% of objects"
 */
export function calculateCullingStats(
  totalObjects: number,
  visibleObjects: number
): {
  total: number;
  visible: number;
  culled: number;
  culledPercent: number;
  visiblePercent: number;
} {
  const culled = totalObjects - visibleObjects;
  const culledPercent = totalObjects > 0 ? (culled / totalObjects) * 100 : 0;
  const visiblePercent = totalObjects > 0 ? (visibleObjects / totalObjects) * 100 : 0;

  return {
    total: totalObjects,
    visible: visibleObjects,
    culled,
    culledPercent: Math.round(culledPercent * 10) / 10, // Round to 1 decimal
    visiblePercent: Math.round(visiblePercent * 10) / 10,
  };
}

/**
 * Log culling statistics to console (development only)
 * 
 * Useful for monitoring culling effectiveness during development.
 * 
 * @param label - Label for the log message
 * @param totalObjects - Total number of objects before culling
 * @param visibleObjects - Number of objects after culling
 * 
 * @example
 * logCullingStats('Zombies', allZombies.length, visibleZombies.length);
 * // Console: "Zombies: 20/100 visible (80% culled)"
 */
export function logCullingStats(
  label: string,
  totalObjects: number,
  visibleObjects: number
): void {
  if (import.meta.env.DEV) {
    const stats = calculateCullingStats(totalObjects, visibleObjects);
    console.log(
      `${label}: ${stats.visible}/${stats.total} visible (${stats.culledPercent}% culled)`
    );
  }
}

/**
 * Cull and sort objects by z-index
 * 
 * Combines culling with z-index sorting for optimal rendering.
 * Culls first (reduces array size), then sorts (faster on smaller array).
 * 
 * @param objects - All objects to cull and sort
 * @param viewport - Current viewport bounds
 * @param getZIndex - Function to calculate z-index for an object
 * @returns Culled and sorted array of objects
 * 
 * @example
 * const sorted = cullAndSort(
 *   allZombies,
 *   viewport,
 *   (z) => calculateZIndex(z.position.x, z.position.y, z.position.z)
 * );
 * 
 * // Render in correct order (back to front)
 * sorted.forEach(zombie => renderZombie(ctx, zombie));
 */
export function cullAndSort<T extends GameObject>(
  objects: T[],
  viewport: Viewport,
  getZIndex: (obj: T) => number
): T[] {
  // Step 1: Cull off-screen objects (reduces array size)
  const visible = cullOffScreen(objects, viewport);

  // Step 2: Sort by z-index (faster on smaller array)
  return visible.sort((a, b) => getZIndex(a) - getZIndex(b));
}

/**
 * Batch cull multiple object arrays
 * 
 * Efficiently culls multiple arrays of objects in one pass.
 * Useful when you have many different object types to cull.
 * 
 * @param objectArrays - Array of object arrays to cull
 * @param viewport - Current viewport bounds
 * @returns Array of culled object arrays
 * 
 * @example
 * const [visibleZombies, visibleBlockades, visibleParticles] = batchCull(
 *   [allZombies, allBlockades, allParticles],
 *   viewport
 * );
 */
export function batchCull<T extends GameObject>(
  objectArrays: T[][],
  viewport: Viewport
): T[][] {
  return objectArrays.map(objects => cullOffScreen(objects, viewport));
}
