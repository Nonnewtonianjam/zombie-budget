/**
 * Blockade Component
 * 
 * Renders a defensive blockade structure in the isometric game view.
 * Represents budget allocation for a category with visual health indicators.
 * 
 * Features:
 * - Isometric blockade sprite rendering (128x128px)
 * - Health visualization with progress bar
 * - Visual degradation based on health state
 * - Damage and healing effects
 * - Proper z-index layering for depth
 * 
 * Health System:
 * - maxHealth = budget amount for category
 * - currentHealth = remaining after damage/healing
 * - Visual states: intact (75-100%), damaged (50-74%), critical (25-49%), destroyed (0-24%)
 */

import React from 'react';
import type { Blockade as BlockadeData, BlockadeType, IsometricPosition } from '../../types/blockade';
import { isoToScreen } from '../../lib/isometric';
import { BlockadeSprite } from './BlockadeSprite';
import { ProgressBar } from '../ui/ProgressBar';
import { getBlockadeState } from '../../types/blockade';

interface BlockadeProps {
  /** Blockade data including position, health, and category */
  blockade: BlockadeData;
  /** Canvas center X coordinate for positioning */
  centerX: number;
  /** Canvas center Y coordinate for positioning */
  centerY: number;
  /** Show health bar above blockade */
  showHealthBar?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Render a blockade in the game canvas
 * 
 * This component renders both the blockade sprite and health visualization.
 * Should be positioned using isometric coordinates and rendered in proper z-order.
 */
export const Blockade: React.FC<BlockadeProps> = ({
  blockade,
  centerX,
  centerY,
  showHealthBar = true,
  className = '',
}) => {
  // Convert isometric position to screen coordinates
  const screenPos = isoToScreen(
    blockade.position.x,
    blockade.position.y,
    blockade.position.z
  );

  // Calculate render position (centered on isometric position)
  const spriteWidth = 128;
  const spriteHeight = 128;
  const renderX = centerX + screenPos.x - (spriteWidth / 2);
  const renderY = centerY + screenPos.y - (spriteHeight / 2);

  // Calculate z-index for proper layering
  const zIndex = Math.floor(
    blockade.position.x + blockade.position.y + blockade.position.z * 1000
  );

  // Get current blockade state based on health
  const state = getBlockadeState(blockade.currentHealth, blockade.maxHealth);

  return (
    <div
      className={`absolute ${className}`}
      style={{
        left: `${renderX}px`,
        top: `${renderY}px`,
        width: `${spriteWidth}px`,
        height: `${spriteHeight}px`,
        zIndex,
      }}
    >
      {/* Blockade Sprite */}
      <div className="relative">
        <BlockadeSprite
          type={blockade.category}
          state={state}
          width={spriteWidth}
          height={spriteHeight}
        />

        {/* Health Bar (positioned above sprite) */}
        {showHealthBar && (
          <div className="absolute -top-8 left-0 right-0 px-2">
            <ProgressBar
              value={blockade.currentHealth}
              max={blockade.maxHealth}
              size="small"
              showLabel={false}
            />
            {/* Category label */}
            <div className="text-xs font-mono text-ghost-dim text-center mt-1 capitalize">
              {blockade.category}
            </div>
          </div>
        )}

        {/* Pulsing glow effect when critical */}
        {state === 'critical' && (
          <div
            className="absolute inset-0 bg-blood-red opacity-20 rounded-lg animate-pulse pointer-events-none"
            style={{
              filter: 'blur(8px)',
            }}
          />
        )}

        {/* Destroyed overlay */}
        {state === 'destroyed' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-blood-red font-bold text-sm opacity-80">
              DESTROYED
            </div>
          </div>
        )}
      </div>

      {/* Debug info (development mode only) */}
      {import.meta.env.DEV && (
        <div className="absolute -bottom-16 left-0 right-0 text-xs font-mono text-ghost-dim text-center space-y-0.5">
          <div>HP: {Math.round(blockade.currentHealth)}/{blockade.maxHealth}</div>
          <div>State: {state}</div>
          <div>Pos: ({blockade.position.x.toFixed(1)}, {blockade.position.y.toFixed(1)})</div>
        </div>
      )}
    </div>
  );
};

/**
 * Canvas-based rendering function for blockades
 * Alternative to React component for pure canvas rendering
 * 
 * @param ctx - Canvas 2D rendering context
 * @param blockade - Blockade data
 * @param centerX - Canvas center X coordinate
 * @param centerY - Canvas center Y coordinate
 */
