/**
 * Sprite loading and management utilities for zombie sprite sheets
 * Supports CityZombie 1-5 variants for visual variety
 */

import { ZOMBIE_SPRITE_BASE_PATH } from '../constants/zombieSprites';

export type ZombieSpriteType = 'food' | 'entertainment' | 'shopping' | 'subscriptions';

export type ZombieAnimation =
  | 'Idle'
  | 'Idle2'
  | 'Walk'
  | 'Run'
  | 'CrouchRun'
  | 'Attack1'
  | 'Attack2'
  | 'Attack3'
  | 'Attack4'
  | 'Attack5'
  | 'TakeDamage'
  | 'Die'
  | 'Die2'
  | 'Taunt'
  | 'WakeUp';

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface SpriteConfig {
  width: number;
  height: number;
  pixelsPerUnit: number;
  pivot: {
    x: number;
    y: number;
  };
  framesPerAnimation: number;
}

export const SPRITE_CONFIG: SpriteConfig = {
  width: 128,
  height: 256,
  pixelsPerUnit: 128,
  pivot: {
    x: 0.5, // Center horizontally
    y: 0.19, // Near bottom for ground contact
  },
  framesPerAnimation: 15,
};

/**
 * Get the path to a specific zombie animation frame
 */
export function getZombieSpriteFramePath(
  animation: ZombieAnimation,
  direction: Direction,
  frameIndex: number,
): string {
  // Frame numbers are odd: 001, 003, 005, etc.
  const frameNumber = (frameIndex * 2 + 1).toString().padStart(3, '0');

  // Direction angle mapping
  const directionAngles: Record<Direction, number> = {
    N: 90,
    NE: 45,
    E: 0,
    SE: 315,
    S: 270,
    SW: 225,
    W: 180,
    NW: 135,
  };

  const angle = directionAngles[direction];
  return `${ZOMBIE_SPRITE_BASE_PATH}/${animation}/${direction}/${animation}_${angle}_${frameNumber}.png`;
}

/**
 * Preload a specific animation sequence
 */
export async function preloadZombieAnimation(
  animation: ZombieAnimation,
  direction: Direction,
): Promise<HTMLImageElement[]> {
  const frames: HTMLImageElement[] = [];
  const loadPromises: Promise<void>[] = [];

  for (let i = 0; i < SPRITE_CONFIG.framesPerAnimation; i++) {
    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.width = SPRITE_CONFIG.width;
      img.height = SPRITE_CONFIG.height;

      img.onload = () => {
        frames[i] = img;
        resolve();
      };

      img.onerror = () => {
        console.error(`Failed to load frame ${i} of ${animation} ${direction}`);
        reject(new Error(`Failed to load frame: ${animation}/${direction}/${i}`));
      };

      img.src = getZombieSpriteFramePath(animation, direction, i);
    });

    loadPromises.push(promise);
  }

  await Promise.all(loadPromises);
  return frames;
}

/**
 * Preload essential zombie animations (Idle, Walk, Attack, Die)
 */
export async function preloadEssentialZombieAnimations(
  direction: Direction = 'S',
): Promise<Map<ZombieAnimation, HTMLImageElement[]>> {
  const animations = new Map<ZombieAnimation, HTMLImageElement[]>();
  const essentialAnims: ZombieAnimation[] = ['Idle', 'Walk', 'Attack1', 'Die'];

  const loadPromises = essentialAnims.map(async (anim) => {
    const frames = await preloadZombieAnimation(anim, direction);
    animations.set(anim, frames);
  });

  await Promise.all(loadPromises);
  return animations;
}

/**
 * Calculate sprite render position based on isometric coordinates
 */
export function getSpriteRenderPosition(
  isoX: number,
  isoY: number,
  isoZ: number = 0,
): { x: number; y: number } {
  const { pivot, width, height } = SPRITE_CONFIG;

  return {
    x: isoX - width * pivot.x,
    y: isoY - height * pivot.y - isoZ,
  };
}

/**
 * Get sprite bounds for collision detection
 */
export function getSpriteBounds(
  x: number,
  y: number,
): { left: number; right: number; top: number; bottom: number } {
  const { width, height } = SPRITE_CONFIG;

  return {
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
  };
}

/**
 * Get the appropriate animation type based on zombie state
 */
export function getAnimationForZombieState(state: string): ZombieAnimation {
  switch (state) {
    case 'spawning':
      return 'WakeUp';
    case 'moving':
      return 'Walk';
    case 'attacking':
      return 'Attack1';
    case 'defeated':
      return 'Die';
    default:
      return 'Idle';
  }
}

/**
 * Calculate direction based on movement vector
 * Returns the closest of 8 isometric directions
 */
export function getDirectionFromVector(dx: number, dy: number): Direction {
  // Handle zero vector (no movement)
  if (dx === 0 && dy === 0) {
    return 'S'; // Default to South
  }

  // Calculate angle in radians
  const angle = Math.atan2(dy, dx);
  
  // Convert to degrees (0-360)
  let degrees = (angle * 180 / Math.PI + 360) % 360;
  
  // Map to 8 directions (45-degree segments)
  // E: 337.5-22.5, NE: 22.5-67.5, N: 67.5-112.5, etc.
  if (degrees >= 337.5 || degrees < 22.5) return 'E';
  if (degrees >= 22.5 && degrees < 67.5) return 'NE';
  if (degrees >= 67.5 && degrees < 112.5) return 'N';
  if (degrees >= 112.5 && degrees < 157.5) return 'NW';
  if (degrees >= 157.5 && degrees < 202.5) return 'W';
  if (degrees >= 202.5 && degrees < 247.5) return 'SW';
  if (degrees >= 247.5 && degrees < 292.5) return 'S';
  if (degrees >= 292.5 && degrees < 337.5) return 'SE';
  
  return 'S'; // Fallback
}
