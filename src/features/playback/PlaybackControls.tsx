/**
 * Playback Controls Component
 * 
 * Provides UI controls for the cinematic playback experience:
 * - Play/Pause toggle
 * - Restart button
 * - Speed adjustment (0.5x, 1x, 1.5x, 2x)
 * - Timeline scrubber
 * - Progress indicator
 * 
 * Keyboard shortcuts:
 * - Spacebar: Play/Pause
 * - R: Restart
 * - 1-4: Speed control (0.5x, 1x, 1.5x, 2x)
 * 
 * Usage:
 * ```tsx
 * import { PlaybackControls } from '@/features/playback';
 * import { usePlayback } from '@/hooks';
 * 
 * function MyComponent() {
 *   const { isPlaying, currentTime, duration, speed, play, pause, restart, setSpeed, seek } 
 *     = usePlayback(transactions, budget);
 * 
 *   return (
 *     <PlaybackControls
 *       isPlaying={isPlaying}
 *       currentTime={currentTime}
 *       duration={duration}
 *       speed={speed}
 *       onPlay={play}
 *       onPause={pause}
 *       onRestart={restart}
 *       onSpeedChange={setSpeed}
 *       onSeek={seek}
 *     />
 *   );
 * }
 * ```
 */

import { Play, Pause, RotateCcw } from 'lucide-react';
import { formatPlaybackTime } from '../../types/playback';
import { usePlaybackKeyboard } from '../../hooks/usePlaybackKeyboard';
import { playSoundEffect } from '../../lib/soundEffects';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (time: number) => void;
  enableKeyboardShortcuts?: boolean;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const;

export function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  speed,
  onPlay,
  onPause,
  onRestart,
  onSpeedChange,
  enableKeyboardShortcuts = true,
}: PlaybackControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isComplete = progress >= 100;

  const handlePlayPause = () => {
    console.log('🎯 PlaybackControls: handlePlayPause called, isPlaying=', isPlaying);
    if (isPlaying) {
      console.log('⏸️ Calling onPause()');
      onPause();
    } else {
      console.log('▶️ Calling onPlay()');
      onPlay();
      playSoundEffect('playback-start', 0.4);
    }
  };

  // Enable keyboard shortcuts
  usePlaybackKeyboard({
    onPlayPause: handlePlayPause,
    onRestart,
    onSpeedChange,
    enabled: enableKeyboardShortcuts,
  });

  return (
    <div className="flex items-center gap-3">
      {/* Play/Pause and Restart */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
            isPlaying 
              ? 'bg-brand-purple shadow-lg shadow-brand-purple/50' 
              : 'bg-brand-purple/80 hover:bg-brand-purple'
          }`}
        >
          {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
        </button>
        <button
          onClick={onRestart}
          aria-label="Restart"
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 bg-neutral-700 hover:bg-neutral-600 ${
            isComplete ? 'animate-pulse' : ''
          }`}
        >
          <RotateCcw size={14} className="text-white" />
        </button>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-2 text-sm font-mono text-white">
        <span className={isPlaying ? 'text-brand-purple-light' : ''}>
          {formatPlaybackTime(currentTime)}
        </span>
        <span className="text-neutral-500">/</span>
        <span className="text-neutral-300">
          {formatPlaybackTime(duration)}
        </span>
      </div>

      {/* Speed Controls - Compact */}
      <div className="flex items-center gap-1">
        {SPEED_OPTIONS.map((speedOption) => (
          <button
            key={speedOption}
            onClick={() => onSpeedChange(speedOption)}
            className={`
              px-2 py-1 rounded text-xs font-medium transition-all duration-200
              hover:scale-105 active:scale-95
              ${
                speed === speedOption
                  ? 'bg-brand-purple text-white shadow-md'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }
            `}
            aria-label={`Set speed to ${speedOption}x`}
            aria-pressed={speed === speedOption}
          >
            {speedOption}x
          </button>
        ))}
      </div>
    </div>
  );
}
