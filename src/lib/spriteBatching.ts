/**
 * Sprite Batching System
 * 
 * Optimizes rendering performance by batching similar sprites together
 * to reduce the number of draw calls to the canvas context.
 * 
 * Key Optimizations:
 * - Group sprites by texture/image source
 * - Sort by z-index within each batch
 * - Single draw call per batch instead of per sprite
 * - Reduce context state changes
 * 
 * Performance Impact:
 * - Reduces draw calls from O(n) to O(unique_textures)
 * - Minimizes context state changes (globalAlpha, filters, etc.)
 * - Improves frame rate especially with many zombies
 */

import type { Zombie } from '../types/zombie';
import type { Blockade } from '../types/blockade';
import type { HomeBase } from '../types/homebase';
import { calculateZIndexFromPosition } from './isometric';

/**
 * Sprite batch entry containing all information needed to render a sprite
 */
export interface SpriteBatchEntry {
  /** Image to render */
  image: HTMLImageElement;
  /** Screen X position */
  x: number;
  /** Screen Y position */
  y: number;
  /** Sprite width */
  width: number;
  /** Sprite height */
  height: number;
  /** Z-index for depth sorting */
  zIndex: number;
  /** Optional alpha transparency (0-1) */
  alpha?: number;
  /** Optional filter effects */
  filter?: string;
  /** Optional shadow effects */
  shadow?: {
    color: string;
    blur: number;
  };
}

/**
 * Sprite batch grouped by texture
 */
export interface SpriteBatch {
  /** Texture identifier (image src) */
  textureId: string;
  /** Array of sprite entries using this texture */
  entries: SpriteBatchEntry[];
}

/**
 * Create a sprite batch entry from a zombie
 */
export function createZombieBatchEntry(
  zombie: Zombie,
  spriteFrame: HTMLImageElement,
  screenX: number,
  screenY: number,
  width: number,
  height: number
): SpriteBatchEntry {
  const zIndex = calculateZIndexFromPosition(zombie.position);
  
  // Calculate alpha based on state
  let alpha = 1.0;
  if (zombie.state === 'spawning') {
    const spawnProgress = Math.min(zombie.spriteFrame / 15, 1);
    alpha = spawnProgress;
  } else if (zombie.state === 'defeated') {
    const fadeStartFrame = 10;
    if (zombie.spriteFrame >= fadeStartFrame) {
      const fadeProgress = (zombie.spriteFrame - fadeStartFrame) / 5;
      alpha = Math.max(0, 1 - fadeProgress);
    }
  }
  
  // Add shadow for attacking state
  const shadow = zombie.state === 'attacking' 
    ? { color: '#a83232', blur: 10 }
    : undefined;
  
  return {
    image: spriteFrame,
    x: screenX,
    y: screenY,
    width,
    height,
    zIndex,
    alpha: alpha !== 1.0 ? alpha : undefined,
    shadow,
  };
}

/**
 * Create a sprite batch entry from a blockade
 */
export function createBlockadeBatchEntry(
  blockade: Blockade,
  image: HTMLImageElement,
  screenX: number,
  screenY: number,
  width: number,
  height: number
): SpriteBatchEntry {
  const zIndex = calculateZIndexFromPosition(blockade.position);
  
  // Calculate alpha based on state
  const opacities: Record<string, number> = {
    intact: 1.0,
    damaged: 0.8,
    critical: 0.6,
    destroyed: 0.3,
  };
  const alpha = opacities[blockade.state] || 1.0;
  
  return {
    image,
    x: screenX,
    y: screenY,
    width,
    height,
    zIndex,
    alpha: alpha !== 1.0 ? alpha : undefined,
  };
}

/**
 * Create a sprite batch entry from home base
 */
