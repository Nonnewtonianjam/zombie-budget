import React from 'react';
import { BlockadeType, type BlockadeState } from '../../types/blockade';

interface BlockadeSpriteProps {
  type: BlockadeType;
  state: BlockadeState;
  width?: number;
  height?: number;
}

/**
 * BlockadeSprite Component
 * 
 * Renders isometric blockade sprites (128x128px) for 4 categories
 * Uses simple geometric shapes with category-specific theming
 * 
 * Design:
 * - Food: Stacked crates/barrels (pantry defense)
 * - Entertainment: Ticket booth/arcade machine
 * - Shopping: Shopping cart barrier
 * - Subscriptions: Server rack/digital wall
 * 
 * States:
 * - intact: Full color, solid structure
 * - damaged: Cracks, reduced opacity
 * - critical: Heavy damage, flickering
 * - destroyed: Rubble, very low opacity
 */
export const BlockadeSprite: React.FC<BlockadeSpriteProps> = ({
  type,
  state,
  width = 128,
  height = 128,
}) => {
  // Calculate opacity based on state
  const getOpacity = () => {
    switch (state) {
      case 'intact': return 1.0;
      case 'damaged': return 0.85;
      case 'critical': return 0.65;
      case 'destroyed': return 0.35;
      default: return 1.0;
    }
  };

  // Get category-specific colors from design system
  const getCategoryColor = () => {
    switch (type) {
      case 'food': return '#4a9d5f'; // Toxic green (muted)
      case 'entertainment': return '#d97548'; // Warning orange (softer)
      case 'shopping': return '#a83232'; // Blood red (subdued)
      case 'subscriptions': return '#6a7a9d'; // Cool blue-gray
      default: return '#4a4a4a'; // Decay gray
    }
  };

  // Get darkened color for damaged states
  const getDarkenedColor = (baseColor: string, amount: number) => {
    // Simple darkening by reducing brightness
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const darken = (val: number) => Math.max(0, Math.floor(val * (1 - amount)));
    
    return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
  };

  const opacity = getOpacity();
  const primaryColor = getCategoryColor();
  const isDamaged = state === 'damaged';
  const isCritical = state === 'critical';
  const isDestroyed = state === 'destroyed';
  
  // Apply color darkening for damaged states
  const displayColor = isCritical 
    ? getDarkenedColor(primaryColor, 0.3)
    : isDamaged 
    ? getDarkenedColor(primaryColor, 0.15)
    : primaryColor;

  // Food Blockade: Stacked crates in isometric view
  if (type === 'food') {
    return (
      <svg width={width} height={height} viewBox="0 0 128 128" style={{ opacity }}>
        {/* Base crate */}
        <path
          d="M 64 80 L 40 68 L 40 48 L 64 60 Z"
          fill={displayColor}
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        <path
          d="M 64 80 L 88 68 L 88 48 L 64 60 Z"
          fill={displayColor}
          opacity="0.7"
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        <path
          d="M 64 60 L 40 48 L 64 36 L 88 48 Z"
          fill={displayColor}
          opacity="0.9"
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        
        {/* Top crate - removed when critical/destroyed */}
        {!isCritical && !isDestroyed && (
          <>
            <path
              d="M 64 50 L 46 42 L 46 28 L 64 36 Z"
              fill={displayColor}
              stroke="#2a2a2a"
              strokeWidth="2"
            />
            <path
              d="M 64 50 L 82 42 L 82 28 L 64 36 Z"
              fill={displayColor}
              opacity="0.7"
              stroke="#2a2a2a"
              strokeWidth="2"
            />
            <path
              d="M 64 36 L 46 28 L 64 20 L 82 28 Z"
              fill={displayColor}
              opacity="0.9"
              stroke="#2a2a2a"
              strokeWidth="2"
            />
          </>
        )}

        {/* Light damage cracks */}
        {isDamaged && (
          <>
            <line x1="50" y1="55" x2="58" y2="70" stroke="#1a0f1f" strokeWidth="2" opacity="0.7" />
            <line x1="70" y1="50" x2="78" y2="65" stroke="#1a0f1f" strokeWidth="2" opacity="0.7" />
          </>
        )}

        {/* Heavy damage cracks and missing pieces */}
        {isCritical && (
          <>
            <line x1="45" y1="52" x2="55" y2="72" stroke="#1a0f1f" strokeWidth="3" />
            <line x1="73" y1="48" x2="83" y2="68" stroke="#1a0f1f" strokeWidth="3" />
            <line x1="55" y1="60" x2="70" y2="75" stroke="#1a0f1f" strokeWidth="2" />
            {/* Missing corner piece */}
            <path d="M 88 48 L 88 55 L 80 51 Z" fill="#1a0f1f" opacity="0.5" />
          </>
        )}
        
        {/* Destroyed rubble */}
        {isDestroyed && (
          <>
            <circle cx="50" cy="90" r="5" fill="#4a4a4a" opacity="0.8" />
            <circle cx="70" cy="92" r="4" fill="#4a4a4a" opacity="0.8" />
            <circle cx="60" cy="88" r="6" fill="#4a4a4a" opacity="0.8" />
            <circle cx="45" cy="85" r="3" fill="#2a2a2a" opacity="0.6" />
            <circle cx="75" cy="87" r="3" fill="#2a2a2a" opacity="0.6" />
            {/* Scattered debris */}
            <rect x="52" y="82" width="4" height="3" fill="#4a4a4a" opacity="0.7" transform="rotate(15 54 83.5)" />
            <rect x="68" y="84" width="5" height="3" fill="#4a4a4a" opacity="0.7" transform="rotate(-20 70.5 85.5)" />
          </>
        )}
      </svg>
    );
  }

  // Entertainment Blockade: Arcade/ticket booth
  if (type === 'entertainment') {
    return (
      <svg width={width} height={height} viewBox="0 0 128 128" style={{ opacity }}>
        {/* Main booth structure */}
        <path
          d="M 64 75 L 35 60 L 35 35 L 64 50 Z"
          fill={displayColor}
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        <path
          d="M 64 75 L 93 60 L 93 35 L 64 50 Z"
          fill={displayColor}
          opacity="0.7"
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        <path
          d="M 64 50 L 35 35 L 64 20 L 93 35 Z"
          fill={displayColor}
          opacity="0.9"
          stroke="#2a2a2a"
          strokeWidth="2"
        />

        {/* Screen/window - broken when critical */}
        {!isCritical && !isDestroyed ? (
          <rect
            x="50"
            y="40"
            width="28"
            height="20"
            fill="#1a0f1f"
            stroke="#e8e8f0"
            strokeWidth="1"
          />
        ) : (
          <>
            {/* Broken screen pieces */}
            <path d="M 50 40 L 64 50 L 50 60 Z" fill="#1a0f1f" opacity="0.5" />
            <path d="M 78 40 L 64 50 L 78 60 Z" fill="#1a0f1f" opacity="0.5" />
            <line x1="50" y1="40" x2="78" y2="60" stroke="#e8e8f0" strokeWidth="1" opacity="0.3" />
            <line x1="78" y1="40" x2="50" y2="60" stroke="#e8e8f0" strokeWidth="1" opacity="0.3" />
          </>
        )}

        {/* Light damage cracks */}
        {isDamaged && (
          <>
            <line x1="45" y1="45" x2="55" y2="60" stroke="#1a0f1f" strokeWidth="2" opacity="0.7" />
            <line x1="75" y1="42" x2="85" y2="55" stroke="#1a0f1f" strokeWidth="2" opacity="0.7" />
          </>
        )}

        {/* Heavy damage cracks */}
        {isCritical && (
          <>
            <line x1="40" y1="48" x2="50" y2="68" stroke="#1a0f1f" strokeWidth="3" />
            <line x1="78" y1="45" x2="88" y2="62" stroke="#1a0f1f" strokeWidth="3" />
            <line x1="55" y1="52" x2="70" y2="70" stroke="#1a0f1f" strokeWidth="2" />
            {/* Sagging roof */}
            <path d="M 64 20 L 60 24 L 68 24 Z" fill="#1a0f1f" opacity="0.4" />
          </>
        )}

        {/* Destroyed rubble */}
        {isDestroyed && (
          <>
            <circle cx="45" cy="85" r="5" fill="#4a4a4a" opacity="0.8" />
            <circle cx="75" cy="87" r="4" fill="#4a4a4a" opacity="0.8" />
            <circle cx="60" cy="83" r="6" fill="#4a4a4a" opacity="0.8" />
            <circle cx="52" cy="88" r="3" fill="#2a2a2a" opacity="0.6" />
            <circle cx="68" cy="86" r="3" fill="#2a2a2a" opacity="0.6" />
            {/* Broken screen glass */}
            <path d="M 55 78 L 58 82 L 55 86" stroke="#e8e8f0" strokeWidth="1" opacity="0.3" fill="none" />
            <path d="M 70 80 L 67 84 L 70 88" stroke="#e8e8f0" strokeWidth="1" opacity="0.3" fill="none" />
          </>
        )}
      </svg>
    );
  }

  // Shopping Blockade: Shopping cart barrier
  if (type === 'shopping') {
    return (
      <svg width={width} height={height} viewBox="0 0 128 128" style={{ opacity }}>
        {/* Cart body */}
        <path
          d="M 64 70 L 42 58 L 42 40 L 64 52 Z"
          fill={displayColor}
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        <path
          d="M 64 70 L 86 58 L 86 40 L 64 52 Z"
          fill={displayColor}
          opacity="0.7"
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        <path
          d="M 64 52 L 42 40 L 64 28 L 86 40 Z"
          fill={displayColor}
          opacity="0.9"
          stroke="#2a2a2a"
          strokeWidth="2"
        />

        {/* Handle - bent when critical */}
        {!isCritical && !isDestroyed ? (
          <>
            <line
              x1="64"
              y1="28"
              x2="64"
              y2="18"
              stroke="#4a4a4a"
              strokeWidth="3"
            />
            <line
              x1="54"
              y1="18"
              x2="74"
              y2="18"
              stroke="#4a4a4a"
              strokeWidth="3"
            />
          </>
        ) : (
          <>
            {/* Bent handle */}
            <path
              d="M 64 28 Q 62 23 58 20"
              stroke="#4a4a4a"
              strokeWidth="3"
              fill="none"
            />
            <line
              x1="54"
              y1="20"
              x2="62"
              y2="20"
              stroke="#4a4a4a"
              strokeWidth="2"
            />
          </>
        )}

        {/* Wheels - missing when destroyed */}
        {!isDestroyed && (
          <>
            <circle cx="50" cy="75" r="4" fill="#2a2a2a" stroke="#4a4a4a" strokeWidth="1" />
            <circle cx="78" cy="75" r="4" fill="#2a2a2a" stroke="#4a4a4a" strokeWidth="1" />
          </>
        )}

        {/* Light damage cracks */}
        {isDamaged && (
          <>
            <line x1="48" y1="50" x2="56" y2="65" stroke="#1a0f1f" strokeWidth="2" opacity="0.7" />
            <line x1="72" y1="48" x2="80" y2="60" stroke="#1a0f1f" strokeWidth="2" opacity="0.7" />
          </>
        )}

        {/* Heavy damage cracks and dents */}
        {isCritical && (
          <>
            <line x1="44" y1="48" x2="54" y2="68" stroke="#1a0f1f" strokeWidth="3" />
            <line x1="74" y1="46" x2="84" y2="62" stroke="#1a0f1f" strokeWidth="3" />
            <line x1="56" y1="54" x2="68" y2="66" stroke="#1a0f1f" strokeWidth="2" />
            {/* Dented corner */}
            <path d="M 86 40 L 82 44 L 86 48" stroke="#1a0f1f" strokeWidth="2" fill="none" />
          </>
        )}

        {/* Destroyed rubble */}
        {isDestroyed && (
          <>
            <circle cx="48" cy="82" r="5" fill="#4a4a4a" opacity="0.8" />
            <circle cx="72" cy="84" r="4" fill="#4a4a4a" opacity="0.8" />
            <circle cx="60" cy="80" r="6" fill="#4a4a4a" opacity="0.8" />
            <circle cx="54" cy="86" r="3" fill="#2a2a2a" opacity="0.6" />
            <circle cx="66" cy="85" r="3" fill="#2a2a2a" opacity="0.6" />
            {/* Broken wheels */}
            <circle cx="45" cy="88" r="2" fill="#2a2a2a" opacity="0.5" />
            <circle cx="75" cy="89" r="2" fill="#2a2a2a" opacity="0.5" />
          </>
        )}
      </svg>
    );
  }

  // Subscriptions Blockade: Server rack/digital wall
  if (type === 'subscriptions') {
    return (
      <svg width={width} height={height} viewBox="0 0 128 128" style={{ opacity }}>
        {/* Server rack structure */}
        <path
          d="M 64 78 L 38 64 L 38 32 L 64 46 Z"
          fill={displayColor}
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        <path
          d="M 64 78 L 90 64 L 90 32 L 64 46 Z"
          fill={displayColor}
          opacity="0.7"
          stroke="#2a2a2a"
          strokeWidth="2"
        />
        <path
          d="M 64 46 L 38 32 L 64 18 L 90 32 Z"
          fill={displayColor}
          opacity="0.9"
          stroke="#2a2a2a"
          strokeWidth="2"
        />

        {/* Server lights/indicators - progressively fail */}
        <circle cx="50" cy="38" r="2" fill={isDestroyed ? "#4a4a4a" : "#39FF14"} opacity={isDestroyed ? 0.3 : 0.8} />
        <circle cx="58" cy="38" r="2" fill={isCritical || isDestroyed ? "#a83232" : "#39FF14"} opacity={isDestroyed ? 0.3 : 0.8} />
        <circle cx="50" cy="48" r="2" fill={isCritical || isDestroyed ? "#4a4a4a" : isDamaged ? "#FF6B35" : "#39FF14"} opacity={isDestroyed ? 0.3 : 0.6} />
        <circle cx="58" cy="48" r="2" fill={isDestroyed ? "#4a4a4a" : "#FF6B35"} opacity={isDestroyed ? 0.3 : 0.6} />
        <circle cx="50" cy="58" r="2" fill={isCritical || isDestroyed ? "#a83232" : isDamaged ? "#FF6B35" : "#39FF14"} opacity={isDestroyed ? 0.3 : 0.8} />
        <circle cx="58" cy="58" r="2" fill={isDestroyed ? "#4a4a4a" : isCritical ? "#a83232" : "#39FF14"} opacity={isDestroyed ? 0.3 : 0.8} />

        {/* Horizontal lines (server divisions) */}
        <line x1="42" y1="42" x2="86" y2="42" stroke="#2a2a2a" strokeWidth="1" />
        <line x1="42" y1="52" x2="86" y2="52" stroke="#2a2a2a" strokeWidth="1" />
        <line x1="42" y1="62" x2="86" y2="62" stroke="#2a2a2a" strokeWidth="1" />

        {/* Light damage cracks */}
        {isDamaged && (
          <>
            <line x1="44" y1="48" x2="52" y2="68" stroke="#1a0f1f" strokeWidth="2" opacity="0.7" />
            <line x1="76" y1="45" x2="84" y2="60" stroke="#1a0f1f" strokeWidth="2" opacity="0.7" />
          </>
        )}

        {/* Heavy damage cracks and sparks */}
        {isCritical && (
          <>
            <line x1="40" y1="45" x2="50" y2="70" stroke="#1a0f1f" strokeWidth="3" />
            <line x1="78" y1="42" x2="88" y2="65" stroke="#1a0f1f" strokeWidth="3" />
            <line x1="52" y1="55" x2="68" y2="72" stroke="#1a0f1f" strokeWidth="2" />
            {/* Electrical sparks */}
            <circle cx="48" cy="50" r="1.5" fill="#FF6B35" opacity="0.8" />
            <circle cx="80" cy="55" r="1.5" fill="#FF6B35" opacity="0.8" />
            <line x1="48" y1="50" x2="46" y2="48" stroke="#FF6B35" strokeWidth="1" opacity="0.6" />
            <line x1="80" y1="55" x2="82" y2="53" stroke="#FF6B35" strokeWidth="1" opacity="0.6" />
          </>
        )}

        {/* Destroyed rubble */}
        {isDestroyed && (
          <>
            <circle cx="46" cy="88" r="5" fill="#4a4a4a" opacity="0.8" />
            <circle cx="74" cy="90" r="4" fill="#4a4a4a" opacity="0.8" />
            <circle cx="60" cy="86" r="6" fill="#4a4a4a" opacity="0.8" />
            <circle cx="52" cy="92" r="3" fill="#2a2a2a" opacity="0.6" />
            <circle cx="68" cy="89" r="3" fill="#2a2a2a" opacity="0.6" />
            {/* Broken circuit boards */}
            <rect x="48" y="84" width="6" height="2" fill="#6a7a9d" opacity="0.4" transform="rotate(25 51 85)" />
            <rect x="66" y="86" width="5" height="2" fill="#6a7a9d" opacity="0.4" transform="rotate(-15 68.5 87)" />
          </>
        )}
      </svg>
    );
  }

  return null;
};
