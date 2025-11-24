/**
 * Game Constants
 *
 * Core configuration values for the isometric game rendering system.
 * These values define the isometric projection, sprite dimensions, and rendering parameters.
 */

/**
 * Isometric projection configuration
 * 30-degree angle projection for classic isometric view
 */
export const ISOMETRIC_CONFIG = {
  /** Projection angle in degrees (30° for isometric) */
  ANGLE_DEGREES: 30,

  /** Projection angle in radians (π/6) */
  ANGLE_RADIANS: Math.PI / 6,

  /** Number of pixels per isometric unit */
  PIXELS_PER_UNIT: 80, // Scaled for desktop viewport

  /** Cosine of projection angle (pre-calculated for performance) */
  COS_ANGLE: Math.cos(Math.PI / 6), // ≈ 0.866

  /** Sine of projection angle (pre-calculated for performance) */
  SIN_ANGLE: Math.sin(Math.PI / 6), // = 0.5
} as const;

/**
 * Sprite dimensions and configuration
 */
export const SPRITE_CONFIG = {
  /** Zombie sprite width in pixels */
  ZOMBIE_WIDTH: 128,

  /** Zombie sprite height in pixels */
  ZOMBIE_HEIGHT: 256,

  /** Blockade sprite width in pixels */
  BLOCKADE_WIDTH: 128,

  /** Blockade sprite height in pixels */
  BLOCKADE_HEIGHT: 128,

  /** Home base sprite width in pixels */
  HOME_BASE_WIDTH: 256,

  /** Home base sprite height in pixels */
  HOME_BASE_HEIGHT: 256,

  /** Sprite pivot point (x: 0.5 = center horizontally) */
  PIVOT_X: 0.5,

  /** Sprite pivot point (y: 0.19 = near bottom for ground contact) */
  PIVOT_Y: 0.19,
} as const;

/**
 * Performance and rendering configuration
 */
export const RENDER_CONFIG = {
  /** Target frames per second */
  TARGET_FPS: 60,

  /** Minimum acceptable FPS before quality degradation */
  MIN_FPS: 30,

  /** Z-index multiplier for depth layering (higher = more separation) */
  Z_INDEX_MULTIPLIER: 1000,
} as const;

/**
 * Grid and world configuration
 */
export const WORLD_CONFIG = {
  /** Grid size for development reference (half of sprite size) */
  GRID_SIZE: 64,

  /** Number of blockades (one per category) */
  BLOCKADE_COUNT: 4,

  /** Distance of blockades from home base (in isometric units) */
  BLOCKADE_DISTANCE: 3,
} as const;
