/**
 * Combat System
 * 
 * Handles damage logic when zombies attack blockades.
 * Manages attack timing, damage calculation, and blockade health updates.
 * 
 * Features:
 * - Attack cooldown system (zombies attack every N seconds)
 * - Damage calculation based on zombie strength
 * - Blockade health updates
 * - Attack event tracking for visual effects
 */

import type { Zombie } from '../types/zombie';
import type { Blockade } from '../types/blockade';
import { damageBlockade, healBlockade, isBlockadeDestroyed } from '../components/game/Blockade';
import { defeatZombie } from '../components/game/Zombie';

/**
 * Attack configuration
 */
export const ATTACK_CONFIG = {
  /** Time between attacks in seconds */
  ATTACK_COOLDOWN: 1.0,
  /** Distance at which zombie can attack blockade (in isometric units) */
  ATTACK_RANGE: 0.5,
  /** Damage multiplier (zombie strength * multiplier = damage dealt) */
  DAMAGE_MULTIPLIER: 1.0,
} as const;

/**
 * Attack event for tracking and visual effects
 */
export interface AttackEvent {
  zombieId: string;
  blockadeId: string;
  damage: number;
  timestamp: number;
  blockadeDestroyed: boolean;
}

/**
 * Healing event for tracking and visual effects
 */
export interface HealEvent {
  transactionId: string;
  blockadeId: string;
  healAmount: number;
  timestamp: number;
  blockadeFullyHealed: boolean;
}

/**
 * Zombie attack state tracking
 * Tracks when each zombie last attacked for cooldown management
 */
export interface ZombieAttackState {
  zombieId: string;
  lastAttackTime: number;
  totalDamageDealt: number;
}

/**
 * Combat state manager
 * Tracks attack states for all zombies and healing events
 */
export class CombatManager {
  private attackStates: Map<string, ZombieAttackState> = new Map();
  private attackEvents: AttackEvent[] = [];
  private healEvents: HealEvent[] = [];

  /**
   * Process zombie attacks on blockades
   * Call this each game loop iteration
   * 
   * @param zombies - All active zombies
   * @param blockades - All active blockades
   * @param currentTime - Current game time in seconds
   * @returns Updated zombies and blockades after processing attacks
   */
  processAttacks(
    zombies: Zombie[],
    blockades: Blockade[],
    currentTime: number
  ): { zombies: Zombie[]; blockades: Blockade[]; events: AttackEvent[] } {
    const updatedZombies = [...zombies];
    const updatedBlockades = [...blockades];
    const newEvents: AttackEvent[] = [];

    // Process each attacking zombie
    zombies.forEach((zombie, zombieIndex) => {
      if (zombie.state !== 'attacking') {
        return;
      }

      // Find target blockade
      const blockadeIndex = blockades.findIndex(
        b => b.id === zombie.targetBlockade || b.category === zombie.targetBlockade
      );

      if (blockadeIndex === -1) {
        // Target blockade not found (might be destroyed)
        return;
      }

      const blockade = blockades[blockadeIndex];

      // Check if blockade is already destroyed
      if (isBlockadeDestroyed(blockade)) {
        // Blockade destroyed, zombie should be defeated (no more targets)
        updatedZombies[zombieIndex] = defeatZombie(zombie);
        return;
      }

      // Check attack cooldown
      const attackState = this.attackStates.get(zombie.id);
      const lastAttackTime = attackState?.lastAttackTime ?? 0;
      const timeSinceLastAttack = currentTime - lastAttackTime;

      if (timeSinceLastAttack >= ATTACK_CONFIG.ATTACK_COOLDOWN) {
        // Zombie can attack!
        const damage = this.calculateDamage(zombie);
        const damagedBlockade = damageBlockade(blockade, damage);
        const blockadeDestroyed = isBlockadeDestroyed(damagedBlockade);

        // Update blockade
        updatedBlockades[blockadeIndex] = damagedBlockade;

        // Update attack state
        this.attackStates.set(zombie.id, {
          zombieId: zombie.id,
          lastAttackTime: currentTime,
          totalDamageDealt: (attackState?.totalDamageDealt ?? 0) + damage,
        });

        // Create attack event for visual effects
        const event: AttackEvent = {
          zombieId: zombie.id,
          blockadeId: blockade.id,
          damage,
          timestamp: currentTime,
          blockadeDestroyed,
        };
        newEvents.push(event);

        // If blockade destroyed, defeat the zombie (mission accomplished)
        if (blockadeDestroyed) {
          updatedZombies[zombieIndex] = defeatZombie(zombie);
        }
      }
    });

    // Store events for retrieval
    this.attackEvents.push(...newEvents);

    // Keep only recent events (last 5 seconds)
    this.attackEvents = this.attackEvents.filter(
      e => currentTime - e.timestamp < 5
    );

    return {
      zombies: updatedZombies,
      blockades: updatedBlockades,
      events: newEvents,
    };
  }

