/**
 * Zombie Component
 * 
 * Renders individual zombie sprites in the isometric game view.
 * Handles sprite rendering, animation frame cycling, and visual effects.
 * 
 * Features:
 * - Sprite-based rendering (128x256px)
 * - Animation frame cycling for walk animation
 * - Shambling movement with slight randomness
 * - Attack animation when reaching blockade
 * - Proper isometric positioning with pivot point
 * - Z-index layering for depth perception
 * 
 * Specifications:
 * - Sprite size: 128x256 pixels
 * - Pivot: x:0.5, y:0.19 (center horizontally, near bottom)
 * - Animation: Frame-based sprite cycling
 */

import { useEffect, useState } from 'react';

import { isoToScreen } from '../../lib/isometric';
import {
  getZombieSpriteFramePath,
  getAnimationForZombieState,
  getDirectionFromVector,
  SPRITE_CONFIG,
  type Direction,
} from '../../lib/sprites';
import type { Zombie as ZombieType } from '../../types/zombie';
import { releaseZombieToPool } from '../../lib/zombiePool';

interface ZombieProps {
  /** Zombie data including position, type, and state */
  zombie: ZombieType;
  /** Canvas center X coordinate for positioning */
  centerX: number;
  /** Canvas center Y coordinate for positioning */
  centerY: number;
  /** Canvas 2D rendering context */
  ctx: CanvasRenderingContext2D;
  /** Sprite frames for current animation (preloaded) */
  spriteFrames?: HTMLImageElement[];
}

/**
 * Render a single zombie sprite on the canvas
 * 
 * This is a pure rendering function that draws a zombie at its current position.
 * Should be called within the game loop for each visible zombie.
 * Uses CityZombie 5 sprite sheets with proper animation based on state.
 * 
 * @param props - Zombie rendering properties
 */
export function renderZombie({
  zombie,
  centerX,
  centerY,
  ctx,
  spriteFrames,
}: ZombieProps): void {
  // Convert isometric position to screen coordinates
  const screenPos = isoToScreen(zombie.position.x, zombie.position.y, zombie.position.z);

  // Calculate render position with pivot offset
  const { width, height, pivot } = SPRITE_CONFIG;
  const renderX = centerX + screenPos.x - width * pivot.x;
  const renderY = centerY + screenPos.y - height * pivot.y;

  // Apply state-based visual effects
  ctx.save();

  // Spawning state: fade in effect
  if (zombie.state === 'spawning') {
    const spawnProgress = Math.min(zombie.spriteFrame / 15, 1); // 15 frames to fully spawn
    ctx.globalAlpha = spawnProgress;
  }

  // Defeated state: fade out effect during death animation
  if (zombie.state === 'defeated') {
    // Fade out during the last 5 frames of the death animation
    const fadeStartFrame = 10;
    if (zombie.spriteFrame >= fadeStartFrame) {
      const fadeProgress = (zombie.spriteFrame - fadeStartFrame) / 5;
      ctx.globalAlpha = Math.max(0, 1 - fadeProgress);
    }
  }

  // Attacking state: slight red tint for impact
  if (zombie.state === 'attacking') {
    ctx.globalCompositeOperation = 'source-over';
    // Add subtle red overlay for attack impact
    ctx.shadowColor = '#a83232';
    ctx.shadowBlur = 10;
  }

  // Get current frame index (floor to get integer frame number)
  const frameIndex = Math.floor(zombie.spriteFrame) % 15;

  // Draw sprite if loaded, otherwise draw placeholder
  if (spriteFrames && spriteFrames[frameIndex] && spriteFrames[frameIndex].complete) {
    ctx.drawImage(spriteFrames[frameIndex], renderX, renderY, width, height);
  } else {
    // Placeholder rendering (colored rectangle with zombie type indicator)
    drawPlaceholder(ctx, renderX, renderY, width, height, zombie.type);
  }

  // Draw debug info in development mode
  if (import.meta.env.DEV) {
    drawDebugInfo(ctx, renderX, renderY, zombie);
  }

  ctx.restore();
}

/**
 * Draw placeholder when sprite is not loaded
 */
