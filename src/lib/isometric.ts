/**
 * Isometric Coordinate System Utilities
 * 
 * Provides functions for converting between screen coordinates and isometric coordinates,
 * as well as calculating z-index for proper depth layering.
 * 
 * Coordinate Systems:
 * - Screen: Standard 2D canvas coordinates (x: right, y: down)
 * - Isometric: 3D world coordinates projected to 2D (x: right-forward, y: left-forward, z: up)
 * 
 * Projection: 30-degree angle (π/6 radians)
 * Scale: 128 pixels per isometric unit
 */

import { ISOMETRIC_CONFIG, RENDER_CONFIG } from '../constants/game';

/**
 * 3D position in isometric space
 */
export interface IsoPosition {
  /** X coordinate (right-forward in isometric view) */
  x: number;
  /** Y coordinate (left-forward in isometric view) */
  y: number;
  /** Z coordinate (vertical height) */
  z: number;
}

/**
 * 2D position in screen space
 */
export interface ScreenPosition {
  /** X coordinate (horizontal pixels from left) */
  x: number;
  /** Y coordinate (vertical pixels from top) */
  y: number;
}

/**
 * Convert screen coordinates to isometric coordinates
 * 
 * This function transforms 2D screen pixel coordinates into 3D isometric world coordinates.
 * Useful for mouse/touch input handling and placing objects in the world.
 * 
 * @param screenX - Horizontal screen coordinate in pixels
 * @param screenY - Vertical screen coordinate in pixels
 * @param z - Optional Z coordinate (height), defaults to 0 (ground level)
 * @returns Isometric position in world units
 * 
 * @example
 * // Convert mouse click at (400, 300) to isometric coordinates
 * const isoPos = screenToIso(400, 300);
 * console.log(isoPos); // { x: 2.31, y: 1.15, z: 0 }
 */
export function screenToIso(
  screenX: number, 
  screenY: number, 
  z: number = 0
): IsoPosition {
  const { COS_ANGLE, SIN_ANGLE, PIXELS_PER_UNIT } = ISOMETRIC_CONFIG;
  
  // Normalize screen coordinates to units
  const normalizedX = screenX / PIXELS_PER_UNIT;
  const normalizedY = screenY / PIXELS_PER_UNIT;
  
  // Apply inverse isometric transformation
  // Formula derived from isometric projection matrix inversion
  const isoX = (normalizedX - normalizedY) * COS_ANGLE;
  const isoY = (normalizedX + normalizedY) * SIN_ANGLE;
  
  return {
    x: isoX,
    y: isoY,
    z,
  };
}

/**
 * Convert isometric coordinates to screen coordinates
 * 
 * This function transforms 3D isometric world coordinates into 2D screen pixel coordinates.
 * Used for rendering objects at their correct screen position.
 * 
 * The Z coordinate affects the vertical screen position (higher Z = higher on screen).
 * 
 * @param isoX - Isometric X coordinate in world units
 * @param isoY - Isometric Y coordinate in world units
 * @param isoZ - Isometric Z coordinate (height) in world units, defaults to 0
 * @returns Screen position in pixels
 * 
 * @example
 * // Convert isometric position (2, 1, 0) to screen coordinates
 * const screenPos = isoToScreen(2, 1, 0);
 * console.log(screenPos); // { x: 332, y: 192 }
 */
export function isoToScreen(
  isoX: number, 
  isoY: number, 
  isoZ: number = 0
): ScreenPosition {
  const { COS_ANGLE, SIN_ANGLE, PIXELS_PER_UNIT } = ISOMETRIC_CONFIG;
  
  // Apply isometric projection transformation
  // X: Projects both iso X and Y onto screen X axis
  // Y: Projects both iso X and Y onto screen Y axis, offset by Z (height)
  const screenX = (isoX / COS_ANGLE + isoY / SIN_ANGLE) / 2;
  const screenY = (isoY / SIN_ANGLE - isoX / COS_ANGLE) / 2 - isoZ;
  
  // Scale to pixels
  return {
    x: screenX * PIXELS_PER_UNIT,
    y: screenY * PIXELS_PER_UNIT,
  };
}