  /**
   * Calculate damage dealt by zombie
   * 
   * @param zombie - Attacking zombie
   * @returns Damage amount
   */
  private calculateDamage(zombie: Zombie): number {
    return zombie.strength * ATTACK_CONFIG.DAMAGE_MULTIPLIER;
  }

  /**
   * Check if zombie is in range to attack blockade
   * 
   * @param zombie - Zombie to check
   * @param blockade - Target blockade
   * @returns True if zombie is in attack range
   */
  isInAttackRange(zombie: Zombie, blockade: Blockade): boolean {
    const dx = zombie.position.x - blockade.position.x;
    const dy = zombie.position.y - blockade.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= ATTACK_CONFIG.ATTACK_RANGE;
  }

  /**
   * Get recent attack events
   * Useful for triggering visual effects
   * 
   * @param maxAge - Maximum age of events in seconds (default: 1)
   * @returns Recent attack events
   */
  getRecentEvents(maxAge: number = 1): AttackEvent[] {
    const now = Date.now() / 1000;
    return this.attackEvents.filter(e => now - e.timestamp < maxAge);
  }

  /**
   * Get attack state for a zombie
   * 
   * @param zombieId - Zombie ID
   * @returns Attack state or undefined if not found
   */
  getAttackState(zombieId: string): ZombieAttackState | undefined {
    return this.attackStates.get(zombieId);
  }

  /**
   * Clear attack state for a zombie (when zombie is removed)
   * 
   * @param zombieId - Zombie ID
   */
  clearAttackState(zombieId: string): void {
    this.attackStates.delete(zombieId);
  }

  /**
   * Process healing from good spending transactions
   * Call this when a good spending transaction occurs
   * 
   * @param transactionId - ID of the transaction causing healing
   * @param category - Category to heal (null = heal all categories proportionally)
   * @param healAmount - Amount of healing to apply
   * @param blockades - All active blockades
   * @param currentTime - Current game time in seconds
   * @returns Updated blockades after healing and heal events
   */
  processHealing(
    transactionId: string,
    category: string | null,
    healAmount: number,
    blockades: Blockade[],
    currentTime: number
  ): { blockades: Blockade[]; events: HealEvent[] } {
    const updatedBlockades = [...blockades];
    const newEvents: HealEvent[] = [];

    // Determine which blockades to heal
    let targetBlockades: Array<{ blockade: Blockade; index: number }>;
    
    if (category === null) {
      // Heal all blockades proportionally
      targetBlockades = blockades.map((b, index) => ({ blockade: b, index }));
    } else {
      // Heal only blockades of the specified category
      targetBlockades = blockades
        .map((b, index) => ({ blockade: b, index }))
        .filter(({ blockade }) => blockade.category === category);
    }

    if (targetBlockades.length === 0) {
      // No blockades found
      return { blockades, events: [] };
    }

    // Split healing evenly among target blockades
    const healPerBlockade = healAmount / targetBlockades.length;

    // Apply healing to each blockade
    targetBlockades.forEach(({ blockade, index }) => {
      const healedBlockade = healBlockade(blockade, healPerBlockade);
      updatedBlockades[index] = healedBlockade;

      // Check if blockade is fully healed
      const blockadeFullyHealed = healedBlockade.currentHealth >= healedBlockade.maxHealth;

      // Create heal event for visual effects
      const event: HealEvent = {
        transactionId,
        blockadeId: blockade.id,
        healAmount: healPerBlockade,
        timestamp: currentTime,
        blockadeFullyHealed,
      };
      newEvents.push(event);
    });

    // Store events for retrieval
    this.healEvents.push(...newEvents);

    // Keep only recent events (last 5 seconds)
    this.healEvents = this.healEvents.filter(
      e => currentTime - e.timestamp < 5
    );

    return {
      blockades: updatedBlockades,
      events: newEvents,
    };
  }

