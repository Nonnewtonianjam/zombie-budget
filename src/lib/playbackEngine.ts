/**
 * Playback Engine
 * 
 * Core system for managing the cinematic monthly transaction playback.
 * Handles timeline generation, event processing, and animation synchronization.
 * 
 * Key Features:
 * - 30-45 second playback duration
 * - 60fps target performance
 * - Speed control (0.5x - 2x)
 * - Synchronized zombie spawning, movement, attacks
 * - Real-time chart updates
 * - Transaction feed synchronization
 * 
 * Usage:
 * ```typescript
 * const engine = new PlaybackEngine(transactions, budget);
 * engine.play();
 * 
 * // In game loop
 * engine.update(deltaTime);
 * 
 * // Listen to events
 * engine.on('spawn', (event) => spawnZombie(event));
 * engine.on('heal', (event) => healBlockade(event));
 * ```
 */

import type { Transaction } from '../types/transaction';
import type { 
  PlaybackState, 
  PlaybackTimeline, 
  PlaybackEvent, 
  PlaybackEventType 
} from '../types/playback';
import {
  createInitialPlaybackState,
  calculateEventTimestamp,
  isValidPlaybackSpeed,
  isPlaybackComplete,
} from '../types/playback';
import { 
  processTransactionForZombieSpawn,
  type BudgetConfig,
  type SpendingTracker,
  getZombieSpawnPosition,
} from './zombieSpawning';

/**
 * Event callback type for playback events
 */
export type PlaybackEventCallback = (event: PlaybackEvent) => void;

/**
 * Event listeners map
 */
type EventListeners = {
  [K in PlaybackEventType]?: PlaybackEventCallback[];
};

/**
 * Playback Engine class
 * Manages the complete playback animation lifecycle
 */
export class PlaybackEngine {
  private state: PlaybackState;
  private timeline: PlaybackTimeline;
  private budget: BudgetConfig;
  private spendingTracker: SpendingTracker;
  private eventListeners: EventListeners = {};
  private processedEventIndices: Set<number> = new Set();
  
  // Smooth transition state for speed changes
  private targetSpeed: number = 1;
  private speedTransitionDuration: number = 300; // ms
  private speedTransitionStartTime: number = 0;
  private speedTransitionStartSpeed: number = 1;
  private isTransitioningSpeed: boolean = false;
  
  // Smooth transition state for seeking
  private targetTime: number = 0;
  private seekTransitionDuration: number = 150; // ms
  private seekTransitionStartTime: number = 0;
  private seekTransitionStartValue: number = 0;
  private isTransitioningSeek: boolean = false;
  
  /**
   * Create a new PlaybackEngine instance
   * 
   * @param transactions - Array of transactions to animate
   * @param budget - Budget configuration for all categories
   * @param duration - Optional custom duration in milliseconds (default: 35000)
   */
  constructor(
    transactions: Transaction[],
    budget: BudgetConfig,
    duration: number = 35000
  ) {
    this.state = createInitialPlaybackState(transactions);
    this.state.duration = duration;
    this.budget = budget;
    this.spendingTracker = {
      food: 0,
      entertainment: 0,
      shopping: 0,
      subscriptions: 0,
    };
    this.timeline = this.generateTimeline();
  }

