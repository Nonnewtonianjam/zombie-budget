import type { Transaction } from './transaction';

/**
 * Playback state interface
 * Manages the state of the cinematic monthly transaction playback
 *
 * Playback specifications:
 * - Duration: 30-45 seconds total
 * - Target: 60fps animation performance
 * - Speed control: 0.5x - 2x multiplier
 * - Synchronizes: zombie spawning, movement, attacks, chart updates
 */
export interface PlaybackState {
  isPlaying: boolean; // Whether playback is currently active
  currentTime: number; // Current position in milliseconds
  duration: number; // Total playback duration (30000-45000ms)
  speed: number; // Playback speed multiplier (0.5 - 2.0)
  transactions: Transaction[]; // Transactions to animate chronologically
  currentIndex: number; // Index of current transaction being processed
}

/**
 * Playback event types
 * Defines the different events that occur during playback
 */
export type PlaybackEventType =
  | 'spawn' // Zombie spawning from bad transaction
  | 'attack' // Zombie attacking blockade
  | 'heal' // Blockade healing from good transaction
  | 'destroy'; // Blockade destruction

/**
 * Playback event interface
 * Represents a single event in the playback timeline
 */
export interface PlaybackEvent {
  timestamp: number; // Milliseconds into playback when event occurs
  type: PlaybackEventType; // Type of event
  transactionId: string; // Associated transaction ID
  zombieId?: string; // Associated zombie ID (for spawn/attack/destroy)
  blockadeId?: string; // Associated blockade ID (for attack/heal/destroy)
  position: {
    // Event position in isometric space
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Playback timeline interface
 * Contains all events for a complete playback sequence
 */
export interface PlaybackTimeline {
  totalDuration: number; // Total duration in milliseconds (30000-45000)
  events: PlaybackEvent[]; // All events sorted by timestamp
  fps: number; // Target frames per second (60)
}

/**
 * Playback control actions
 * Defines the available playback controls
 */
export type PlaybackAction = 'play' | 'pause' | 'restart' | 'seek' | 'speed';

/**
 * Helper function to create initial playback state
 */
export function createInitialPlaybackState(transactions: Transaction[]): PlaybackState {
  return {
    isPlaying: false,
    currentTime: 0,
    duration: 35000, // Default 35 seconds
    speed: 1.0,
    transactions: [...transactions].sort((a, b) => {
      // Ensure dates are Date objects (they might be strings from localStorage)
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    }),
    currentIndex: 0,
  };
}

/**
 * Helper function to calculate event timestamp
 * Distributes transactions evenly across playback duration
 */
export function calculateEventTimestamp(
  index: number,
  totalTransactions: number,
  duration: number,
): number {
  if (totalTransactions === 0) return 0;
  return (index / totalTransactions) * duration;
}

/**
 * Helper function to validate playback speed
 * Ensures speed is within allowed range (0.5x - 2x)
 */
export function isValidPlaybackSpeed(speed: number): boolean {
  return speed >= 0.5 && speed <= 2.0;
}

/**
 * Helper function to calculate progress percentage
 */
export function calculateProgress(currentTime: number, duration: number): number {
  if (duration === 0) return 0;
  return Math.min(100, (currentTime / duration) * 100);
}

/**
 * Helper function to check if playback is complete
 */
export function isPlaybackComplete(currentTime: number, duration: number): boolean {
  return currentTime >= duration;
}

/**
 * Helper function to format playback time for display
 * Returns time in MM:SS format
 */
export function formatPlaybackTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
