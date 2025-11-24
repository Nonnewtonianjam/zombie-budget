/**
 * usePlayback Hook
 * 
 * Custom hook for managing playback engine state and controls.
 * Provides a simple interface for components to control playback.
 * 
 * Usage:
 * ```typescript
 * const {
 *   isPlaying,
 *   currentTime,
 *   duration,
 *   speed,
 *   play,
 *   pause,
 *   restart,
 *   setSpeed,
 *   seek,
 *   progress,
 * } = usePlayback(transactions, budget);
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { PlaybackEngine } from '../lib/playbackEngine';
import type { Transaction } from '../types/transaction';
import type { BudgetConfig } from '../lib/zombieSpawning';
import type { PlaybackEvent } from '../types/playback';

interface UsePlaybackOptions {
  onSpawn?: (event: PlaybackEvent) => void;
  onHeal?: (event: PlaybackEvent) => void;
  onAttack?: (event: PlaybackEvent) => void;
  onDestroy?: (event: PlaybackEvent) => void;
}

export function usePlayback(
  transactions: Transaction[],
  budget: BudgetConfig,
  options: UsePlaybackOptions = {}
) {
  const engineRef = useRef<PlaybackEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(35000);
  const [speed, setSpeedState] = useState(1);
  const [progress, setProgress] = useState(0);

  // Store callbacks in refs to avoid recreating engine
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  // Initialize playback engine (only when transactions or budget change)
  useEffect(() => {
    console.log('🔄 Initializing PlaybackEngine with', transactions.length, 'transactions');
    const engine = new PlaybackEngine(transactions, budget);
    engineRef.current = engine;

    // Register event listeners using refs
    engine.on('spawn', (event) => callbacksRef.current.onSpawn?.(event));
    engine.on('heal', (event) => callbacksRef.current.onHeal?.(event));
    engine.on('attack', (event) => callbacksRef.current.onAttack?.(event));
    engine.on('destroy', (event) => callbacksRef.current.onDestroy?.(event));

    // Set initial state
    const state = engine.getState();
    setDuration(state.duration);
    setCurrentTime(state.currentTime);
    setSpeedState(state.speed);

    return () => {
      console.log('🗑️ Disposing PlaybackEngine');
      engine.dispose();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [transactions, budget]); // Only recreate when transactions or budget change

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!engineRef.current) {
      console.warn('⚠️ Game loop running but engine is null');
      return;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Update engine
    engineRef.current.update(deltaTime);

    // Update state
    const state = engineRef.current.getState();
    setCurrentTime(state.currentTime);
    setIsPlaying(state.isPlaying);
    setProgress(engineRef.current.getProgress());
    
    // Debug log every second
    if (Math.floor(timestamp / 1000) !== Math.floor((timestamp - deltaTime) / 1000)) {
      console.log(`🎮 Playback Loop: time=${state.currentTime.toFixed(0)}ms, playing=${state.isPlaying}, progress=${engineRef.current.getProgress().toFixed(1)}%`);
    }

    // Continue loop if playing
    if (state.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, []);

  // Start/stop game loop based on playing state
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, gameLoop]);

  // Control functions
  const play = useCallback(() => {
    console.log('▶️ PLAY button clicked');
    if (engineRef.current) {
      engineRef.current.play();
      setIsPlaying(true);
      console.log('✅ Engine.play() called, isPlaying set to true');
    } else {
      console.error('❌ Engine is null, cannot play');
    }
  }, []);

  const pause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const restart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.restart();
      setCurrentTime(0);
      setProgress(0);
      setIsPlaying(false);
    }
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    if (engineRef.current) {
      engineRef.current.setSpeed(newSpeed);
      setSpeedState(newSpeed);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (engineRef.current) {
      engineRef.current.seek(time);
      setCurrentTime(time);
      setProgress(engineRef.current.getProgress());
    }
  }, []);

  const getCurrentTransaction = useCallback(() => {
    return engineRef.current?.getCurrentTransaction() || null;
  }, []);

  const getRemainingTime = useCallback(() => {
    return engineRef.current?.getRemainingTime() || 0;
  }, []);

  const isComplete = useCallback(() => {
    return engineRef.current?.isComplete() || false;
  }, []);

  const getZombieTravelDuration = useCallback(() => {
    return engineRef.current?.getZombieTravelDuration() || 0;
  }, []);

  const getZombieSpawnTimes = useCallback(() => {
    return engineRef.current?.getZombieSpawnTimes() || new Map();
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    speed,
    progress,

    // Controls
    play,
    pause,
    restart,
    setSpeed,
    seek,

    // Utilities
    getCurrentTransaction,
    getRemainingTime,
    isComplete,
    getZombieTravelDuration,
    getZombieSpawnTimes,
  };
}
