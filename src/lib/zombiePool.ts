/**
 * Zombie Object Pool
 * 
 * Implements object pooling pattern for zombie entities to improve performance.
 * Instead of creating and destroying zombie objects repeatedly, we reuse them.
 * 
 * Benefits:
 * - Reduces garbage collection pressure
 * - Improves performance during heavy zombie spawning
 * - Maintains consistent memory usage
 * 
 * Usage:
 * 1. Create pool: const pool = new ZombiePool()
 * 2. Acquire zombie: const zombie = pool.acquire(transactionData)
 * 3. Release zombie: pool.release(zombie) when defeated
 */

import type { Zombie, ZombieType, IsometricPosition } from '../types/zombie';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuration for acquiring a zombie from the pool
 */
export interface ZombieAcquireConfig {
  type: ZombieType;
  visualVariant: number; // Visual variant (1-5 for CityZombie 1-5)
  strength: number;
  position: IsometricPosition;
  targetBlockade: string;
  speed: number;
  transactionId: string;
  direction?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  spawnTime?: number; // Time when zombie spawned in milliseconds (for playback synchronization)
}

/**
 * ZombiePool class
 * 
 * Manages a pool of reusable zombie objects.
 * Maintains separate pools for active and inactive zombies.
 */
export class ZombiePool {
  /** Pool of inactive zombies ready for reuse */
  private pool: Zombie[] = [];
  
  /** Currently active zombies in the game */
  private active: Map<string, Zombie> = new Map();
  
  /** Maximum pool size to prevent unbounded growth */
  private maxPoolSize: number;
  
  /** Statistics for monitoring pool performance */
  private stats = {
    totalCreated: 0,
    totalReused: 0,
    totalReleased: 0,
    currentActive: 0,
    currentPooled: 0,
  };

  /**
   * Create a new zombie pool
   * 
   * @param maxPoolSize - Maximum number of zombies to keep in pool (default: 50)
   */
  constructor(maxPoolSize: number = 50) {
    this.maxPoolSize = maxPoolSize;
  }

  /**
   * Acquire a zombie from the pool or create a new one
   * 
   * If a zombie is available in the pool, it will be reset and reused.
   * Otherwise, a new zombie will be created.
   * 
   * @param config - Configuration for the zombie
   * @returns Zombie ready for use
   */
  acquire(config: ZombieAcquireConfig): Zombie {
    let zombie: Zombie;

    // Try to reuse a zombie from the pool
    if (this.pool.length > 0) {
      zombie = this.pool.pop()!;
      this.resetZombie(zombie, config);
      this.stats.totalReused++;
    } else {
      // Create a new zombie if pool is empty
      zombie = this.createZombie(config);
      this.stats.totalCreated++;
    }

    // Add to active zombies
    this.active.set(zombie.id, zombie);
    this.updateStats();

    return zombie;
  }

  /**
   * Release a zombie back to the pool
   * 
   * The zombie will be marked as defeated and returned to the pool
   * for future reuse. If the pool is at max capacity, the zombie
   * will be discarded.
   * 
   * @param zombie - Zombie to release
   */
  release(zombie: Zombie): void {
    // Remove from active zombies
    this.active.delete(zombie.id);

    // Add to pool if not at max capacity
    if (this.pool.length < this.maxPoolSize) {
      zombie.state = 'defeated';
      this.pool.push(zombie);
      this.stats.totalReleased++;
    }
    // Otherwise, let it be garbage collected

    this.updateStats();
  }

  /**
   * Get a zombie by ID from active zombies
   * 
   * @param id - Zombie ID
   * @returns Zombie if found, undefined otherwise
   */
  get(id: string): Zombie | undefined {
    return this.active.get(id);
  }

  /**
   * Get all active zombies
   * 
   * @returns Array of all active zombies
   */
  getAllActive(): Zombie[] {
    return Array.from(this.active.values());
  }

  /**
   * Check if a zombie is active
   * 
   * @param id - Zombie ID
   * @returns True if zombie is active
   */
  isActive(id: string): boolean {
    return this.active.has(id);
  }

  /**
   * Clear all zombies (active and pooled)
   * Useful for resetting game state
   */
  clear(): void {
    this.pool = [];
    this.active.clear();
    this.updateStats();
  }

  /**
   * Get pool statistics
   * Useful for monitoring performance and debugging
   * 
   * @returns Pool statistics object
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Create a new zombie instance
   * 
   * @param config - Zombie configuration
   * @returns New zombie
   */
  private createZombie(config: ZombieAcquireConfig): Zombie {
    return {
      id: uuidv4(),
      type: config.type,
      visualVariant: config.visualVariant,
      strength: config.strength,
      position: { ...config.position },
      targetBlockade: config.targetBlockade,
      speed: config.speed,
      state: 'spawning',
      transactionId: config.transactionId,
      spriteFrame: 0,
      spawnedFrom: config.transactionId,
      direction: config.direction || 'S',
      spawnPosition: { ...config.position }, // Store initial spawn position
      spawnTime: config.spawnTime, // Store spawn time for playback synchronization
    };
  }

  /**
   * Reset a zombie for reuse
   * 
   * Updates all properties to match the new configuration
   * while keeping the same object instance.
   * 
   * @param zombie - Zombie to reset
   * @param config - New configuration
   */
  private resetZombie(zombie: Zombie, config: ZombieAcquireConfig): void {
    // Generate new ID for the reused zombie
    zombie.id = uuidv4();
    
    // Reset all properties
    zombie.type = config.type;
    zombie.visualVariant = config.visualVariant;
    zombie.strength = config.strength;
    zombie.position = { ...config.position };
    zombie.targetBlockade = config.targetBlockade;
    zombie.speed = config.speed;
    zombie.state = 'spawning';
    zombie.transactionId = config.transactionId;
    zombie.spriteFrame = 0;
    zombie.spawnedFrom = config.transactionId;
    zombie.direction = config.direction || 'S';
    zombie.spawnPosition = { ...config.position }; // Store initial spawn position
    zombie.spawnTime = config.spawnTime; // Store spawn time for playback synchronization
  }

  /**
   * Update internal statistics
   */
  private updateStats(): void {
    this.stats.currentActive = this.active.size;
    this.stats.currentPooled = this.pool.length;
  }
}

/**
 * Global zombie pool instance
 * Use this singleton for the entire application
 */
export const globalZombiePool = new ZombiePool(50);

/**
 * Helper function to spawn a zombie using the global pool
 * 
 * @param config - Zombie configuration
 * @returns Spawned zombie from pool
 */
export function spawnZombieFromPool(config: ZombieAcquireConfig): Zombie {
  return globalZombiePool.acquire(config);
}

/**
 * Helper function to release a zombie to the global pool
 * 
 * @param zombie - Zombie to release
 */
export function releaseZombieToPool(zombie: Zombie): void {
  globalZombiePool.release(zombie);
}

/**
 * Helper function to get all active zombies from the global pool
 * 
 * @returns Array of all active zombies
 */
export function getActiveZombies(): Zombie[] {
  return globalZombiePool.getAllActive();
}

/**
 * Helper function to clear all zombies from the global pool
 * Useful for resetting game state
 */
export function clearZombiePool(): void {
  globalZombiePool.clear();
}

/**
 * Helper function to get pool statistics
 * 
 * @returns Pool statistics
 */
export function getZombiePoolStats() {
  return globalZombiePool.getStats();
}