  /**
   * Generate playback timeline from transactions
   * Creates events for spawning, healing, and attack actions
   * 
   * @returns Complete playback timeline with all events
   */
  private generateTimeline(): PlaybackTimeline {
    const events: PlaybackEvent[] = [];
    const transactions = this.state.transactions;
    const travelDuration = this.getZombieTravelDuration();
    
    transactions.forEach((transaction, index) => {
      const timestamp = calculateEventTimestamp(
        index,
        transactions.length,
        this.state.duration
      );
      
      // Determine event type based on transaction
      if (transaction.isGoodSpending) {
        // Good spending heals blockades
        events.push({
          timestamp,
          type: 'heal',
          transactionId: transaction.id,
          blockadeId: transaction.category,
          position: getZombieSpawnPosition(transaction.category),
        });
      } else {
        // Check if this transaction causes overspending (spawns zombie)
        const zombie = processTransactionForZombieSpawn(
          transaction,
          this.budget,
          this.spendingTracker,
          timestamp // Pass spawn time for playback synchronization
        );
        
        if (zombie) {
          // Spawn zombie event
          console.log(`📅 Scheduling zombie spawn at ${timestamp.toFixed(0)}ms for transaction ${transaction.description} ($${transaction.amount})`);
          events.push({
            timestamp,
            type: 'spawn',
            transactionId: transaction.id,
            zombieId: zombie.id,
            blockadeId: zombie.targetBlockade,
            position: zombie.position,
          });
          
          // Generate attack event when zombie reaches target
          // Zombies travel for 35% of playback duration
          const attackTimestamp = timestamp + travelDuration;
          
          // Only add attack event if it occurs before playback ends
          if (attackTimestamp < this.state.duration) {
            // Get target blockade position (zombie.targetBlockade is the category)
            const targetCategory = transaction.category as keyof SpendingTracker;
            
            events.push({
              timestamp: attackTimestamp,
              type: 'attack',
              transactionId: transaction.id,
              zombieId: zombie.id,
              blockadeId: zombie.targetBlockade,
              position: getZombieSpawnPosition(targetCategory), // Target position
            });
          }
        }
        
        // Update spending tracker for next iteration
        const category = transaction.category as keyof SpendingTracker;
        if (category in this.spendingTracker) {
          this.spendingTracker[category] += transaction.amount;
        }
      }
    });
    
    // Sort events by timestamp
    events.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log(`📅 Generated timeline with ${events.length} events from ${transactions.length} transactions`);
    console.log('Events:', events.map(e => `${e.type} at ${e.timestamp}ms`).join(', '));
    
    return {
      totalDuration: this.state.duration,
      events,
      fps: 60,
    };
  }

  /**
   * Update playback state
   * Call this every frame (60fps) to advance playback
   * 
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  public update(deltaTime: number): void {
    // Update speed transitions even when paused for smooth UI feedback
    this.updateSpeedTransition();
    
    // Update seek transitions
    this.updateSeekTransition();
    
    if (!this.state.isPlaying) {
      return;
    }
    
    // Advance current time based on speed
    this.state.currentTime += deltaTime * this.state.speed;
    
    // Check if playback is complete
    if (isPlaybackComplete(this.state.currentTime, this.state.duration)) {
      this.pause();
      this.state.currentTime = this.state.duration;
      return;
    }
    
    // Process events at current timestamp
    this.processEventsAtCurrentTime(deltaTime);
    
    // Update current transaction index
    this.updateCurrentTransactionIndex();
  }
  
  /**
   * Update speed transition for smooth speed changes
   * Uses easeInOutCubic for natural acceleration/deceleration
   */
  private updateSpeedTransition(): void {
    if (!this.isTransitioningSpeed) {
      return;
    }
    
    const now = performance.now();
    const elapsed = now - this.speedTransitionStartTime;
    const progress = Math.min(1, elapsed / this.speedTransitionDuration);
    
    // easeInOutCubic for smooth acceleration/deceleration
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    // Interpolate between start and target speed
    this.state.speed = this.speedTransitionStartSpeed + 
                       (this.targetSpeed - this.speedTransitionStartSpeed) * eased;
    
    // Complete transition
    if (progress >= 1) {
      this.state.speed = this.targetSpeed;
      this.isTransitioningSpeed = false;
    }
  }
  