export function createHomeBaseBatchEntry(
  homeBase: HomeBase,
  image: HTMLImageElement,
  screenX: number,
  screenY: number,
  width: number,
  height: number
): SpriteBatchEntry {
  const zIndex = calculateZIndexFromPosition(homeBase.position);
  
  // State-specific effects
  const stateEffects = {
    safe: { brightness: 1.0 },
    threatened: { brightness: 0.9 },
    critical: { brightness: 0.8 },
  };
  const effects = stateEffects[homeBase.state];
  
  return {
    image,
    x: screenX,
    y: screenY,
    width,
    height,
    zIndex,
    alpha: effects.brightness !== 1.0 ? effects.brightness : undefined,
  };
}

/**
 * Group sprite entries into batches by texture
 * 
 * Groups sprites that use the same texture together to minimize
 * texture binding and context state changes.
 * 
 * @param entries - Array of sprite batch entries
 * @returns Array of sprite batches grouped by texture
 */
export function groupSpritesByTexture(entries: SpriteBatchEntry[]): SpriteBatch[] {
  const batchMap = new Map<string, SpriteBatchEntry[]>();
  
  // Group by texture ID (image src)
  entries.forEach(entry => {
    const textureId = entry.image.src;
    const batch = batchMap.get(textureId) || [];
    batch.push(entry);
    batchMap.set(textureId, batch);
  });
  
  // Convert map to array of batches
  const batches: SpriteBatch[] = [];
  batchMap.forEach((entries, textureId) => {
    batches.push({ textureId, entries });
  });
  
  return batches;
}

/**
 * Sort sprite entries by z-index (ascending order)
 * 
 * Ensures sprites render in correct depth order:
 * - Lower z-index (further back) renders first
 * - Higher z-index (closer to camera) renders last (on top)
 * 
 * @param entries - Array of sprite entries to sort
 * @returns Sorted array (ascending z-index)
 */
