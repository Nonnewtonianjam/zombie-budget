import { useEffect, useRef, useState } from 'react';
import { isoToScreen, createViewport, type Viewport } from '../../lib/isometric';
import type { Zombie } from '../../types/zombie';
import type { Blockade } from '../../types/blockade';
import type { PlaybackEvent } from '../../types/playback';
import type { Particle } from '../../lib/particles';
import { updateParticles, renderParticles } from '../../lib/particles';
import homebaseImg from '/assets/Homebase.png';

/**
 * GameCanvas Component
 * 
 * Main container for the isometric game visualization.
 * Renders zombies, blockades, and home base on a canvas element.
 * 
 * Features:
 * - Canvas-based rendering for performance
 * - Responsive sizing to container
 * - Dark themed background matching spooky aesthetic
 * - 60fps game loop using requestAnimationFrame
 * - FPS counter for performance monitoring
 * - Isometric coordinate system (30-degree projection, 128 pixels per unit)
 * - Zombie spawning synchronized with playback events
 * 
 * Specifications:
 * - Isometric projection: 30-degree angle
 * - Pixels per unit: 128
 * - Target: 60fps animation
 */

interface GameCanvasProps {
  /** Canvas width in pixels (optional, defaults to container width) */
  width?: number;
  /** Canvas height in pixels (optional, defaults to container height) */
  height?: number;
  /** Additional CSS classes for the container */
  className?: string;
  /** Enable FPS counter display (default: true in dev mode, false in production) */
  showFPS?: boolean;
  /** Active zombies to render */
  zombies?: Zombie[];
  /** Active blockades to render */
  blockades?: Blockade[];
  /** Active particles for visual effects */
  particles?: Particle[];
  /** Callback when particles are updated (for cleanup) */
  onParticlesUpdate?: (particles: Particle[]) => void;
  /** Callback when canvas size changes */
  onCanvasSizeChange?: (width: number, height: number) => void;
  /** Callback when zombie spawn event occurs */
  onSpawnEvent?: (event: PlaybackEvent) => void;
  /** Callback when heal event occurs */
  onHealEvent?: (event: PlaybackEvent) => void;
}