export function renderBlockadeOnCanvas(
  ctx: CanvasRenderingContext2D,
  blockade: BlockadeData,
  centerX: number,
  centerY: number
): void {
  // Convert isometric position to screen coordinates
  const screenPos = isoToScreen(
    blockade.position.x,
    blockade.position.y,
    blockade.position.z
  );

  const spriteWidth = 128;
  const spriteHeight = 128;
  const renderX = centerX + screenPos.x - (spriteWidth / 2);
  const renderY = centerY + screenPos.y - (spriteHeight / 2);

  // Get current state
  const state = getBlockadeState(blockade.currentHealth, blockade.maxHealth);

  // Draw placeholder (actual sprite rendering would use BlockadeSprite)
  ctx.save();

  // Category colors
  const colors: Record<string, string> = {
    food: '#4a9d5f',
    entertainment: '#d97548',
    shopping: '#a83232',
    subscriptions: '#6a7a9d',
  };

  const color = colors[blockade.category] || '#4a4a4a';

  // Apply opacity based on state
  const opacities = {
    intact: 1.0,
    damaged: 0.8,
    critical: 0.6,
    destroyed: 0.3,
  };
  ctx.globalAlpha = opacities[state];

  // Draw blockade rectangle
  ctx.fillStyle = color;
  ctx.fillRect(renderX, renderY, spriteWidth, spriteHeight);

  // Draw border
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 2;
  ctx.strokeRect(renderX, renderY, spriteWidth, spriteHeight);

  // Draw health bar
  const healthBarWidth = spriteWidth - 20;
  const healthBarHeight = 8;
  const healthBarX = renderX + 10;
  const healthBarY = renderY - 20;

  // Health bar background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  // Health bar fill
  const healthPercent = blockade.maxHealth > 0 
    ? blockade.currentHealth / blockade.maxHealth 
    : 0;
  const fillWidth = healthBarWidth * healthPercent;

  // Color based on health
  if (healthPercent >= 0.75) {
    ctx.fillStyle = '#4a9d5f'; // toxic-green
  } else if (healthPercent >= 0.5) {
    ctx.fillStyle = '#d97548'; // warning-orange
  } else if (healthPercent >= 0.25) {
    ctx.fillStyle = '#a83232'; // blood-red
  } else {
    ctx.fillStyle = '#4a4a4a'; // decay-gray
  }

  ctx.fillRect(healthBarX, healthBarY, fillWidth, healthBarHeight);

  // Health bar border
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 1;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  // Draw category label
  ctx.fillStyle = '#e8e8f0';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    blockade.category.toUpperCase(),
    renderX + spriteWidth / 2,
    renderY + spriteHeight + 15
  );

  // Draw destroyed text
  if (state === 'destroyed') {
    ctx.fillStyle = '#a83232';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DESTROYED', renderX + spriteWidth / 2, renderY + spriteHeight / 2);
  }

  ctx.restore();
}

/**
 * Apply damage to a blockade
 * Returns updated blockade with reduced health
 * 
 * @param blockade - Blockade to damage
 * @param damageAmount - Amount of damage to apply
 * @returns Updated blockade
 */
export function damageBlockade(
  blockade: BlockadeData,
  damageAmount: number
): BlockadeData {
  const newHealth = Math.max(0, blockade.currentHealth - damageAmount);
  const newState = getBlockadeState(newHealth, blockade.maxHealth);
  
  return {
    ...blockade,
    currentHealth: newHealth,
    state: newState,
    visualLevel: getVisualLevel(newHealth, blockade.maxHealth),
  };
}

/**
 * Apply healing to a blockade
 * Returns updated blockade with increased health (capped at maxHealth)
 * 
 * @param blockade - Blockade to heal
 * @param healAmount - Amount of healing to apply
 * @returns Updated blockade
 */
export function healBlockade(
  blockade: BlockadeData,
  healAmount: number
): BlockadeData {
  const newHealth = Math.min(blockade.maxHealth, blockade.currentHealth + healAmount);
  const newState = getBlockadeState(newHealth, blockade.maxHealth);
  
  return {
    ...blockade,
    currentHealth: newHealth,
    state: newState,
    visualLevel: getVisualLevel(newHealth, blockade.maxHealth),
  };
}

/**
 * Helper function to calculate visual level from health
 */