  /**
   * Update seek transition for smooth scrubbing
   * Uses easeOutQuad for quick but smooth seeking
   */
  private updateSeekTransition(): void {
    if (!this.isTransitioningSeek) {
      return;
    }
    
    const now = performance.now();
    const elapsed = now - this.seekTransitionStartTime;
    const progress = Math.min(1, elapsed / this.seekTransitionDuration);
    
    // easeOutQuad for quick but smooth seeking
    const eased = 1 - (1 - progress) * (1 - progress);
    
    // Interpolate between start and target time
    this.state.currentTime = this.seekTransitionStartValue + 
                             (this.targetTime - this.seekTransitionStartValue) * eased;
    
    // Update transaction index during seek
    this.updateCurrentTransactionIndex();
    
    // Complete transition
    if (progress >= 1) {
      this.state.currentTime = this.targetTime;
      this.isTransitioningSeek = false;
    }
  }

  /**
   * Process events that should occur at the current timestamp
   * 
   * @param deltaTime - Time elapsed since last update
   */
  private processEventsAtCurrentTime(deltaTime: number): void {
    const currentTime = this.state.currentTime;
    const previousTime = currentTime - (deltaTime * this.state.speed);
    
    let eventsProcessed = 0;
    this.timeline.events.forEach((event, index) => {
      // Skip if already processed
      if (this.processedEventIndices.has(index)) {
        return;
      }
      
      // Check if event should trigger in this frame
      if (event.timestamp > previousTime && event.timestamp <= currentTime) {
        console.log(`⏰ Processing event at ${currentTime.toFixed(0)}ms:`, event.type, event);
        this.processEvent(event);
        this.processedEventIndices.add(index);
        eventsProcessed++;
      }
    });
    
    if (eventsProcessed > 0) {
      console.log(`✅ Processed ${eventsProcessed} events at ${currentTime.toFixed(0)}ms`);
    }
  }

  /**
   * Process a single playback event
   * Triggers appropriate callbacks for the event type
   * 
   * @param event - The event to process
   */
  private processEvent(event: PlaybackEvent): void {
    // Trigger event listeners
    const listeners = this.eventListeners[event.type];
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  /**
   * Update current transaction index based on playback time
   */
  private updateCurrentTransactionIndex(): void {
    const transactions = this.state.transactions;
    const progress = this.state.currentTime / this.state.duration;
    const newIndex = Math.floor(progress * transactions.length);
    this.state.currentIndex = Math.min(newIndex, transactions.length - 1);
  }

  /**
   * Start or resume playback
   */
  public play(): void {
    this.state.isPlaying = true;
  }

  /**
   * Pause playback
   */
  public pause(): void {
    this.state.isPlaying = false;
  }

  /**
   * Restart playback from beginning with smooth transition
   */
  public restart(): void {
    // Smoothly reset speed to 1x
    this.setSpeed(1, true);
    
    this.state.currentTime = 0;
    this.state.currentIndex = 0;
    this.state.isPlaying = false;
    this.processedEventIndices.clear();
    
    // Reset spending tracker
    this.spendingTracker = {
      food: 0,
      entertainment: 0,
      shopping: 0,
      subscriptions: 0,
    };
    
    // Regenerate timeline with fresh spending tracker
    this.timeline = this.generateTimeline();
  }

  /**
   * Seek to specific time in playback with smooth transition
   * 
   * @param time - Time in milliseconds to seek to
   * @param immediate - Skip transition and seek immediately
   */
  public seek(time: number, immediate: boolean = false): void {
    const clampedTime = Math.max(0, Math.min(time, this.state.duration));
    const wasPlaying = this.state.isPlaying;
    
    // Pause during seek
    this.pause();
    
    // Reset processed events
    this.processedEventIndices.clear();
    
    if (immediate || Math.abs(this.state.currentTime - clampedTime) < 100) {
      // Set immediately if requested or if change is small
      this.state.currentTime = clampedTime;
      this.isTransitioningSeek = false;
    } else {
      // Start smooth transition
      this.seekTransitionStartTime = performance.now();
      this.seekTransitionStartValue = this.state.currentTime;
      this.targetTime = clampedTime;
      this.isTransitioningSeek = true;
    }
    
    // Update transaction index
    this.updateCurrentTransactionIndex();
    
    // Process all events up to this point
    this.timeline.events.forEach((event, index) => {
      if (event.timestamp <= clampedTime) {
        this.processedEventIndices.add(index);
      }
    });
    
    // Resume if was playing
    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Set playback speed with smooth transition
   * 
   * @param speed - Speed multiplier (0.5 - 2.0)
   * @param immediate - Skip transition and set speed immediately
   */
  public setSpeed(speed: number, immediate: boolean = false): void {
    if (!isValidPlaybackSpeed(speed)) {
      return;
    }
    
    if (immediate || Math.abs(this.state.speed - speed) < 0.01) {
      // Set immediately if requested or if change is negligible
      this.state.speed = speed;
      this.targetSpeed = speed;
      this.isTransitioningSpeed = false;
    } else {
      // Start smooth transition
      this.speedTransitionStartTime = performance.now();
      this.speedTransitionStartSpeed = this.state.speed;
      this.targetSpeed = speed;
      this.isTransitioningSpeed = true;
    }
  }

  /**
   * Register event listener for playback events
   * 
   * @param eventType - Type of event to listen for
   * @param callback - Callback function to execute when event occurs
   */
  public on(eventType: PlaybackEventType, callback: PlaybackEventCallback): void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType]!.push(callback);
  }

