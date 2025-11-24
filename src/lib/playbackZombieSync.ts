/**
 * Playback Zombie Synchronization
 * 
 * Utilities for synchronizing zombie movement with playback timeline.
 * Ensures zombies move at the correct speed and reach targets at the right time.
 */

import type { Zombie } from '../types/zombie';
import type { BlockadeType } from '../types/blockade';
import { getBlockadePositions } from '../types/blockade';
import { updateZombiePositionWithPlaybackTime } from '../components/game/Zombie';

/**
 * Update all zombies based on current playback time
 * Synchronizes zombie positions with the playback timeline
 * 
 * @param zombies - Array of active zombies
 * @param currentTime - Current playback time in milliseconds
 * @param travelDuration - How long zombies should take to reach target (milliseconds)
 * @returns Updated array of zombies with synchronized positions
 */
export function updateZombiesWithPlaybackTime(
  zombies: Zombie[],
  currentTime: number,
  travelDuration: number,
): Zombie[] {
  return zombies.map(zombie => {
    // Skip if zombie doesn't have spawn time (not part of playback)
    if (zombie.spawnTime === undefined) {
      return zombie;
    }

    // Get target blockade position
    const targetPositions = getBlockadePositions(zombie.targetBlockade as BlockadeType);
    // Use first blockade position for this category
    const targetPos = targetPositions[0];

    // Update zombie position based on playback time
    return updateZombiePositionWithPlaybackTime(
      zombie,
      targetPos.x,
      targetPos.y,
      zombie.spawnTime,
      currentTime,
      travelDuration,
    );
  });
}

/**
 * Calculate expected zombie position at a given playback time
 * Useful for debugging and visualization
 * 
 * @param spawnPosition - Initial spawn position
 * @param targetPosition - Target blockade position
 * @param spawnTime - When zombie spawned (milliseconds)
 * @param currentTime - Current playback time (milliseconds)
 * @param travelDuration - Total travel duration (milliseconds)
 * @returns Expected position at current time
 */
export function calculateZombiePositionAtTime(
  spawnPosition: { x: number; y: number },
  targetPosition: { x: number; y: number },
  spawnTime: number,
  currentTime: number,
  travelDuration: number,
): { x: number; y: number; progress: number } {
  // Calculate time elapsed since spawn
  const elapsedTime = currentTime - spawnTime;
  
  // Calculate progress along path (0 = spawn, 1 = target)
  const progress = Math.min(1, Math.max(0, elapsedTime / travelDuration));

  // Calculate direction
  const dx = targetPosition.x - spawnPosition.x;
  const dy = targetPosition.y - spawnPosition.y;

  // Calculate current position
  const x = spawnPosition.x + dx * progress;
  const y = spawnPosition.y + dy * progress;

  return { x, y, progress };
}

/**
 * Check if zombie should have reached target by current time
 * 
 * @param spawnTime - When zombie spawned (milliseconds)
 * @param currentTime - Current playback time (milliseconds)
 * @param travelDuration - Total travel duration (milliseconds)
 * @returns True if zombie should be at target
 */
export function shouldZombieBeAtTarget(
  spawnTime: number,
  currentTime: number,
  travelDuration: number,
): boolean {
  const elapsedTime = currentTime - spawnTime;
  return elapsedTime >= travelDuration;
}

/**
 * Get zombies that should be attacking at current time
 * Filters zombies that have reached their targets
 * 
 * @param zombies - Array of active zombies
 * @param currentTime - Current playback time (milliseconds)
 * @param travelDuration - Total travel duration (milliseconds)
 * @returns Array of zombies that should be attacking
 */
export function getAttackingZombies(
  zombies: Zombie[],
  currentTime: number,
  travelDuration: number,
): Zombie[] {
  return zombies.filter(zombie => {
    if (zombie.spawnTime === undefined) {
      return zombie.state === 'attacking';
    }
    return shouldZombieBeAtTarget(zombie.spawnTime, currentTime, travelDuration);
  });
}