function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  type: string,
): void {
  // Color based on zombie type
  const colors: Record<string, string> = {
    fast_food: '#a83232', // blood-red
    impulse: '#d97548', // warning-orange
    subscription: '#4a9d5f', // toxic-green
    luxury: '#6a6a6a', // decay-light
  };

  const color = colors[type] || '#4a4a4a';

  // Draw body (rectangle)
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  // Draw outline
  ctx.strokeStyle = '#e8e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Draw type label
  ctx.fillStyle = '#e8e8f0';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(type.toUpperCase(), x + width / 2, y + height / 2);
}

/**
 * Draw debug information (position, state, frame)
 */
function drawDebugInfo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  zombie: ZombieType,
): void {
  ctx.fillStyle = '#e8e8f0';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';

  const debugText = [
    `Pos: (${zombie.position.x.toFixed(1)}, ${zombie.position.y.toFixed(1)}, ${zombie.position.z.toFixed(1)})`,
    `State: ${zombie.state}`,
    `Frame: ${zombie.spriteFrame}`,
    `Strength: ${zombie.strength.toFixed(1)}`,
  ];

  debugText.forEach((text, index) => {
    ctx.fillText(text, x, y - 10 - index * 12);
  });
}

/**
 * Hook for preloading zombie sprite animations for all 8 directions
 * Returns a map of animation frames by animation type and direction
 * Loads essential animations: WakeUp (spawn), Walk (move), Attack1 (attack), Die (defeat)
 * 
 * Animation key format: "{AnimationType}_{Direction}" (e.g., "Walk_S", "Attack1_NE")
 */
export function useZombieSprites() {
  const [animations, setAnimations] = useState<Map<string, HTMLImageElement[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const essentialAnimations = ['WakeUp', 'Walk', 'Attack1', 'Die', 'Die2'];
    const directions: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const loadedAnimations = new Map<string, HTMLImageElement[]>();

    const totalAnimations = essentialAnimations.length * directions.length;
    let loadedCount = 0;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalAnimations) {
        setAnimations(loadedAnimations);
        setLoading(false);
      }
    };

    // Load all animations for all directions
    essentialAnimations.forEach((animName) => {
      directions.forEach((direction) => {
        const frames: HTMLImageElement[] = [];
        let frameLoadCount = 0;
        const animKey = `${animName}_${direction}`;

        // Load all 15 frames for this animation + direction combo
        for (let i = 0; i < 15; i++) {
          const img = new Image();
          img.width = SPRITE_CONFIG.width;
          img.height = SPRITE_CONFIG.height;

          img.onload = () => {
            frames[i] = img;
            frameLoadCount++;
            if (frameLoadCount === 15) {
              loadedAnimations.set(animKey, frames);
              checkComplete();
            }
          };

          img.onerror = () => {
            console.warn(
              `Failed to load zombie sprite frame: ${animName} ${direction} frame ${i}, using placeholder`,
            );
            // Still mark as loaded so we don't block rendering
            frameLoadCount++;
            if (frameLoadCount === 15) {
              loadedAnimations.set(animKey, frames);
              checkComplete();
            }
          };

          img.src = getZombieSpriteFramePath(animName as any, direction, i);
        }
      });
    });

    return () => {
      // Cleanup: revoke object URLs if any
      loadedAnimations.forEach((frames) => {
        frames.forEach((img) => {
          if (img && img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
          }
        });
      });
    };
  }, []);

  return { animations, loading };
}

/**
 * Get sprite animation frames for a zombie based on its current state and direction
 */
export function getZombieSpriteFrames(
  zombie: ZombieType,
  animations: Map<string, HTMLImageElement[]>,
): HTMLImageElement[] | undefined {
  // Get animation type based on zombie state
  const animationType = getAnimationForZombieState(zombie.state);

  // Get zombie's current direction (default to 'S' if not set)
  const direction = zombie.direction || 'S';

  // Build animation key: "{AnimationType}_{Direction}"
  const animKey = `${animationType}_${direction}`;

  return animations.get(animKey);
}

