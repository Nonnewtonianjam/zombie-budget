/**
 * Walk Animation Frame Cycling Demo
 * 
 * Demonstrates the 15-frame walk animation cycling for zombies.
 * Shows frame progression, looping behavior, and frame rate control.
 */

import { useEffect, useRef, useState } from 'react';
import type { Zombie } from '../../types/zombie';
import { getZombieSpriteFramePath, type Direction } from '../../lib/sprites';

export function WalkAnimationDemo() {
  const [zombie, setZombie] = useState<Zombie>({
    id: 'demo-zombie',
    type: 'fast_food',
    strength: 10,
    position: { x: 0, y: 0, z: 0 },
    targetBlockade: 'food',
    speed: 1.0,
    state: 'moving',
    transactionId: 'demo-tx',
    spriteFrame: 0,
    direction: 'S',
    spawnedFrom: 'demo-tx',
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [frameRate, setFrameRate] = useState(10); // Default walk speed
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Load current frame sprite
  const [currentSprite, setCurrentSprite] = useState<HTMLImageElement | null>(null);
  const frameIndex = Math.floor(zombie.spriteFrame) % 15;

  useEffect(() => {
    const img = new Image();
    const direction = zombie.direction || 'S';
    img.src = getZombieSpriteFramePath('Walk', direction, frameIndex);
    img.onload = () => setCurrentSprite(img);
  }, [frameIndex, zombie.direction]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = (currentTime: number) => {
      const deltaTime = lastTimeRef.current 
        ? (currentTime - lastTimeRef.current) / 1000 
        : 0;
      lastTimeRef.current = currentTime;

      if (deltaTime > 0) {
        // Update frame with custom frame rate
        const frameIncrement = frameRate * deltaTime;
        let newFrame = zombie.spriteFrame + frameIncrement;
        
        // Loop at 15 frames
        if (newFrame >= 15) {
          newFrame = newFrame % 15;
        }

        setZombie(prev => ({
          ...prev,
          spriteFrame: newFrame,
        }));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, frameRate, zombie.spriteFrame]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      lastTimeRef.current = 0;
    }
  };

  const handleReset = () => {
    setZombie(prev => ({ ...prev, spriteFrame: 0 }));
    lastTimeRef.current = 0;
  };

  const handleFrameRateChange = (newRate: number) => {
    setFrameRate(newRate);
  };

  const handleDirectionChange = (direction: Direction) => {
    setZombie(prev => ({ ...prev, direction }));
  };

  return (
    <div className="p-6 bg-background-primary rounded-lg space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-ghost-white">
          Walk Animation Frame Cycling Demo
        </h2>
        <p className="text-ghost-dim text-sm">
          Demonstrates 15-frame walk animation with smooth cycling and looping
        </p>
      </div>

      {/* Sprite Display */}
      <div className="flex justify-center items-center bg-background-secondary rounded-lg p-8 min-h-[300px]">
        {currentSprite ? (
          <img 
            src={currentSprite.src} 
            alt={`Walk frame ${frameIndex}`}
            className="pixelated"
            style={{ 
              width: '128px', 
              height: '256px',
              imageRendering: 'pixelated'
            }}
          />
        ) : (
          <div className="w-32 h-64 bg-decay-gray rounded flex items-center justify-center">
            <span className="text-ghost-dim text-sm">Loading...</span>
          </div>
        )}
      </div>

      {/* Frame Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background-secondary rounded-lg p-4">
          <div className="text-ghost-dim text-xs uppercase mb-1">Current Frame</div>
          <div className="text-ghost-white text-2xl font-mono">
            {frameIndex} / 14
          </div>
          <div className="text-ghost-dim text-xs mt-1">
            ({zombie.spriteFrame.toFixed(2)} raw)
          </div>
        </div>

        <div className="bg-background-secondary rounded-lg p-4">
          <div className="text-ghost-dim text-xs uppercase mb-1">Frame Rate</div>
          <div className="text-ghost-white text-2xl font-mono">
            {frameRate} fps
          </div>
          <div className="text-ghost-dim text-xs mt-1">
            {(1000 / frameRate).toFixed(0)}ms per frame
          </div>
        </div>

        <div className="bg-background-secondary rounded-lg p-4">
          <div className="text-ghost-dim text-xs uppercase mb-1">Loop Progress</div>
          <div className="text-ghost-white text-2xl font-mono">
            {((zombie.spriteFrame / 15) * 100).toFixed(0)}%
          </div>
          <div className="text-ghost-dim text-xs mt-1">
            {(zombie.spriteFrame / frameRate).toFixed(2)}s elapsed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-ghost-dim">
          <span>Frame Progress</span>
          <span>{frameIndex} / 14</span>
        </div>
        <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-toxic-green transition-all duration-100"
            style={{ width: `${(zombie.spriteFrame / 15) * 100}%` }}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex gap-2">
        <button
          onClick={handlePlayPause}
          className="px-4 py-2 bg-toxic-green text-background-primary rounded font-medium hover:bg-opacity-80 transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-background-secondary text-ghost-white rounded font-medium hover:bg-background-tertiary transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Frame Rate Control */}
      <div className="space-y-2">
        <label className="text-ghost-white text-sm font-medium">
          Frame Rate: {frameRate} fps
        </label>
        <input
          type="range"
          min="1"
          max="30"
          value={frameRate}
          onChange={(e) => handleFrameRateChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex gap-2">
          <button
            onClick={() => handleFrameRateChange(5)}
            className="px-3 py-1 bg-background-secondary text-ghost-white rounded text-sm hover:bg-background-tertiary"
          >
            Slow (5fps)
          </button>
          <button
            onClick={() => handleFrameRateChange(10)}
            className="px-3 py-1 bg-background-secondary text-ghost-white rounded text-sm hover:bg-background-tertiary"
          >
            Normal (10fps)
          </button>
          <button
            onClick={() => handleFrameRateChange(15)}
            className="px-3 py-1 bg-background-secondary text-ghost-white rounded text-sm hover:bg-background-tertiary"
          >
            Fast (15fps)
          </button>
          <button
            onClick={() => handleFrameRateChange(30)}
            className="px-3 py-1 bg-background-secondary text-ghost-white rounded text-sm hover:bg-background-tertiary"
          >
            Very Fast (30fps)
          </button>
        </div>
      </div>

      {/* Direction Control */}
      <div className="space-y-2">
        <label className="text-ghost-white text-sm font-medium">
          Direction: {zombie.direction}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const).map(dir => (
            <button
              key={dir}
              onClick={() => handleDirectionChange(dir)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                zombie.direction === dir
                  ? 'bg-toxic-green text-background-primary'
                  : 'bg-background-secondary text-ghost-white hover:bg-background-tertiary'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-background-secondary rounded-lg p-4 space-y-2">
        <h3 className="text-ghost-white font-medium">Technical Details</h3>
        <ul className="text-ghost-dim text-sm space-y-1">
          <li>✅ 15 frames per walk animation cycle</li>
          <li>✅ Smooth frame interpolation (fractional frames)</li>
          <li>✅ Seamless looping at frame 15</li>
          <li>✅ Configurable frame rate (1-30 fps)</li>
          <li>✅ 8 directional sprites (N, NE, E, SE, S, SW, W, NW)</li>
          <li>✅ Frame index calculated with Math.floor(spriteFrame) % 15</li>
          <li>✅ Delta time-based animation for consistent speed</li>
        </ul>
      </div>

      {/* Frame Cycling Explanation */}
      <div className="bg-background-secondary rounded-lg p-4 space-y-2">
        <h3 className="text-ghost-white font-medium">How Frame Cycling Works</h3>
        <div className="text-ghost-dim text-sm space-y-2">
          <p>
            <strong className="text-ghost-white">Frame Increment:</strong> Each game loop iteration,
            the sprite frame is incremented by <code className="text-toxic-green">frameRate × deltaTime</code>.
            At 10 fps with 60fps game loop, this adds ~0.167 per frame.
          </p>
          <p>
            <strong className="text-ghost-white">Looping:</strong> When spriteFrame reaches 15,
            it wraps back to 0 using modulo: <code className="text-toxic-green">newFrame % 15</code>.
            This creates seamless looping.
          </p>
          <p>
            <strong className="text-ghost-white">Frame Index:</strong> The actual sprite frame to render
            is calculated with <code className="text-toxic-green">Math.floor(spriteFrame) % 15</code>,
            converting the fractional frame to an integer index (0-14).
          </p>
          <p>
            <strong className="text-ghost-white">Smooth Animation:</strong> Fractional frames allow
            smooth animation at any frame rate, independent of the game loop speed.
          </p>
        </div>
      </div>
    </div>
  );
}
