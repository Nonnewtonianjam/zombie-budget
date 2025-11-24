/**
 * Playback Example Component
 * 
 * Demonstrates how to integrate PlaybackControls with the usePlayback hook.
 * This shows the complete playback experience with speed control.
 */

import { PlaybackControls } from './PlaybackControls';
import { usePlayback } from '../../hooks/usePlayback';
import type { Transaction } from '../../types/transaction';
import type { BudgetConfig } from '../../lib/zombieSpawning';

interface PlaybackExampleProps {
  transactions: Transaction[];
  budget: BudgetConfig;
}

export function PlaybackExample({ transactions, budget }: PlaybackExampleProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    speed,
    progress,
    play,
    pause,
    restart,
    setSpeed,
    seek,
    getCurrentTransaction,
  } = usePlayback(transactions, budget, {
    onSpawn: (event) => {
      console.log('Zombie spawned:', event);
    },
    onHeal: (event) => {
      console.log('Blockade healed:', event);
    },
  });

  const currentTransaction = getCurrentTransaction();

  return (
    <div className="space-y-6">
      {/* Playback Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        speed={speed}
        onPlay={play}
        onPause={pause}
        onRestart={restart}
        onSpeedChange={setSpeed}
        onSeek={seek}
      />

      {/* Current Transaction Display */}
      {currentTransaction && (
        <div className="bg-background-secondary rounded-lg p-4">
          <h3 className="text-ghost-white font-semibold mb-2">Current Transaction</h3>
          <div className="space-y-1 text-sm">
            <p className="text-ghost-dim">
              <span className="font-medium">Amount:</span>{' '}
              <span className={currentTransaction.isGoodSpending ? 'text-toxic-green' : 'text-blood-red'}>
                ${currentTransaction.amount.toFixed(2)}
              </span>
            </p>
            <p className="text-ghost-dim">
              <span className="font-medium">Category:</span> {currentTransaction.category}
            </p>
            <p className="text-ghost-dim">
              <span className="font-medium">Description:</span> {currentTransaction.description}
            </p>
          </div>
        </div>
      )}

      {/* Progress Info */}
      <div className="bg-background-secondary rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-ghost-dim">Progress</p>
            <p className="text-ghost-white font-mono text-lg">{progress.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-ghost-dim">Speed</p>
            <p className="text-ghost-white font-mono text-lg">{speed}x</p>
          </div>
        </div>
      </div>
    </div>
  );
}