/**
 * Update zombie animation frame based on state and delta time
 * 
 * Advances the sprite animation frame according to state-specific frame rates:
 * - Spawning: 12 fps (WakeUp animation, 15 frames, transitions to moving)
 * - Moving: 10 fps (Walk animation, 15 frames, loops continuously)
 * - Attacking: 15 fps (Attack1 animation, 15 frames, loops while attacking)
 * - Defeated: 12 fps (Die animation, 15 frames, holds on last frame)
 * 
 * Should be called each game loop iteration to maintain smooth animations.
 * 
 * @param zombie - Zombie to update with current state and sprite frame
 * @param deltaTime - Time elapsed since last frame in seconds (typically 1/60 for 60fps)
 * @returns Updated zombie with new sprite frame and potentially new state (spawning → moving)
 * 
 * @example
 * // In game loop
 * const updatedZombie = updateZombieFrame(zombie, deltaTime);
 * if (updatedZombie.state !== zombie.state) {
 *   console.log('Zombie transitioned from spawning to moving');
 * }
 */
export function updateZombieFrame(zombie: ZombieType, deltaTime: number): ZombieType {
  // Animation speed varies by state
  let frameRate = 10; // Default: 10 frames per second

  // Adjust frame rate based on state
  switch (zombie.state) {
    case 'spawning':
      frameRate = 12; // Slightly faster spawn
      break;
    case 'moving':
      frameRate = 10; // Normal walk speed
      break;
    case 'attacking':
      frameRate = 15; // Faster attack animation for impact
      break;
    case 'defeated':
      frameRate = 12; // Moderate death animation
      break;
  }

  const frameIncrement = frameRate * deltaTime;
  let newFrame = zombie.spriteFrame + frameIncrement;

  // Handle different animation cycles based on state
  switch (zombie.state) {
    case 'spawning':
      // Spawn animation: 15 frames (WakeUp animation)
      if (newFrame >= 15) {
        newFrame = 0;
        return { ...zombie, state: 'moving', spriteFrame: 0 };
      }
      break;

    case 'moving':
      // Walk cycle: 15 frames, loop
      if (newFrame >= 15) {
        newFrame = newFrame % 15;
      }
      break;

    case 'attacking':
      // Attack animation: 15 frames, loop continuously while attacking
      // Uses Attack1 animation from CityZombie 5 sprite sheets
      if (newFrame >= 15) {
        newFrame = newFrame % 15; // Loop attack animation
      }
      break;

    case 'defeated':
      // Defeat animation: 15 frames, then mark for removal
      // Uses Die animation from CityZombie 5 sprite sheets
      if (newFrame >= 15) {
        newFrame = 15; // Hold on last frame briefly
        // Zombie should be removed from game after animation completes
        // The game loop should check for this state and remove the zombie
      }
      break;
  }

  return {
    ...zombie,
    spriteFrame: newFrame,
  };
}

/**
 * Apply shambling movement to zombie position
 * Adds slight randomness and lurching effect
 * 
 * @param zombie - Zombie to update
 * @param targetX - Target X position (blockade)
 * @param targetY - Target Y position (blockade)
 * @param deltaTime - Time since last frame in seconds
 * @param attackRange - Distance at which zombie starts attacking (default: 0.5)
 * @returns Updated zombie with new position and direction
 */
export function updateZombiePosition(
  zombie: ZombieType,
  targetX: number,
  targetY: number,
  deltaTime: number,
  attackRange: number = 0.5,
): ZombieType {
  if (zombie.state !== 'moving') {
    return zombie;
  }

  // Calculate direction to target
  const dx = targetX - zombie.position.x;
  const dy = targetY - zombie.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Check if reached target (within attack range)
  if (distance <= attackRange) {
    return {
      ...zombie,
      state: 'attacking',
      spriteFrame: 0,
      // Keep facing the blockade when attacking
      direction: getDirectionFromVector(dx, dy),
    };
  }

  // Normalize direction
  const dirX = dx / distance;
  const dirY = dy / distance;

  // Add shambling randomness (slight wobble)
  const wobbleAmount = 0.1;
  const wobbleX = (Math.random() - 0.5) * wobbleAmount;
  const wobbleY = (Math.random() - 0.5) * wobbleAmount;

  // Apply movement with speed and shambling effect
  const moveSpeed = zombie.speed * deltaTime;
  const newX = zombie.position.x + (dirX + wobbleX) * moveSpeed;
  const newY = zombie.position.y + (dirY + wobbleY) * moveSpeed;

  // Update direction based on movement vector
  const direction = getDirectionFromVector(dx, dy);

  return {
    ...zombie,
    position: {
      ...zombie.position,
      x: newX,
      y: newY,
    },
    direction,
  };
}