  /**
   * Remove event listener
   * 
   * @param eventType - Type of event
   * @param callback - Callback function to remove
   */
  public off(eventType: PlaybackEventType, callback: PlaybackEventCallback): void {
    const listeners = this.eventListeners[eventType];
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get current playback state
   * Returns a copy to prevent external mutation
   */
  public getState(): Readonly<PlaybackState> {
    return { ...this.state };
  }

  /**
   * Get playback timeline
   * Returns a copy to prevent external mutation
   */
  public getTimeline(): Readonly<PlaybackTimeline> {
    return {
      ...this.timeline,
      events: [...this.timeline.events],
    };
  }

  /**
   * Get current transaction being animated
   */
  public getCurrentTransaction(): Transaction | null {
    if (this.state.currentIndex >= 0 && this.state.currentIndex < this.state.transactions.length) {
      return this.state.transactions[this.state.currentIndex];
    }
    return null;
  }

  /**
   * Get playback progress as percentage (0-100)
   */
  public getProgress(): number {
    if (this.state.duration === 0) return 0;
    return Math.min(100, (this.state.currentTime / this.state.duration) * 100);
  }

  /**
   * Check if playback is currently playing
   */
  public isPlaying(): boolean {
    return this.state.isPlaying;
  }

  /**
   * Check if playback is complete
   */
  public isComplete(): boolean {
    return isPlaybackComplete(this.state.currentTime, this.state.duration);
  }

  /**
   * Get remaining time in milliseconds
   */
  public getRemainingTime(): number {
    return Math.max(0, this.state.duration - this.state.currentTime);
  }

  /**
   * Calculate zombie travel duration based on playback duration
   * Zombies should reach their target blockade in approximately 30-40% of playback time
   * This ensures they arrive before the playback ends and have time to attack
   * 
   * @returns Travel duration in milliseconds
   */
  public getZombieTravelDuration(): number {
    // Zombies travel for 35% of total playback duration
    return this.state.duration * 0.35;
  }

  /**
   * Get all active zombies with their spawn times
   * Used for synchronizing zombie positions with playback time
   * 
   * @returns Map of zombie ID to spawn time
   */
  public getZombieSpawnTimes(): Map<string, number> {
    const spawnTimes = new Map<string, number>();
    
    this.timeline.events.forEach(event => {
      if (event.type === 'spawn' && event.zombieId) {
        spawnTimes.set(event.zombieId, event.timestamp);
      }
    });
    
    return spawnTimes;
  }

  /**
   * Dispose of the playback engine
   * Clears all event listeners and resets state
   */
  public dispose(): void {
    this.pause();
    this.eventListeners = {};
    this.processedEventIndices.clear();
  }
}
