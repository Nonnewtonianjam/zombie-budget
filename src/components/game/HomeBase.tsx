/**
 * HomeBase Component
 * 
 * Renders the central defensive structure representing overall financial health.
 * Located at the center of the isometric grid (0, 0, 0).
 * 
 * Features:
 * - 256x256px home base sprite rendering
 * - Visual states based on overall health (safe, threatened, critical)
 * - Pulsing glow effect when health is low (< 50%)
 * - Proper z-index layering (renders behind zombies)
 * - Health visualization
 * 
 * Health System:
 * - maxHealth = total budget across all categories
 * - health = sum of all blockade health values
 * - Visual state changes based on health percentage:
 *   - safe: 75-100% health
 *   - threatened: 50-74% health
 *   - critical: 0-49% health
 */

import React from 'react';
import type { HomeBase as HomeBaseData } from '../../types/homebase';
import { isoToScreen } from '../../lib/isometric';
import { 
  shouldPulseGlow, 
  getHomeBaseState, 
  getHomeBasePosition,
  calculateOverallHealth 
} from '../../types/homebase';

interface HomeBaseProps {
  /** Home base data including position and health */
  homeBase: HomeBaseData;
  /** Canvas center X coordinate for positioning */
  centerX: number;
  /** Canvas center Y coordinate for positioning */
  centerY: number;
  /** Show health indicator */
  showHealth?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Render the home base in the game canvas
 * 
 * This component renders the central home base structure with health visualization.
 * Should be positioned at isometric origin (0, 0, 0) and rendered behind zombies.
 */
export const HomeBase: React.FC<HomeBaseProps> = ({
  homeBase,
  centerX,
  centerY,
  showHealth = true,
  className = '',
}) => {
  // Convert isometric position to screen coordinates
  const screenPos = isoToScreen(
    homeBase.position.x,
    homeBase.position.y,
    homeBase.position.z
  );

  // Calculate render position (centered on isometric position)
  const spriteWidth = 256;
  const spriteHeight = 256;
  const renderX = centerX + screenPos.x - (spriteWidth / 2);
  const renderY = centerY + screenPos.y - (spriteHeight / 2);

  // Calculate z-index for proper layering (should be behind zombies)
  // Home base at origin (0,0,0) will have z-index of 0
  // Zombies at positive x,y positions will have higher z-index and render on top
  const zIndex = Math.floor(
    homeBase.position.x + homeBase.position.y + homeBase.position.z * 1000
  );

  // Calculate health percentage
  const healthPercent = homeBase.maxHealth > 0 
    ? (homeBase.health / homeBase.maxHealth) * 100 
    : 0;

  // Determine if pulsing glow should be active
  const shouldPulse = shouldPulseGlow(homeBase.health, homeBase.maxHealth);

  // Get state color and visual effects
  const stateColors = {
    safe: '#4a9d5f',      // toxic-green
    threatened: '#d97548', // warning-orange
    critical: '#a83232',   // blood-red
  };
  const stateColor = stateColors[homeBase.state];

  // State-specific visual effects
  const stateEffects = {
    safe: {
      filter: 'brightness(1.0) saturate(1.0)',
      glowIntensity: 0,
      borderColor: 'rgba(74, 157, 95, 0.3)',
    },
    threatened: {
      filter: 'brightness(0.9) saturate(1.1)',
      glowIntensity: 0.2,
      borderColor: 'rgba(217, 117, 72, 0.5)',
    },
    critical: {
      filter: 'brightness(0.8) saturate(1.3) contrast(1.1)',
      glowIntensity: 0.4,
      borderColor: 'rgba(168, 50, 50, 0.7)',
    },
  };
  const effects = stateEffects[homeBase.state];

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
      {/* Home Base Sprite */}
      <div className="relative">
        {/* State-based border glow */}
        {homeBase.state !== 'safe' && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              border: `2px solid ${effects.borderColor}`,
              boxShadow: `0 0 20px ${effects.borderColor}`,
            }}
          />
        )}

        <img
          src="/assets/Homebase.png"
          alt="Home Base"
          className="w-full h-full object-contain transition-all duration-500"
          style={{
            imageRendering: 'pixelated',
            filter: effects.filter,
          }}
        />

        {/* Pulsing glow effect when health is low */}
        {shouldPulse && (
          <div
            className="absolute inset-0 rounded-lg animate-pulse pointer-events-none"
            style={{
              backgroundColor: stateColor,
              opacity: 0.3 + effects.glowIntensity,
              filter: 'blur(16px)',
            }}
          />
        )}

        {/* Health indicator overlay */}
        {showHealth && (
          <div className="absolute -top-12 left-0 right-0">
            {/* Health bar */}
            <div className="bg-background-secondary rounded-full h-3 overflow-hidden mx-8">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${healthPercent}%`,
                  backgroundColor: stateColor,
                }}
              />
            </div>
            
            {/* Health text */}
            <div className="text-xs font-mono text-ghost-dim text-center mt-1">
              <span style={{ color: stateColor }}>
                {Math.round(homeBase.health)}
              </span>
              <span className="text-decay-gray"> / </span>
              <span>{homeBase.maxHealth}</span>
            </div>
          </div>
        )}

        {/* State indicator with enhanced visuals */}
        <div className="absolute -bottom-10 left-0 right-0 text-center">
          <div 
            className="inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300"
            style={{ 
              color: homeBase.state === 'safe' ? stateColor : '#e8e8f0',
              backgroundColor: homeBase.state === 'safe' 
                ? 'rgba(74, 157, 95, 0.2)' 
                : homeBase.state === 'threatened'
                ? 'rgba(217, 117, 72, 0.3)'
                : 'rgba(168, 50, 50, 0.4)',
              border: `2px solid ${stateColor}`,
              boxShadow: homeBase.state !== 'safe' 
                ? `0 0 10px ${stateColor}` 
                : 'none',
            }}
          >
            {homeBase.state === 'safe' && '✓ '}
            {homeBase.state === 'threatened' && '⚠ '}
            {homeBase.state === 'critical' && '⚠ '}
            {homeBase.state}
          </div>
        </div>
      </div>

      {/* Debug info (development mode only) */}
      {import.meta.env.DEV && (
        <div className="absolute -bottom-20 left-0 right-0 text-xs font-mono text-ghost-dim text-center space-y-0.5">
          <div>Health: {Math.round(homeBase.health)}/{homeBase.maxHealth}</div>
          <div>State: {homeBase.state}</div>
          <div>Pos: ({homeBase.position.x}, {homeBase.position.y}, {homeBase.position.z})</div>
        </div>
      )}
    </div>
  );
};

/**
 * Canvas-based rendering function for home base
 * Alternative to React component for pure canvas rendering
 * 
 * @param ctx - Canvas 2D rendering context
 * @param homeBase - Home base data
 * @param centerX - Canvas center X coordinate
 * @param centerY - Canvas center Y coordinate
 * @param homeBaseImage - Preloaded home base image
 */
export function renderHomeBaseOnCanvas(
  ctx: CanvasRenderingContext2D,
  homeBase: HomeBaseData,
  centerX: number,
  centerY: number,
  homeBaseImage?: HTMLImageElement
): void {
  // Convert isometric position to screen coordinates
  const screenPos = isoToScreen(
    homeBase.position.x,
    homeBase.position.y,
    homeBase.position.z
  );

  const spriteWidth = 256;
  const spriteHeight = 256;
  const renderX = centerX + screenPos.x - (spriteWidth / 2);
  const renderY = centerY + screenPos.y - (spriteHeight / 2);

  ctx.save();

  // State colors and effects
  const canvasStateColors = {
    safe: '#4a9d5f',
    threatened: '#d97548',
    critical: '#a83232',
  };
  const stateColor = canvasStateColors[homeBase.state];

  // State-specific visual effects
  const stateEffects = {
    safe: { brightness: 1.0, glowIntensity: 0 },
    threatened: { brightness: 0.9, glowIntensity: 0.2 },
    critical: { brightness: 0.8, glowIntensity: 0.4 },
  };
  const effects = stateEffects[homeBase.state];

  // Draw state-based border glow for threatened/critical states
  if (homeBase.state !== 'safe') {
    ctx.strokeStyle = stateColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = stateColor;
    ctx.shadowBlur = 20;
    ctx.strokeRect(renderX, renderY, spriteWidth, spriteHeight);
    ctx.shadowBlur = 0;
  }

  // Apply brightness filter based on state
  if (effects.brightness !== 1.0) {
    ctx.globalAlpha = effects.brightness;
  }

  // Draw home base image if available
  if (homeBaseImage && homeBaseImage.complete) {
    ctx.drawImage(homeBaseImage, renderX, renderY, spriteWidth, spriteHeight);
  } else {
    // Fallback: draw placeholder
    ctx.fillStyle = stateColor;
    ctx.fillRect(renderX, renderY, spriteWidth, spriteHeight);
    
    // Draw border
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 3;
    ctx.strokeRect(renderX, renderY, spriteWidth, spriteHeight);
    
    // Draw "HOME" text
    ctx.fillStyle = '#e8e8f0';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HOME', renderX + spriteWidth / 2, renderY + spriteHeight / 2);
  }

  // Reset alpha
  ctx.globalAlpha = 1.0;

  // Draw pulsing glow if critical
  if (shouldPulseGlow(homeBase.health, homeBase.maxHealth)) {
    const pulseAlpha = 0.3 + effects.glowIntensity;
    const pulseValue = 0.5 + 0.5 * Math.sin(Date.now() / 500);
    
    ctx.fillStyle = stateColor;
    ctx.globalAlpha = pulseAlpha * pulseValue;
    ctx.filter = 'blur(16px)';
    ctx.fillRect(renderX - 20, renderY - 20, spriteWidth + 40, spriteHeight + 40);
    ctx.filter = 'none';
    ctx.globalAlpha = 1.0;
  }

  // Draw health bar
  const healthBarWidth = spriteWidth - 40;
  const healthBarHeight = 12;
  const healthBarX = renderX + 20;
  const healthBarY = renderY - 30;

  // Health bar background
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  // Health bar fill
  const healthPercent = homeBase.maxHealth > 0 
    ? homeBase.health / homeBase.maxHealth 
    : 0;
  const fillWidth = healthBarWidth * healthPercent;

  const stateColors = {
    safe: '#4a9d5f',
    threatened: '#d97548',
    critical: '#a83232',
  };
  ctx.fillStyle = stateColors[homeBase.state];
  ctx.fillRect(healthBarX, healthBarY, fillWidth, healthBarHeight);

  // Health bar border
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 1;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

  // Draw health text
  ctx.fillStyle = '#e8e8f0';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${Math.round(homeBase.health)} / ${homeBase.maxHealth}`,
    renderX + spriteWidth / 2,
    healthBarY - 5
  );

  // Draw state indicator with background
  const stateText = homeBase.state.toUpperCase();
  const stateIcon = homeBase.state === 'safe' ? '✓ ' : '⚠ ';
  const fullStateText = stateIcon + stateText;
  
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  
  // Measure text for background
  const textMetrics = ctx.measureText(fullStateText);
  const textWidth = textMetrics.width + 16;
  const textHeight = 20;
  const textX = renderX + spriteWidth / 2;
  const textY = renderY + spriteHeight + 25;
  
  // Draw background with state color
  const bgAlpha = homeBase.state === 'safe' ? 0.2 : homeBase.state === 'threatened' ? 0.3 : 0.4;
  ctx.fillStyle = stateColor;
  ctx.globalAlpha = bgAlpha;
  ctx.beginPath();
  ctx.roundRect(textX - textWidth / 2, textY - 14, textWidth, textHeight, 10);
  ctx.fill();
  ctx.globalAlpha = 1.0;
  
  // Draw border
  ctx.strokeStyle = stateColor;
  ctx.lineWidth = 2;
  if (homeBase.state !== 'safe') {
    ctx.shadowColor = stateColor;
    ctx.shadowBlur = 10;
  }
  ctx.beginPath();
  ctx.roundRect(textX - textWidth / 2, textY - 14, textWidth, textHeight, 10);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Draw text
  ctx.fillStyle = homeBase.state === 'safe' ? stateColor : '#e8e8f0';
  ctx.fillText(fullStateText, textX, textY);

  ctx.restore();
}