/**
 * Update zombie position based on playback time synchronization
 * Calculates position along path from spawn to target based on time elapsed
 * 
 * This ensures zombies move in sync with playback timeline, regardless of frame rate.
 * Zombies will reach their target blockade at the correct time during playback.
 * 
 * @param zombie - Zombie to update
 * @param targetX - Target X position (blockade)
 * @param targetY - Target Y position (blockade)
 * @param spawnTime - Time when zombie spawned (milliseconds into playback)
 * @param currentTime - Current playback time (milliseconds)
 * @param travelDuration - How long zombie should take to reach target (milliseconds)
 * @param attackRange - Distance at which zombie starts attacking (default: 0.5)
 * @returns Updated zombie with position synchronized to playback time
 */
export function updateZombiePositionWithPlaybackTime(
  zombie: ZombieType,
  targetX: number,
  targetY: number,
  spawnTime: number,
  currentTime: number,
  travelDuration: number,
  attackRange: number = 0.5,
): ZombieType {
  if (zombie.state !== 'moving') {
    return zombie;
  }

  // Calculate time elapsed since spawn
  const elapsedTime = currentTime - spawnTime;
  
  // Calculate progress along path (0 = spawn, 1 = target)
  const progress = Math.min(1, Math.max(0, elapsedTime / travelDuration));

  // Get spawn position (stored when zombie was created)
  const spawnX = zombie.spawnPosition?.x ?? zombie.position.x;
  const spawnY = zombie.spawnPosition?.y ?? zombie.position.y;

  // Calculate direction to target
  const dx = targetX - spawnX;
  const dy = targetY - spawnY;
  const totalDistance = Math.sqrt(dx * dx + dy * dy);

  // Calculate current position along path
  const currentDistance = totalDistance * progress;
  
  // Add shambling randomness (slight wobble) - scale with progress
  const wobbleAmount = 0.1 * (1 - progress * 0.5); // Less wobble as zombie gets closer
  const wobbleX = (Math.random() - 0.5) * wobbleAmount;
  const wobbleY = (Math.random() - 0.5) * wobbleAmount;

  // Calculate new position
  const dirX = dx / totalDistance;
  const dirY = dy / totalDistance;
  const newX = spawnX + (dirX * currentDistance) + wobbleX;
  const newY = spawnY + (dirY * currentDistance) + wobbleY;

  // Check if reached target (within attack range)
  const distanceToTarget = Math.sqrt(
    Math.pow(targetX - newX, 2) + Math.pow(targetY - newY, 2)
  );

  if (distanceToTarget <= attackRange || progress >= 1) {
    return {
      ...zombie,
      state: 'attacking',
      spriteFrame: 0,
      position: {
        ...zombie.position,
        x: targetX,
        y: targetY,
      },
      direction: getDirectionFromVector(dx, dy),
    };
  }

  // Update direction based on movement vector
  const direction = getDirectionFromVector(dx, dy);

  return {
    ...zombie,
    position: {
      ...zombie.position,
      x: newX,
      y: newY,
    },
    direction,
  };
}

/**
 * Trigger zombie defeat animation
 * Transitions zombie to defeated state and resets animation frame
 * 
 * @param zombie - Zombie to defeat
 * @returns Updated zombie in defeated state
 */
export function defeatZombie(zombie: ZombieType): ZombieType {
  return {
    ...zombie,
    state: 'defeated',
    spriteFrame: 0, // Start death animation from frame 0
  };
}

/**
 * Check if zombie defeat animation is complete
 * Used to determine when zombie can be removed from game
 * 
 * @param zombie - Zombie to check
 * @returns True if defeat animation is complete
 */
export function isZombieDefeatComplete(zombie: ZombieType): boolean {
  return zombie.state === 'defeated' && zombie.spriteFrame >= 15;
}

/**
 * Remove zombie from game and return it to the object pool
 * Should be called when zombie defeat animation is complete
 * 
 * @param zombie - Zombie to remove
 */
export function removeZombie(zombie: ZombieType): void {
  releaseZombieToPool(zombie);
}
