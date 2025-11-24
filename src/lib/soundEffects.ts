/**
 * Sound Effects System
 * 
 * Provides visual feedback for sound effects during playback.
 * In a full implementation, this would trigger actual audio.
 * For now, it provides console logging and visual indicators.
 */

export type SoundEffect = 
  | 'zombie-spawn'
  | 'zombie-attack'
  | 'zombie-defeat'
  | 'blockade-heal'
  | 'blockade-damage'
  | 'playback-start'
  | 'playback-complete';

interface SoundEffectConfig {
  name: string;
  emoji: string;
  color: string;
  description: string;
}

const SOUND_EFFECTS: Record<SoundEffect, SoundEffectConfig> = {
  'zombie-spawn': {
    name: 'Zombie Spawn',
    emoji: '🧟',
    color: '#a83232',
    description: 'Groaning sound as zombie emerges',
  },
  'zombie-attack': {
    name: 'Zombie Attack',
    emoji: '⚔️',
    color: '#a83232',
    description: 'Impact sound as zombie hits blockade',
  },
  'zombie-defeat': {
    name: 'Zombie Defeat',
    emoji: '💥',
    color: '#a83232',
    description: 'Splatter sound as zombie is defeated',
  },
  'blockade-heal': {
    name: 'Blockade Heal',
    emoji: '✨',
    color: '#4a9d5f',
    description: 'Chime sound for healing',
  },
  'blockade-damage': {
    name: 'Blockade Damage',
    emoji: '💢',
    color: '#a83232',
    description: 'Cracking sound as blockade takes damage',
  },
  'playback-start': {
    name: 'Playback Start',
    emoji: '▶️',
    color: '#4a9d5f',
    description: 'Whoosh sound as playback begins',
  },
  'playback-complete': {
    name: 'Playback Complete',
    emoji: '✓',
    color: '#4a9d5f',
    description: 'Success chime',
  },
};

/**
 * Play a sound effect (visual feedback for now)
 * In production, this would trigger actual audio playback
 * 
 * @param effect - The sound effect to play
 * @param volume - Volume level (0-1), default 0.5
 */
export function playSoundEffect(effect: SoundEffect, volume: number = 0.5): void {
  const config = SOUND_EFFECTS[effect];
  
  // Log to console for debugging (volume would be used in production)
  console.log(
    `%c${config.emoji} ${config.name} (vol: ${(volume * 100).toFixed(0)}%)`,
    `color: ${config.color}; font-weight: bold; font-size: 14px;`,
    config.description
  );
  
  // In production, this would be:
  // const audio = new Audio(`/sounds/${effect}.mp3`);
  // audio.volume = volume;
  // audio.play();
}

/**
 * Create a visual sound indicator element
 * Shows a brief animated indicator when sound would play
 * 
 * @param effect - The sound effect
 * @param x - Screen X position
 * @param y - Screen Y position
 * @returns HTML element to append to DOM
 */
export function createSoundIndicator(
  effect: SoundEffect,
  x: number,
  y: number
): HTMLDivElement {
  const config = SOUND_EFFECTS[effect];
  const indicator = document.createElement('div');
  
  indicator.style.position = 'fixed';
  indicator.style.left = `${x}px`;
  indicator.style.top = `${y}px`;
  indicator.style.transform = 'translate(-50%, -50%)';
  indicator.style.fontSize = '24px';
  indicator.style.pointerEvents = 'none';
  indicator.style.zIndex = '9999';
  indicator.style.animation = 'sound-indicator 0.8s ease-out forwards';
  indicator.textContent = config.emoji;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sound-indicator {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.5);
      }
      50% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.2);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.5) translateY(-20px);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Auto-remove after animation
  setTimeout(() => {
    indicator.remove();
    style.remove();
  }, 800);
  
  return indicator;
}

/**
 * Play sound effect with visual indicator
 * Combines audio playback with visual feedback
 * 
 * @param effect - The sound effect to play
 * @param x - Screen X position for indicator
 * @param y - Screen Y position for indicator
 * @param volume - Volume level (0-1)
 */
export function playSoundWithIndicator(
  effect: SoundEffect,
  x: number,
  y: number,
  volume: number = 0.5
): void {
  playSoundEffect(effect, volume);
  const indicator = createSoundIndicator(effect, x, y);
  document.body.appendChild(indicator);
}