  /**
   * Get recent heal events
   * Useful for triggering visual effects
   * 
   * @param maxAge - Maximum age of events in seconds (default: 1)
   * @returns Recent heal events
   */
  getRecentHealEvents(maxAge: number = 1): HealEvent[] {
    const now = Date.now() / 1000;
    return this.healEvents.filter(e => now - e.timestamp < maxAge);
  }

  /**
   * Reset all combat state
   * Useful for restarting playback or clearing game
   */
  reset(): void {
    this.attackStates.clear();
    this.attackEvents = [];
    this.healEvents = [];
  }

  /**
   * Get total damage dealt by a zombie
   * 
   * @param zombieId - Zombie ID
   * @returns Total damage dealt
   */
  getTotalDamageDealt(zombieId: string): number {
    return this.attackStates.get(zombieId)?.totalDamageDealt ?? 0;
  }
}

/**
 * Helper function to check if zombie should transition to attacking state
 * Call this during zombie movement updates
 * 
 * @param zombie - Zombie to check
 * @param blockade - Target blockade
 * @returns True if zombie should start attacking
 */
export function shouldStartAttacking(zombie: Zombie, blockade: Blockade): boolean {
  if (zombie.state !== 'moving') {
    return false;
  }

  if (isBlockadeDestroyed(blockade)) {
    return false;
  }

  const dx = zombie.position.x - blockade.position.x;
  const dy = zombie.position.y - blockade.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= ATTACK_CONFIG.ATTACK_RANGE;
}

/**
 * Helper function to find target blockade for a zombie
 * 
 * @param zombie - Zombie looking for target
 * @param blockades - All available blockades
 * @returns Target blockade or undefined if not found
 */
export function findTargetBlockade(
  zombie: Zombie,
  blockades: Blockade[]
): Blockade | undefined {
  // First try to find by exact ID match
  let target = blockades.find(b => b.id === zombie.targetBlockade);
  
  // If not found, try to find by category match (for backward compatibility)
  if (!target) {
    target = blockades.find(b => b.category === zombie.targetBlockade);
  }

  return target;
}

/**
 * Helper function to find closest non-destroyed blockade of a category
 * Useful when primary target is destroyed
 * 
 * @param zombie - Zombie looking for new target
 * @param blockades - All available blockades
 * @returns Closest blockade of same category or undefined
 */
export function findClosestBlockadeOfCategory(
  zombie: Zombie,
  blockades: Blockade[]
): Blockade | undefined {
  // Get zombie's target category
  const targetCategory = zombie.targetBlockade;

  // Filter blockades by category and non-destroyed
  const categoryBlockades = blockades.filter(
    b => b.category === targetCategory && !isBlockadeDestroyed(b)
  );

  if (categoryBlockades.length === 0) {
    return undefined;
  }

  // Find closest blockade
  let closest = categoryBlockades[0];
  let closestDistance = calculateDistance(zombie.position, closest.position);

  for (let i = 1; i < categoryBlockades.length; i++) {
    const blockade = categoryBlockades[i];
    const distance = calculateDistance(zombie.position, blockade.position);
    if (distance < closestDistance) {
      closest = blockade;
      closestDistance = distance;
    }
  }

  return closest;
}

/**
 * Calculate distance between two isometric positions
 */
function calculateDistance(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate heal amount from transaction
 * Good spending transactions heal blockades based on transaction amount
 * 
 * @param transactionAmount - Amount of the good spending transaction
 * @returns Heal amount to apply to blockades
 */
export function calculateHealAmount(transactionAmount: number): number {
  // Heal amount equals transaction amount
  // This provides direct positive reinforcement for good spending
  return transactionAmount;
}

/**
 * Determine which category to heal based on transaction category
 * Good spending (savings, debt_payment) heals all categories proportionally
 * 
 * @param transactionCategory - Category of the transaction
 * @returns Category to heal, or null to heal all categories
 */
export function getHealTargetCategory(transactionCategory: string): string | null {
  // For good spending categories (savings, debt_payment), heal all categories
  if (transactionCategory === 'savings' || transactionCategory === 'debt_payment') {
    return null; // null means heal all categories
  }
  
  // For regular categories, heal the same category
  return transactionCategory;
}
