/**
 * Rendering Utilities
 * 
 * Provides functions for sorting and rendering game objects in proper z-index order.
 * Ensures that objects further back in the isometric view render first, and objects
 * closer to the camera render on top.
 * 
 * Key Principle:
 * - Home base at (0, 0, 0) has z-index = 0
 * - Zombies at positive x, y positions have higher z-index
 * - Objects are sorted by z-index (ascending) before rendering
 * - Lower z-index renders first (background), higher z-index renders last (foreground)
 */

import { calculateZIndexFromPosition, type IsoPosition } from './isometric';

/**
 * Generic game object with isometric position
 */
export interface GameObject {
  position: IsoPosition;
  [key: string]: any;
}

/**
 * Sort game objects by z-index for proper depth layering
 * 
 * Objects are sorted in ascending z-index order:
 * - Lower z-index (further back) renders first
 * - Higher z-index (closer to camera) renders last (on top)
 * 
 * This ensures that:
 * - Home base at (0, 0, 0) with z-index=0 renders behind everything
 * - Zombies at positive positions render on top of home base
 * - Objects at same x+y but higher z (flying) render on top
 * 
 * @param objects - Array of game objects with position property
 * @returns Sorted array (ascending z-index order)
 * 
 * @example
 * const homeBase = { position: { x: 0, y: 0, z: 0 } }; // z-index = 0
 * const zombie1 = { position: { x: 2, y: 1, z: 0 } };  // z-index = 3
 * const zombie2 = { position: { x: 1, y: 2, z: 0 } };  // z-index = 3
 * 
 * const sorted = sortByZIndex([zombie1, homeBase, zombie2]);
 * // Result: [homeBase, zombie1, zombie2] or [homeBase, zombie2, zombie1]
 * // Home base renders first (behind), zombies render on top
 */
export function sortByZIndex<T extends GameObject>(objects: T[]): T[] {
  return [...objects].sort((a, b) => {
    const zIndexA = calculateZIndexFromPosition(a.position);
    const zIndexB = calculateZIndexFromPosition(b.position);
    return zIndexA - zIndexB;
  });
}

/**
 * Get z-index value for a game object
 * 
 * @param object - Game object with position
 * @returns Z-index value
 */
export function getZIndex(object: GameObject): number {
  return calculateZIndexFromPosition(object.position);
}

/**
 * Check if object A should render before object B (A is behind B)
 * 
 * @param a - First object
 * @param b - Second object
 * @returns True if A should render before B
 */
export function shouldRenderBefore(a: GameObject, b: GameObject): boolean {
  return getZIndex(a) < getZIndex(b);
}

/**
 * Render game objects in correct z-index order
 * 
 * This is a helper function that sorts objects and calls a render function
 * for each object in the correct order.
 * 
 * @param objects - Array of game objects to render
 * @param renderFn - Function to render a single object
 * 
 * @example
 * renderInZOrder([homeBase, ...zombies, ...blockades], (obj) => {
 *   if ('health' in obj && 'maxHealth' in obj && obj.position.x === 0) {
 *     renderHomeBase(ctx, obj, centerX, centerY);
 *   } else if ('strength' in obj) {
 *     renderZombie(ctx, obj, centerX, centerY);
 *   }
 * });
 */
export function renderInZOrder<T extends GameObject>(
  objects: T[],
  renderFn: (object: T) => void
): void {
  const sorted = sortByZIndex(objects);
  sorted.forEach(renderFn);
}

/**
 * Group objects by z-index for batch rendering
 * 
 * Groups objects with the same z-index together for potential
 * rendering optimizations (e.g., batch sprite rendering).
 * 
 * @param objects - Array of game objects
 * @returns Map of z-index to array of objects
 * 
 * @example
 * const groups = groupByZIndex([homeBase, ...zombies]);
 * groups.forEach((objects, zIndex) => {
 *   console.log(`Z-index ${zIndex}: ${objects.length} objects`);
 *   // Batch render all objects at this z-index
 * });
 */
export function groupByZIndex<T extends GameObject>(
  objects: T[]
): Map<number, T[]> {
  const groups = new Map<number, T[]>();
  
  objects.forEach(obj => {
    const zIndex = getZIndex(obj);
    const group = groups.get(zIndex) || [];
    group.push(obj);
    groups.set(zIndex, group);
  });
  
  return groups;
}

/**
 * Get sorted z-index values from a group of objects
 * 
 * @param objects - Array of game objects
 * @returns Sorted array of unique z-index values (ascending)
 */
export function getSortedZIndices<T extends GameObject>(objects: T[]): number[] {
  const zIndices = new Set(objects.map(obj => getZIndex(obj)));
  return Array.from(zIndices).sort((a, b) => a - b);
}

/**
 * Render game objects using sprite batching for optimal performance
 * 
 * This function uses sprite batching to minimize draw calls by grouping
 * sprites with the same texture together. This is significantly more
 * efficient than rendering each sprite individually.
 * 
 * Performance benefits:
 * - Reduces draw calls from O(n) to O(unique_textures)
 * - Minimizes context state changes
 * - Improves frame rate with many game objects
 * 
 * @param ctx - Canvas 2D rendering context
 * @param entries - Array of sprite batch entries
 * 
 * @example
 * import { renderAllSpriteBatches, createGameObjectBatchEntries } from './spriteBatching';
 * 
 * // Create batch entries for all game objects
 * const entries = createGameObjectBatchEntries(
 *   zombiesWithSprites,
 *   blockadesWithImages,
 *   homeBaseWithImage
 * );
 * 
 * // Render all sprites in optimized batches
 * renderWithSpriteBatching(ctx, entries);
 */
export async function renderWithSpriteBatching(
  ctx: CanvasRenderingContext2D,
  entries: import('./spriteBatching').SpriteBatchEntry[]
): Promise<void> {
  const { renderAllSpriteBatches } = await import('./spriteBatching');
  renderAllSpriteBatches(ctx, entries);
}
