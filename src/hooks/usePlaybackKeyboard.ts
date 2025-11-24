/**
 * usePlaybackKeyboard Hook
 * 
 * Handles keyboard shortcuts for playback controls:
 * - Spacebar: Play/Pause
 * - R: Restart
 * - 1-4: Speed control (0.5x, 1x, 1.5x, 2x)
 * 
 * Usage:
 * ```typescript
 * usePlaybackKeyboard({
 *   onPlayPause: () => { ... },
 *   onRestart: () => { ... },
 *   onSpeedChange: (speed) => { ... },
 * });
 * ```
 */

import { useEffect } from 'react';

interface UsePlaybackKeyboardOptions {
  onPlayPause: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
  enabled?: boolean;
}

const SPEED_MAP: Record<string, number> = {
  '1': 0.5,
  '2': 1,
  '3': 1.5,
  '4': 2,
};

export function usePlaybackKeyboard({
  onPlayPause,
  onRestart,
  onSpeedChange,
  enabled = true,
}: UsePlaybackKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault();
          onPlayPause();
          break;

        case 'r':
          event.preventDefault();
          onRestart();
          break;

        case '1':
        case '2':
        case '3':
        case '4':
          event.preventDefault();
          const speed = SPEED_MAP[event.key];
          if (speed) {
            onSpeedChange(speed);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPlayPause, onRestart, onSpeedChange, enabled]);
}