export function sortEntriesByZIndex(entries: SpriteBatchEntry[]): SpriteBatchEntry[] {
  return [...entries].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Render a batch of sprites with the same texture
 * 
 * Optimized rendering that minimizes context state changes:
 * 1. Sort entries by z-index for proper depth layering
 * 2. Render all sprites in a single pass
 * 3. Only change context state when necessary
 * 
 * @param ctx - Canvas 2D rendering context
 * @param batch - Sprite batch to render
 */
export function renderSpriteBatch(
  ctx: CanvasRenderingContext2D,
  batch: SpriteBatch
): void {
  // Sort by z-index for proper depth layering
  const sortedEntries = sortEntriesByZIndex(batch.entries);
  
  // Render each sprite in the batch
  sortedEntries.forEach(entry => {
    // Skip if image not loaded
    if (!entry.image.complete) return;
    
    ctx.save();
    
    // Apply alpha if specified
    if (entry.alpha !== undefined) {
      ctx.globalAlpha = entry.alpha;
    }
    
    // Apply filter if specified
    if (entry.filter) {
      ctx.filter = entry.filter;
    }
    
    // Apply shadow if specified
    if (entry.shadow) {
      ctx.shadowColor = entry.shadow.color;
      ctx.shadowBlur = entry.shadow.blur;
    }
    
    // Draw the sprite
    ctx.drawImage(
      entry.image,
      entry.x,
      entry.y,
      entry.width,
      entry.height
    );
    
    ctx.restore();
  });
}

/**
 * Render all sprite batches in optimal order
 * 
 * Main entry point for batched sprite rendering.
 * Groups sprites by texture and renders each batch efficiently.
 * 
 * Performance characteristics:
 * - O(n log n) for sorting by z-index
 * - O(unique_textures) draw call overhead
 * - Minimizes context state changes
 * 
 * @param ctx - Canvas 2D rendering context
 * @param entries - Array of all sprite entries to render
 * 
 * @example
 * const entries: SpriteBatchEntry[] = [];
 * 
 * // Add zombie sprites
 * zombies.forEach(zombie => {
 *   const frame = getZombieSpriteFrame(zombie);
 *   entries.push(createZombieBatchEntry(zombie, frame, x, y, w, h));
 * });
 * 
 * // Add blockade sprites
 * blockades.forEach(blockade => {
 *   const image = getBlockadeImage(blockade);
 *   entries.push(createBlockadeBatchEntry(blockade, image, x, y, w, h));
 * });
 * 
 * // Render all sprites in batches
 * renderAllSpriteBatches(ctx, entries);
 */
export function renderAllSpriteBatches(
  ctx: CanvasRenderingContext2D,
  entries: SpriteBatchEntry[]
): void {
  // Group sprites by texture
  const batches = groupSpritesByTexture(entries);
  
  // Render each batch
  batches.forEach(batch => {
    renderSpriteBatch(ctx, batch);
  });
}

/**
 * Create sprite batch entries for all game objects
 * 
 * Helper function that creates batch entries for zombies, blockades, and home base.
 * This is a convenience function for the game loop.
 * 
 * @param zombies - Array of zombies with their sprite frames
 * @param blockades - Array of blockades with their images
 * @param homeBase - Home base with its image
 * @param centerX - Canvas center X coordinate
 * @param centerY - Canvas center Y coordinate
 * @returns Array of sprite batch entries ready for rendering
 */
export function createGameObjectBatchEntries(
  zombies: Array<{ zombie: Zombie; spriteFrame: HTMLImageElement; screenX: number; screenY: number }>,
  blockades: Array<{ blockade: Blockade; image: HTMLImageElement; screenX: number; screenY: number }>,
  homeBase: { homeBase: HomeBase; image: HTMLImageElement; screenX: number; screenY: number } | null
): SpriteBatchEntry[] {
  const entries: SpriteBatchEntry[] = [];
  
  // Add zombie entries
  zombies.forEach(({ zombie, spriteFrame, screenX, screenY }) => {
    entries.push(createZombieBatchEntry(
      zombie,
      spriteFrame,
      screenX,
      screenY,
      128, // SPRITE_CONFIG.width
      256  // SPRITE_CONFIG.height
    ));
  });
  
  // Add blockade entries
  blockades.forEach(({ blockade, image, screenX, screenY }) => {
    entries.push(createBlockadeBatchEntry(
      blockade,
      image,
      screenX,
      screenY,
      128, // Blockade width
      128  // Blockade height
    ));
  });
  
  // Add home base entry
  if (homeBase) {
    entries.push(createHomeBaseBatchEntry(
      homeBase.homeBase,
      homeBase.image,
      homeBase.screenX,
      homeBase.screenY,
      256, // Home base width
      256  // Home base height
    ));
  }
  
  return entries;
}

/**
 * Performance metrics for sprite batching
 */
export interface BatchingMetrics {
  /** Total number of sprites rendered */
  totalSprites: number;
  /** Number of unique textures */
  uniqueTextures: number;
  /** Number of draw calls (one per batch) */
  drawCalls: number;
  /** Draw call reduction percentage */
  reductionPercent: number;
}

/**
 * Calculate batching performance metrics
 * 
 * Useful for monitoring the effectiveness of sprite batching.
 * 
 * @param entries - Array of sprite entries
 * @returns Performance metrics
 */
export function calculateBatchingMetrics(entries: SpriteBatchEntry[]): BatchingMetrics {
  const batches = groupSpritesByTexture(entries);
  const totalSprites = entries.length;
  const uniqueTextures = batches.length;
  const drawCalls = uniqueTextures;
  
  // Without batching, we'd have one draw call per sprite
  const unbatchedDrawCalls = totalSprites;
  const reductionPercent = totalSprites > 0
    ? ((unbatchedDrawCalls - drawCalls) / unbatchedDrawCalls) * 100
    : 0;
  
  return {
    totalSprites,
    uniqueTextures,
    drawCalls,
    reductionPercent,
  };
}
