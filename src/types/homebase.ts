/**
 * Home base state based on overall health percentage
 * Determines visual representation and threat level
 */
export type HomeBaseState = 
  | 'safe'        // 75-100% health - all defenses strong
  | 'threatened'  // 50-74% health - some defenses compromised
  | 'critical';   // 0-49% health - multiple defenses destroyed

/**
 * Isometric position in 3D space
 * Used for proper depth layering and rendering
 */
export interface IsometricPosition {
  x: number;  // Horizontal position
  y: number;  // Vertical position
  z: number;  // Height/depth for layering
}

/**
 * HomeBase interface
 * Represents overall financial health at the center of the isometric grid
 * 
 * Sprite specifications:
 * - Size: 256x256 pixels
 * - Position: Center of isometric grid (0, 0, 0)
 * - Visual states: safe, threatened, critical
 * - Pulsing glow effect when health is low
 * 
 * Health System:
 * - maxHealth = total budget across all categories
 * - health = sum of all blockade health values
 * - Visual state changes based on health percentage
 * - Renders behind zombies (z-index layering)
 */
export interface HomeBase {
  health: number;                  // Overall financial health (sum of blockade health)
  maxHealth: number;               // Total budget across all categories
  state: HomeBaseState;            // Visual state based on health percentage
  position: IsometricPosition;     // 3D position in isometric space (center: 0,0,0)
}

/**
 * Helper function to calculate home base state from health
 */
export function getHomeBaseState(health: number, maxHealth: number): HomeBaseState {
  if (maxHealth === 0) return 'critical';
  
  const healthPercent = (health / maxHealth) * 100;
  
  if (healthPercent >= 75) return 'safe';
  if (healthPercent >= 50) return 'threatened';
  return 'critical';
}

/**
 * Helper function to calculate overall health from blockades
 * Sums the current health of all blockades
 */
export function calculateOverallHealth(blockadeHealthValues: number[]): number {
  return blockadeHealthValues.reduce((sum, health) => sum + health, 0);
}

/**
 * Helper function to calculate max health from budgets
 * Sums the budget amounts for all categories
 */
export function calculateMaxHealth(budgetAmounts: number[]): number {
  return budgetAmounts.reduce((sum, budget) => sum + budget, 0);
}

/**
 * Helper function to check if home base is in critical state
 */
export function isHomeBaseCritical(health: number, maxHealth: number): boolean {
  if (maxHealth === 0) return true;
  return (health / maxHealth) < 0.5;
}

/**
 * Helper function to check if home base should show pulsing glow
 * Activates when health drops below 50%
 */
export function shouldPulseGlow(health: number, maxHealth: number): boolean {
  return isHomeBaseCritical(health, maxHealth);
}

/**
 * Helper function to get home base position (always at center)
 */
export function getHomeBasePosition(): IsometricPosition {
  return { x: 0, y: 0, z: 0 };
}