export function GameCanvas({ 
  width, 
  height, 
  className = '',
  showFPS = import.meta.env.DEV, // Only show FPS counter in development mode
  zombies = [],
  blockades = [],
  particles = [],
  onParticlesUpdate,
  onCanvasSizeChange,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // Game loop state
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const [fps, setFps] = useState<number>(60);
  const fpsFramesRef = useRef<number[]>([]);
  
  // Viewport for culling
  const viewportRef = useRef<Viewport | null>(null);
  
  // Load homebase image
  const homebaseImageRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = homebaseImg;
    img.onload = () => {
      homebaseImageRef.current = img;
    };
  }, []);

  // Zombie sprite cache - stores loaded sprite images
  const zombieSpriteCache = useRef<Map<string, HTMLImageElement>>(new Map());
  
  // Load zombie sprite for a specific animation/direction/frame
  const loadZombieSprite = (animation: string, direction: string, frameIndex: number): HTMLImageElement | null => {
    // Frame numbers are odd: 001, 003, 005, etc.
    const frameNumber = (frameIndex * 2 + 1).toString().padStart(3, '0');
    
    // Direction angle mapping
    const directionAngles: Record<string, number> = {
      N: 90, NE: 45, E: 0, SE: 315,
      S: 270, SW: 225, W: 180, NW: 135,
    };
    
    const angle = directionAngles[direction] || 270;
    const spritePath = `/src/assets/CityZombie 5/${animation}/${direction}/${animation}_${angle}_${frameNumber}.png`;
    
    // Check cache first
    if (zombieSpriteCache.current.has(spritePath)) {
      return zombieSpriteCache.current.get(spritePath)!;
    }
    
    // Load new sprite
    const img = new Image();
    img.src = spritePath;
    zombieSpriteCache.current.set(spritePath, img);
    return img;
  };

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const newWidth = width || container.clientWidth;
        const newHeight = height || container.clientHeight;
        
        setCanvasSize({
          width: newWidth,
          height: newHeight,
        });
        
        // Notify parent of canvas size change
        if (onCanvasSizeChange) {
          onCanvasSizeChange(newWidth, newHeight);
        }
      }
    };

    // Initial size
    updateCanvasSize();

    // Update on window resize
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [width, height, onCanvasSizeChange]);

  // Initialize canvas context and setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas display size (CSS pixels)
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    // Set canvas resolution (actual pixels for retina displays)
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * scale;
    canvas.height = canvasSize.height * scale;

    // Scale context to match device pixel ratio
    ctx.scale(scale, scale);

    // Create viewport for culling (with 128px padding for sprite overflow)
    viewportRef.current = createViewport(canvasSize.width, canvasSize.height, 128);

  }, [canvasSize]);

  // Game loop using requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    /**
     * Main game loop function
     * Runs at 60fps target using requestAnimationFrame
     * 
     * @param currentTime - Current timestamp from requestAnimationFrame
     */
    const gameLoop = (currentTime: number) => {
      if (!isRunning) return;

      // Calculate delta time (time since last frame in seconds)
      const deltaTime = lastFrameTimeRef.current 
        ? (currentTime - lastFrameTimeRef.current) / 1000 
        : 0;
      lastFrameTimeRef.current = currentTime;

      // Calculate FPS
      if (deltaTime > 0) {
        const currentFps = 1 / deltaTime;
        fpsFramesRef.current.push(currentFps);
        
        // Keep only last 60 frames for averaging
        if (fpsFramesRef.current.length > 60) {
          fpsFramesRef.current.shift();
        }
        
        // Update FPS display every 30 frames (twice per second at 60fps)
        if (fpsFramesRef.current.length % 30 === 0) {
          const avgFps = fpsFramesRef.current.reduce((a, b) => a + b, 0) / fpsFramesRef.current.length;
          setFps(Math.round(avgFps));
        }
      }

      // Clear canvas with gradient background matching page
      const gradient = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
      gradient.addColorStop(0, '#0f0a1f');
      gradient.addColorStop(0.5, '#1a1230');
      gradient.addColorStop(1, '#251d3a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Calculate canvas center for isometric origin - shifted left for layout
      const centerX = canvasSize.width * 0.35; // Move to left 35% instead of center
      const centerY = canvasSize.height / 2; // Keep vertical center

      // Render home base at center (0, 0, 0)
      const homePos = isoToScreen(0, 0, 0);
      if (homebaseImageRef.current) {
        const homeSize = 200; // Larger size for visibility
        const homeX = centerX + homePos.x - homeSize / 2;
        const homeY = centerY + homePos.y - homeSize / 2;
        ctx.drawImage(homebaseImageRef.current, homeX, homeY, homeSize, homeSize);
      }
      
      // Render blockades - smaller and closer to homebase with isometric orientation
      blockades.forEach(blockade => {
        const pos = isoToScreen(blockade.position.x, blockade.position.y, blockade.position.z);
        const blockadeSize = 80; // Smaller size (was 128)
        const renderX = centerX + pos.x - blockadeSize / 2;
        const renderY = centerY + pos.y - blockadeSize / 2;
        
        // Category colors - purple theme
        const colors: Record<string, string> = {
          food: '#8b5cf6',      // brand-purple
          entertainment: '#a78bfa', // brand-purple-light
          shopping: '#7c3aed',  // brand-purple-dark
          subscriptions: '#6366f1', // indigo
        };
        
        const color = colors[blockade.category] || '#8b5cf6';
        
        // Apply opacity based on health
        const healthPercent = blockade.maxHealth > 0 
          ? blockade.currentHealth / blockade.maxHealth 
          : 0;
        ctx.globalAlpha = 0.4 + (healthPercent * 0.6); // 0.4 to 1.0
        
        // Draw isometric blockade (diamond shape)
        ctx.save();
        ctx.translate(renderX + blockadeSize / 2, renderY + blockadeSize / 2);
        
        // Draw diamond shape for isometric view
        ctx.beginPath();
        ctx.moveTo(0, -blockadeSize / 2); // Top
        ctx.lineTo(blockadeSize / 2, 0); // Right
        ctx.lineTo(0, blockadeSize / 2); // Bottom
        ctx.lineTo(-blockadeSize / 2, 0); // Left
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();
        
        // Draw border
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Draw health bar above blockade
        const healthBarWidth = 60;
        const healthBarHeight = 6;
        const healthBarX = renderX + (blockadeSize - healthBarWidth) / 2;
        const healthBarY = renderY - 12;
        
        // Health bar background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health bar fill
        const fillWidth = healthBarWidth * healthPercent;
        
        // Color based on health
        if (healthPercent >= 0.75) {
          ctx.fillStyle = '#10b981'; // accent-green
        } else if (healthPercent >= 0.5) {
          ctx.fillStyle = '#f59e0b'; // accent-orange
        } else if (healthPercent >= 0.25) {
          ctx.fillStyle = '#ef4444'; // accent-red
        } else {
          ctx.fillStyle = '#64748b'; // neutral-500
        }
        
        ctx.fillRect(healthBarX, healthBarY, fillWidth, healthBarHeight);
        
        // Health bar border
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 1;
        ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Draw category label
        ctx.fillStyle = '#f1f5f9'; // neutral-100
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          blockade.category.toUpperCase(),
          renderX + blockadeSize / 2,
          renderY + blockadeSize + 12
        );
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
      });

      // Render zombies with actual sprites
      zombies.forEach(zombie => {
        const pos = isoToScreen(zombie.position.x, zombie.position.y, zombie.position.z);
        const renderX = centerX + pos.x - 64; // 128px sprite / 2
        const renderY = centerY + pos.y - 128; // 256px sprite height, pivot at 0.19
        
        // Determine animation based on state
        let animation = 'Walk';
        if (zombie.state === 'spawning') animation = 'WakeUp';
        else if (zombie.state === 'attacking') animation = 'Attack1';
        else if (zombie.state === 'defeated') animation = 'Die';
        else if (zombie.state === 'moving') animation = 'Walk';
        
        // Get current frame (cycle through 15 frames)
        const frameIndex = Math.floor(zombie.spriteFrame) % 15;
        
        // Load and draw sprite
        const direction = zombie.direction || 'S'; // Default to South if no direction
        const spriteImg = loadZombieSprite(animation, direction, frameIndex);
        if (spriteImg && spriteImg.complete) {
          // Apply state-based effects
          if (zombie.state === 'defeated') {
            ctx.globalAlpha = 0.5;
          }
          
          ctx.drawImage(spriteImg, renderX, renderY, 128, 256);
          ctx.globalAlpha = 1.0;
        } else {
          // Fallback: draw colored rectangle if sprite not loaded
          ctx.fillStyle = '#10b981';
          ctx.globalAlpha = 0.6;
          ctx.fillRect(renderX, renderY, 128, 256);
          ctx.globalAlpha = 1.0;
        }
      });

      // Update and render particles
      if (particles.length > 0) {
        // Update particle physics and lifetime
        const updatedParticles = updateParticles(particles, deltaTime);
        
        // Notify parent of updated particles (removes expired ones)
        if (onParticlesUpdate && updatedParticles.length !== particles.length) {
          onParticlesUpdate(updatedParticles);
        }
        
        // Render all active particles
        renderParticles(ctx, updatedParticles);
      }
      // - Process attacks
      // - Update blockade health
      // - Render all game objects
      //
      // Example usage with PLAYBACK SYNCHRONIZATION + VIEWPORT CULLING + SPRITE BATCHING:
      // import { updateZombiesWithPlaybackTime } from '../../lib/playbackZombieSync';
      // import { cullOffScreen } from '../../lib/isometric';
      // import { createGameObjectBatchEntries, renderAllSpriteBatches } from '../../lib/spriteBatching';
      // import { isoToScreen } from '../../lib/isometric';
      // import { SPRITE_CONFIG } from '../../lib/sprites';
      //
      // const viewport = viewportRef.current;
      // if (!viewport) return;
      //
      // // STEP 1: PLAYBACK SYNCHRONIZATION - Update zombie positions based on playback time
      // // This ensures zombies move smoothly and reach targets at the correct time
      // const updatedZombies = updateZombiesWithPlaybackTime(
      //   allZombies,
      //   currentPlaybackTime, // From usePlayback hook
      //   zombieTravelDuration // From playbackEngine.getZombieTravelDuration()
      // );
      //
      // // STEP 2: VIEWPORT CULLING - Filter out off-screen objects (50-80% reduction)
      // const visibleZombies = cullOffScreen(updatedZombies, viewport);
      // const visibleBlockades = cullOffScreen(allBlockades, viewport);
      // // Home base is always at center, so always visible
      //
      // // STEP 3: Prepare zombie data with sprites (only for visible zombies)
      // const zombiesWithSprites = visibleZombies.map(zombie => {
      //   const spriteFrame = getZombieSpriteFrame(zombie);
      //   const screenPos = isoToScreen(zombie.position.x, zombie.position.y, zombie.position.z);
      //   return {
      //     zombie,
      //     spriteFrame,
      //     screenX: centerX + screenPos.x - SPRITE_CONFIG.width * SPRITE_CONFIG.pivot.x,
      //     screenY: centerY + screenPos.y - SPRITE_CONFIG.height * SPRITE_CONFIG.pivot.y,
      //   };
      // });
      //
      // // STEP 4: Prepare blockade data with images (only for visible blockades)
      // const blockadesWithImages = visibleBlockades.map(blockade => {
      //   const image = getBlockadeImage(blockade);
      //   const screenPos = isoToScreen(blockade.position.x, blockade.position.y, blockade.position.z);
      //   return {
      //     blockade,
      //     image,
      //     screenX: centerX + screenPos.x - 64,
      //     screenY: centerY + screenPos.y - 64,
      //   };
      // });
      //
      // // STEP 5: Prepare home base data
      // const homeBaseWithImage = homeBase ? {
      //   homeBase,
      //   image: homeBaseImage,
      //   screenX: centerX + screenPos.x - 128,
      //   screenY: centerY + screenPos.y - 128,
      // } : null;
      //
      // // STEP 6: Create batch entries for all visible game objects
      // const batchEntries = createGameObjectBatchEntries(
      //   zombiesWithSprites,
      //   blockadesWithImages,
      //   homeBaseWithImage
      // );
      //
      // // STEP 7: Render all sprites in optimized batches
      // renderAllSpriteBatches(ctx, batchEntries);
      //
      // Performance benefit with PLAYBACK SYNC + CULLING + BATCHING:
      // Example: 100 zombies on map, 8 blockades, 1 home base
      // 
      // WITHOUT OPTIMIZATION:
      // - 100 zombies + 8 blockades + 1 home base = 109 objects to process
      // - All 109 rendered every frame
      // - Frame-based movement (inconsistent with playback)
      // - 100+ draw calls
      // - Frame rate: ~30fps (struggling)
      //
      // WITH PLAYBACK SYNC + CULLING + BATCHING:
      // - Zombies move in sync with playback timeline (smooth, predictable)
      // - 100 zombies → 20 visible (80% culled)
      // - 8 blockades → 8 visible (all near center)
      // - 1 home base → 1 visible (at center)
      // - Only 29 objects to process (73% reduction)
      // - With batching: ~3-5 draw calls
      // - Frame rate: 60fps (smooth)
      //
      // COMBINED IMPACT: Smooth playback sync + 73% fewer objects + 95% fewer draw calls = 60fps!

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    // Cleanup on unmount
    return () => {
      isRunning = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [canvasSize, zombies, blockades, particles, onParticlesUpdate]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-background-primary rounded-lg overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          imageRendering: 'pixelated', // Crisp pixel art rendering
        }}
      />
      
      {/* FPS Counter for performance monitoring */}
      {showFPS && (
        <div className="absolute top-2 right-2 bg-background-secondary/80 px-2 py-1 rounded text-ghost-dim text-xs font-mono">
          <span className={fps >= 55 ? 'text-toxic-green' : fps >= 30 ? 'text-warning-orange' : 'text-blood-red'}>
            {fps} FPS
          </span>
        </div>
      )}
    </div>
  );
}