/**
 * Convert IsoPosition object to screen coordinates
 * 
 * Convenience overload that accepts an IsoPosition object instead of separate parameters.
 * 
 * @param position - Isometric position object
 * @returns Screen position in pixels
 * 
 * @example
 * const zombie = { position: { x: 2, y: 1, z: 0 } };
 * const screenPos = isoToScreen(zombie.position);
 */
export function isoToScreenFromPosition(position: IsoPosition): ScreenPosition {
  return isoToScreen(position.x, position.y, position.z);
}

/**
 * Calculate z-index for proper depth layering
 * 
 * Objects further back in the isometric view (higher x + y) should render first,
 * while objects closer to the camera (lower x + y) should render on top.
 * 
 * The Z coordinate (height) is given high priority to ensure flying/jumping objects
 * render above ground-level objects.
 * 
 * @param isoX - Isometric X coordinate
 * @param isoY - Isometric Y coordinate
 * @param isoZ - Isometric Z coordinate (height)
 * @returns Integer z-index value (higher = render on top)
 * 
 * @example
 * const zombie1ZIndex = calculateZIndex(2, 1, 0); // Ground level zombie
 * const zombie2ZIndex = calculateZIndex(1, 2, 0); // Another ground zombie
 * const flyingZIndex = calculateZIndex(2, 1, 2); // Flying object
 * // flyingZIndex > zombie1ZIndex (flying renders on top)
 */
export function calculateZIndex(
  isoX: number, 
  isoY: number, 
  isoZ: number
): number {
  const { Z_INDEX_MULTIPLIER } = RENDER_CONFIG;
  
  // Z (height) has highest priority (multiplied by 1000)
  // X + Y determines front-to-back ordering
  // Floor to ensure integer z-index values
  return Math.floor(isoX + isoY + isoZ * Z_INDEX_MULTIPLIER);
}

/**
 * Calculate z-index from IsoPosition object
 * 
 * Convenience overload that accepts an IsoPosition object.
 * 
 * @param position - Isometric position object
 * @returns Integer z-index value
 * 
 * @example
 * const zombie = { position: { x: 2, y: 1, z: 0 } };
 * const zIndex = calculateZIndexFromPosition(zombie.position);
 */
export function calculateZIndexFromPosition(position: IsoPosition): number {
  return calculateZIndex(position.x, position.y, position.z);
}

/**
 * Get the center of the screen in isometric coordinates
 * 
 * Useful for positioning the home base or calculating spawn points.
 * 
 * @param screenWidth - Canvas width in pixels
 * @param screenHeight - Canvas height in pixels
 * @returns Isometric position at screen center
 * 
 * @example
 * const center = getScreenCenterIso(800, 600);
 * // Place home base at center
 * homeBase.position = center;
 */
export function getScreenCenterIso(
  screenWidth: number, 
  screenHeight: number
): IsoPosition {
  return screenToIso(screenWidth / 2, screenHeight / 2, 0);
}

/**
 * Calculate distance between two isometric positions
 * 
 * Uses 3D Euclidean distance formula.
 * 
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns Distance in isometric units
 * 
 * @example
 * const zombie = { x: 2, y: 1, z: 0 };
 * const blockade = { x: 3, y: 2, z: 0 };
 * const distance = calculateDistance(zombie, blockade);
 * if (distance < 0.5) {
 *   // Zombie is close enough to attack
 * }
 */
export function calculateDistance(pos1: IsoPosition, pos2: IsoPosition): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  const dz = pos2.z - pos1.z;
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Normalize a direction vector
 * 
 * Converts a direction vector to unit length (magnitude = 1).
 * Useful for movement calculations.
 * 
 * @param dx - X component of direction
 * @param dy - Y component of direction
 * @param dz - Z component of direction
 * @returns Normalized direction vector
 * 
 * @example
 * const direction = normalizeDirection(3, 4, 0);
 * // Returns { x: 0.6, y: 0.8, z: 0 }
 * // Can multiply by speed to get movement per frame
 */