/**
 * Create a new home base instance
 * 
 * @param totalBudget - Total budget across all categories (becomes maxHealth)
 * @param currentHealth - Current health (sum of blockade health)
 * @returns New home base instance
 */
export function createHomeBase(
  totalBudget: number,
  currentHealth?: number
): HomeBaseData {
  const health = currentHealth ?? totalBudget;
  
  return {
    health,
    maxHealth: totalBudget,
    state: getHomeBaseState(health, totalBudget),
    position: getHomeBasePosition(),
  };
}

/**
 * Update home base health based on blockade states
 * 
 * This function calculates the overall health by summing all blockade health values
 * and updates the home base state accordingly.
 * 
 * Health calculation:
 * - Overall health = sum of all blockade currentHealth values
 * - State is determined by health percentage (health / maxHealth):
 *   - safe: 75-100%
 *   - threatened: 50-74%
 *   - critical: 0-49%
 * 
 * @param homeBase - Current home base
 * @param blockadeHealthValues - Array of current blockade health values
 * @returns Updated home base with recalculated health and state
 */
export function updateHomeBaseHealth(
  homeBase: HomeBaseData,
  blockadeHealthValues: number[]
): HomeBaseData {
  // Calculate overall health by summing all blockade health values
  const newHealth = calculateOverallHealth(blockadeHealthValues);
  
  // Determine new state based on health percentage
  const newState = getHomeBaseState(newHealth, homeBase.maxHealth);
  
  return {
    ...homeBase,
    health: newHealth,
    state: newState,
  };
}

/**
 * Check if home base is in critical state
 * 
 * @param homeBase - Home base to check
 * @returns True if home base is critical
 */
export function isHomeBaseCritical(homeBase: HomeBaseData): boolean {
  return homeBase.state === 'critical';
}

/**
 * Check if home base is destroyed (health at 0)
 * 
 * @param homeBase - Home base to check
 * @returns True if home base is destroyed
 */
export function isHomeBaseDestroyed(homeBase: HomeBaseData): boolean {
  return homeBase.health <= 0;
}
