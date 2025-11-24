/**
 * Zombie sprite paths for CityZombie 5
 * These sprites are used for all zombie instances in the game
 */

export const ZOMBIE_SPRITE_BASE_PATH = '/src/assets/CityZombie 5';

export const ZOMBIE_ANIMATIONS = {
  IDLE: 'Idle',
  IDLE2: 'Idle2',
  WALK: 'Walk',
  RUN: 'Run',
  CROUCH_RUN: 'CrouchRun',
  ATTACK1: 'Attack1',
  ATTACK2: 'Attack2',
  ATTACK3: 'Attack3',
  ATTACK4: 'Attack4',
  ATTACK5: 'Attack5',
  TAKE_DAMAGE: 'TakeDamage',
  DIE: 'Die',
  DIE2: 'Die2',
  TAUNT: 'Taunt',
  WAKE_UP: 'WakeUp',
} as const;

export type ZombieAnimation = typeof ZOMBIE_ANIMATIONS[keyof typeof ZOMBIE_ANIMATIONS];

/**
 * Get the full path to a zombie animation folder
 */
export function getZombieAnimationPath(animation: ZombieAnimation): string {
  return `${ZOMBIE_SPRITE_BASE_PATH}/${animation}`;
}

/**
 * Default zombie animation for idle state
 */
export const DEFAULT_ZOMBIE_ANIMATION = ZOMBIE_ANIMATIONS.IDLE;

/**
 * Animation used when zombie is moving towards player
 */
export const ZOMBIE_MOVE_ANIMATION = ZOMBIE_ANIMATIONS.WALK;

/**
 * Animation used when zombie attacks (spending money)
 */
export const ZOMBIE_ATTACK_ANIMATION = ZOMBIE_ANIMATIONS.ATTACK1;

/**
 * Animation used when zombie is defeated (transaction defended)
 */
export const ZOMBIE_DEFEAT_ANIMATION = ZOMBIE_ANIMATIONS.DIE;