export function normalizeDirection(
  dx: number, 
  dy: number, 
  dz: number
): IsoPosition {
  const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  if (magnitude === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  
  return {
    x: dx / magnitude,
    y: dy / magnitude,
    z: dz / magnitude,
  };
}

/**
 * Viewport bounds for culling calculations
 */
export interface Viewport {
  /** Left edge of viewport in screen pixels */
  left: number;
  /** Right edge of viewport in screen pixels */
  right: number;
  /** Top edge of viewport in screen pixels */
  top: number;
  /** Bottom edge of viewport in screen pixels */
  bottom: number;
  /** Center X coordinate in screen pixels */
  centerX: number;
  /** Center Y coordinate in screen pixels */
  centerY: number;
}

/**
 * Create a viewport object from canvas dimensions
 * 
 * @param width - Canvas width in pixels
 * @param height - Canvas height in pixels
 * @param padding - Optional padding to extend viewport bounds (default: 128px for sprite overflow)
 * @returns Viewport bounds object
 * 
 * @example
 * const viewport = createViewport(800, 600);
 * const visibleObjects = cullOffScreen(allObjects, viewport);
 */
export function createViewport(
  width: number,
  height: number,
  padding: number = 128
): Viewport {
  return {
    left: -padding,
    right: width + padding,
    top: -padding,
    bottom: height + padding,
    centerX: width / 2,
    centerY: height / 2,
  };
}

/**
 * Check if a screen position is within viewport bounds
 * 
 * @param screenPos - Screen position to check
 * @param viewport - Viewport bounds
 * @returns True if position is visible, false if off-screen
 * 
 * @example
 * const pos = isoToScreen(zombie.position);
 * if (isInViewport(pos, viewport)) {
 *   renderZombie(zombie);
 * }
 */
export function isInViewport(
  screenPos: ScreenPosition,
  viewport: Viewport
): boolean {
  return (
    screenPos.x >= viewport.left &&
    screenPos.x <= viewport.right &&
    screenPos.y >= viewport.top &&
    screenPos.y <= viewport.bottom
  );
}

/**
 * Check if an isometric position is within viewport bounds
 * 
 * Converts isometric position to screen coordinates and checks visibility.
 * 
 * @param isoPos - Isometric position to check
 * @param viewport - Viewport bounds
 * @returns True if position is visible, false if off-screen
 * 
 * @example
 * if (isIsoPositionInViewport(zombie.position, viewport)) {
 *   renderZombie(zombie);
 * }
 */
export function isIsoPositionInViewport(
  isoPos: IsoPosition,
  viewport: Viewport
): boolean {
  const screenPos = isoToScreen(isoPos.x, isoPos.y, isoPos.z);
  
  // Adjust screen position to be relative to viewport center
  const adjustedPos = {
    x: screenPos.x + viewport.centerX,
    y: screenPos.y + viewport.centerY,
  };
  
  return isInViewport(adjustedPos, viewport);
}

/**
 * Filter objects by viewport visibility
 * 
 * Generic culling function that filters an array of objects with isometric positions.
 * Only returns objects that are visible within the viewport.
 * 
 * @param objects - Array of objects with position property
 * @param viewport - Viewport bounds
 * @returns Filtered array of visible objects
 * 
 * @example
 * const visibleZombies = cullOffScreen(allZombies, viewport);
 * visibleZombies.forEach(zombie => renderZombie(zombie));
 */
export function cullOffScreen<T extends { position: IsoPosition }>(
  objects: T[],
  viewport: Viewport
): T[] {
  return objects.filter(obj => isIsoPositionInViewport(obj.position, viewport));
}