function getVisualLevel(currentHealth: number, maxHealth: number): number {
  if (maxHealth === 0) return 0;
  
  const healthPercent = (currentHealth / maxHealth) * 100;
  
  if (healthPercent >= 75) return 3;  // Intact
  if (healthPercent >= 50) return 2;  // Damaged
  if (healthPercent >= 25) return 1;  // Critical
  return 0;                           // Destroyed
}

/**
 * Check if blockade is destroyed
 * 
 * @param blockade - Blockade to check
 * @returns True if blockade is destroyed
 */
export function isBlockadeDestroyed(blockade: BlockadeData): boolean {
  return blockade.currentHealth <= 0;
}

/**
 * Create a new blockade instance
 * 
 * @param category - Blockade category
 * @param budgetAmount - Budget amount (becomes maxHealth)
 * @param position - Isometric position
 * @param index - Optional index for multiple blockades of same category
 * @returns New blockade instance
 */
export function createBlockade(
  category: BlockadeData['category'],
  budgetAmount: number,
  position: BlockadeData['position'],
  index: number = 0
): BlockadeData {
  return {
    id: `blockade-${category}-${index}-${Date.now()}`,
    category,
    maxHealth: budgetAmount,
    currentHealth: budgetAmount,
    position,
    state: 'intact',
    visualLevel: 3,
  };
}

/**
 * Create blockade for a category (1 blockade per category)
 * 
 * @param category - Blockade category
 * @param budgetAmount - Total budget amount for category
 * @returns Array with 1 blockade instance
 */
export function createBlockadesForCategory(
  category: BlockadeData['category'],
  budgetAmount: number
): BlockadeData[] {
  const position = getBlockadePositionForCategory(category);
  
  // Full budget amount goes to single blockade
  return [createBlockade(category, budgetAmount, position, 0)];
}

/**
 * Get blockade position for a category (one per side)
 * Inline implementation to avoid circular dependency
 */
function getBlockadePositionForCategory(category: BlockadeType): IsometricPosition {
  const distance = 2; // Units from home base (closer than before)
  
  switch (category) {
    case 'food':
      return { x: -distance, y: 0, z: 0 }; // Left side
    case 'entertainment':
      return { x: distance, y: 0, z: 0 }; // Right side
    case 'shopping':
      return { x: 0, y: distance, z: 0 }; // Bottom side
    case 'subscriptions':
      return { x: 0, y: -distance, z: 0 }; // Top side
  }
}

/**
 * Create all blockades for all categories (4 blockades total - one per category)
 * 
 * @param budgets - Budget amounts for each category
 * @returns Array of 4 blockade instances
 */
export function createAllBlockades(budgets: {
  food: number;
  entertainment: number;
  shopping: number;
  subscriptions: number;
}): BlockadeData[] {
  const blockades: BlockadeData[] = [];
  
  blockades.push(...createBlockadesForCategory('food', budgets.food));
  blockades.push(...createBlockadesForCategory('entertainment', budgets.entertainment));
  blockades.push(...createBlockadesForCategory('shopping', budgets.shopping));
  blockades.push(...createBlockadesForCategory('subscriptions', budgets.subscriptions));
  
  return blockades;
}

/**
 * Update blockade health based on new budget amounts
 * Preserves current damage state while updating maxHealth
 * 
 * @param existingBlockades - Current blockades
 * @param budgets - New budget amounts for each category
 * @returns Updated blockades with new maxHealth values
 */
export function updateBlockadeHealth(
  existingBlockades: BlockadeData[],
  budgets: {
    food: number;
    entertainment: number;
    shopping: number;
    subscriptions: number;
  }
): BlockadeData[] {
  return existingBlockades.map(blockade => {
    // Get new budget amount for this category (full amount per blockade now)
    const newMaxHealth = budgets[blockade.category];
    
    // Calculate current health percentage to preserve damage state
    const healthPercent = blockade.maxHealth > 0 
      ? blockade.currentHealth / blockade.maxHealth 
      : 1.0;
    
    // Apply same health percentage to new maxHealth
    const newCurrentHealth = newMaxHealth * healthPercent;
    
    // Update state based on new health values
    const newState = getBlockadeState(newCurrentHealth, newMaxHealth);
    const newVisualLevel = getVisualLevel(newCurrentHealth, newMaxHealth);
    
    return {
      ...blockade,
      maxHealth: newMaxHealth,
      currentHealth: newCurrentHealth,
      state: newState,
      visualLevel: newVisualLevel,
    };
  });
}
