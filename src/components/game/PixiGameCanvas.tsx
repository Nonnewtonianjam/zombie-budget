/**
 * PixiJS Game Canvas Component
 * 
 * Renders the isometric zombie horde visualization using PixiJS for better performance.
 * 
 * Features:
 * - Homebase at center
 * - 4 blockades (barriers) positioned around homebase (2 on each side)
 * - Animated zombie sprites with 5 visual variants (CityZombie 1-5)
 * - Isometric view
 * - Smooth 60fps animation
 */

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import type { Zombie } from '../../types/zombie';
import type { Blockade } from '../../types/blockade';
import homebaseImg from '/assets/Homebase.png';
import { calculateLanePositions, getBarrierX } from '../../lib/lanePositioning';

interface PixiGameCanvasProps {
  zombies?: Zombie[];
  blockades?: Blockade[];
  className?: string;
  showFPS?: boolean;
}

// Zombie sprite texture cache
const zombieSpriteCache = new Map<string, PIXI.Texture>();

// Dynamically import all zombie sprites using Vite's glob import
// Support all 5 zombie types for variety
const zombieSprites = import.meta.glob('/public/assets/sprites/zombies/**/*.png', { eager: false, query: '?url', import: 'default' });

// Helper to load zombie sprite frame with zombie type support
async function loadZombieFrame(animation: string, direction: string, frameIndex: number, zombieType: number = 5): Promise<PIXI.Texture> {
  const frameNumber = (frameIndex * 2 + 1).toString().padStart(3, '0');
  const directionAngles: Record<string, number> = {
    N: 90, NE: 45, E: 0, SE: 315,
    S: 270, SW: 225, W: 180, NW: 135,
  };
  const angle = directionAngles[direction] || 270;
  
  // Build the path that matches the glob pattern (with /public/ for glob lookup)
  const globPath = `/public/assets/sprites/zombies/CityZombie ${zombieType}/${animation}/${direction}/${animation}_${angle}_${frameNumber}.png`;
  
  if (zombieSpriteCache.has(globPath)) {
    return zombieSpriteCache.get(globPath)!;
  }
  
  try {
    // Check if the sprite exists in our glob import
    if (zombieSprites[globPath]) {
      // Load the sprite URL (Vite will transform this to the correct runtime path)
      const spriteUrl = await zombieSprites[globPath]() as string;
      const texture = await PIXI.Assets.load(spriteUrl);
      zombieSpriteCache.set(globPath, texture);
      return texture;
    } else {
      throw new Error(`Sprite not found in glob: ${globPath}`);
    }
  } catch (error) {
    console.warn(`Failed to load zombie sprite: ${globPath}`, error);
    // Return a placeholder texture
    const graphics = new PIXI.Graphics();
    graphics.rect(0, 0, 128, 256);
    graphics.fill({ color: 0x10b981, alpha: 0.8 });
    const texture = PIXI.RenderTexture.create({ width: 128, height: 256 });
    return texture;
  }
}

export function PixiGameCanvas({
  zombies = [],
  blockades = [],
  className = '',
}: PixiGameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const homebaseRef = useRef<PIXI.Sprite | null>(null);
  const blockadeSpritesRef = useRef<Map<string, PIXI.Graphics>>(new Map());
  const blockadePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const blockadeOriginalPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const zombieSpritesRef = useRef<Map<string, PIXI.Container>>(new Map());
  const zombieTexturesRef = useRef<Map<string, PIXI.Texture[]>>(new Map());
  const lastBlockadeHealthRef = useRef<Map<string, number>>(new Map());

  // Initialize PixiJS application
  useEffect(() => {
    if (!containerRef.current) return;
    if (appRef.current) return; // Prevent duplicate initialization

    console.log('🎨 Initializing PixiJS application');
    const app = new PIXI.Application();
    
    app.init({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: 0x0f0a1f,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      if (containerRef.current && app.canvas && !appRef.current) {
        containerRef.current.appendChild(app.canvas);
        appRef.current = app;

        // Setup scene
        setupScene(app);
        console.log('✅ PixiJS scene setup complete');
        console.log(`📐 Canvas size: ${app.screen.width}x${app.screen.height}`);
        console.log(`📍 Center position: (${app.screen.width * 0.35}, ${app.screen.height / 2})`);
      }
    });

    // Cleanup
    return () => {
      console.log('🗑️ Cleaning up PixiJS application');
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, []);

  // Setup the game scene - Plants vs Zombies style
  const setupScene = async (app: PIXI.Application) => {
    const homebaseX = 120; // Left side of screen
    const gameAreaHeight = app.screen.height - 200; // Reserve 200px for bottom UI
    const gameAreaTop = 80; // Start below top controls

    // Load and add homebase (check if already loaded to avoid warnings)
    let homebaseTexture;
    if (PIXI.Assets.cache.has(homebaseImg)) {
      homebaseTexture = PIXI.Assets.cache.get(homebaseImg);
    } else {
      homebaseTexture = await PIXI.Assets.load(homebaseImg);
    }
    
    const homebase = new PIXI.Sprite(homebaseTexture);
    homebase.anchor.set(0.5);
    homebase.x = homebaseX;
    homebase.y = gameAreaTop + gameAreaHeight / 2;
    homebase.width = 360; // Slightly smaller
    homebase.height = 360;
    app.stage.addChild(homebase);
    homebaseRef.current = homebase;

    // Add blockades in 4 lanes
    createBlockades(app, homebaseX, gameAreaHeight, gameAreaTop);
  };

  // Create blockade sprites - 4 lanes like Plants vs Zombies
  const createBlockades = async (app: PIXI.Application, homebaseX: number, _gameAreaHeight: number, _gameAreaTop: number) => {
    // Use shared lane positioning system
    const { lanes } = calculateLanePositions(app.screen.height);
    const blockadeX = getBarrierX(homebaseX);
    
    const positions = lanes.map(lane => ({
      x: blockadeX,
      y: lane.y,
      category: lane.category,
    }));
    
    console.log(`🎯 Creating blockades at x=${blockadeX}, screen height=${app.screen.height}`);
    positions.forEach(pos => {
      console.log(`  ${pos.category}: y=${pos.y.toFixed(0)}`);
    });

    // Map categories to fence images and color tints
    const fenceImages: Record<string, string> = {
      food: '/assets/Fence1.png',
      entertainment: '/assets/Fence2.png',
      shopping: '/assets/Fence3.png',
      subscriptions: '/assets/Fence4.png',
    };

    // Color tints with better differentiation between red and orange
    const fenceTints: Record<string, number> = {
      food: 0xdc2626,        // Brighter red for better distinction
      entertainment: 0xf59e0b, // Brighter orange (more yellow) for better distinction
      shopping: 0x8b5cf6,     // Purple
      subscriptions: 0x10b981, // Brighter green
    };

    // Load and create fence sprites for each position
    for (const pos of positions) {
      const fencePath = fenceImages[pos.category];
      
      try {
        // Load fence texture
        const texture = await PIXI.Assets.load(fencePath);
        const fence = new PIXI.Sprite(texture);
        
        // Center the fence sprite
        fence.anchor.set(0.5);
        fence.x = pos.x;
        fence.y = pos.y;
        
        // Scale wider for better visibility
        fence.width = 220;
        fence.height = 180;
        
        // Apply stronger color tint for better category identification
        // Mix the original color with the tint color
        const colorMatrix = new PIXI.ColorMatrixFilter();
        const r = ((fenceTints[pos.category] >> 16) & 0xFF) / 255;
        const g = ((fenceTints[pos.category] >> 8) & 0xFF) / 255;
        const b = (fenceTints[pos.category] & 0xFF) / 255;
        
        // Blend 50% original + 50% tint color for stronger effect
        const blend = 0.5;
        colorMatrix.matrix = [
          0.5 + r * blend, 0, 0, 0, 0,
          0, 0.5 + g * blend, 0, 0, 0,
          0, 0, 0.5 + b * blend, 0, 0,
          0, 0, 0, 1, 0
        ];
        fence.filters = [colorMatrix];
        
        app.stage.addChild(fence);
        blockadeSpritesRef.current.set(pos.category, fence as any);
        
        // Store the actual rendered position for zombie collision detection
        blockadePositionsRef.current.set(pos.category, { x: pos.x, y: pos.y });
        blockadeOriginalPositionsRef.current.set(pos.category, { x: pos.x, y: pos.y });
      } catch (error) {
        console.warn(`Failed to load fence image for ${pos.category}:`, error);
        
        // Fallback to colored rectangle if image fails to load
        const wall = new PIXI.Graphics();
        const color = fenceTints[pos.category] || 0x8b5cf6;
        
        wall.rect(-25, -25, 50, 50);
        wall.fill({ color: color, alpha: 0.8 });
        wall.x = pos.x;
        wall.y = pos.y;

        app.stage.addChild(wall);
        blockadeSpritesRef.current.set(pos.category, wall);
        blockadePositionsRef.current.set(pos.category, { x: pos.x, y: pos.y });
        blockadeOriginalPositionsRef.current.set(pos.category, { x: pos.x, y: pos.y });
      }
    }
  };

  // Update zombies with PixiJS ticker for smooth animation
  useEffect(() => {
    if (!appRef.current) return;

    const app = appRef.current;

    // Remove zombies that no longer exist
    const currentZombieIds = new Set(zombies.map(z => z.id));
    zombieSpritesRef.current.forEach((sprite, id) => {
      if (!currentZombieIds.has(id)) {
        app.stage.removeChild(sprite);
        sprite.destroy();
        zombieSpritesRef.current.delete(id);
        zombieTexturesRef.current.delete(id);
      }
    });

    // Add or update zombies - only render active zombies
    zombies.forEach((zombie) => {
      // Skip rendering if zombie is off-screen to the right (not yet spawned)
      if (zombie.position.x > app.screen.width) {
        return;
      }

      let container = zombieSpritesRef.current.get(zombie.id);
      
      if (!container) {
        // Create new zombie sprite container
        container = new PIXI.Container();
        
        // Set initial position IMMEDIATELY to avoid rendering at (0,0)
        // Use barrier position for Y to ensure perfect alignment
        const barrierPos = blockadePositionsRef.current.get(zombie.targetBlockade);
        container.x = zombie.position.x;
        container.y = barrierPos ? barrierPos.y : zombie.position.y;
        
        // Load initial frame
        const animation = zombie.state === 'spawning' ? 'WakeUp' :
                         zombie.state === 'moving' ? 'Walk' : 
                         zombie.state === 'attacking' ? 'Attack1' : 
                         zombie.state === 'defeated' ? 'Die' : 'Idle';
        const direction = 'W'; // Always face West (left) for side-scrolling view
        const frameIndex = Math.floor(zombie.spriteFrame || 0) % 15;
        
        console.log(`🧟 Creating new zombie sprite: ${zombie.id}, category=${zombie.targetBlockade}, pos=(${zombie.position.x.toFixed(2)}, ${zombie.position.y.toFixed(2)}), screen=(${container.x.toFixed(0)}, ${container.y.toFixed(0)}), state=${zombie.state}, dir=${direction}`);
        
        // Add to stage and ref IMMEDIATELY to prevent duplicate creation during async load
        app.stage.addChild(container);
        zombieSpritesRef.current.set(zombie.id, container);
        
        // Load texture asynchronously without blocking
        const zombieVariant = zombie.visualVariant || 5; // Default to CityZombie 5 if not set
        loadZombieFrame(animation, direction, frameIndex, zombieVariant).then(texture => {
          // Double-check container still exists and hasn't been replaced
          const existingContainer = zombieSpritesRef.current.get(zombie.id);
          if (!existingContainer || existingContainer !== container) return;
          
          const sprite = new PIXI.Sprite(texture);
          sprite.anchor.set(0.5, 0.5);
          sprite.width = 60;
          sprite.height = 120;
          container.addChild(sprite);
          
          console.log(`✅ Zombie sprite loaded successfully: ${zombie.id}`);
          
          // Pre-cache all frames
          const cacheKey = `${zombie.id}_${animation}_${direction}`;
          if (!zombieTexturesRef.current.has(cacheKey)) {
            Promise.all(
              Array.from({ length: 15 }, (_, i) => loadZombieFrame(animation, direction, i, zombieVariant))
            ).then(textures => {
              zombieTexturesRef.current.set(cacheKey, textures);
              console.log(`📦 Cached ${textures.length} frames for ${cacheKey}`);
            });
          }
        }).catch(error => {
          console.warn(`⚠️ Failed to load zombie sprite, using fallback: ${zombie.id}`, error);
          const existingContainer = zombieSpritesRef.current.get(zombie.id);
          if (!existingContainer || existingContainer !== container) return;
          
          const graphics = new PIXI.Graphics();
          graphics.rect(-32, -64, 64, 128);
          graphics.fill({ color: 0x10b981, alpha: 0.8 });
          container.addChild(graphics);
        });
      }

      // Update position - use actual barrier positions for alignment
      // Get the barrier position for this zombie's target
      const barrierPos = blockadePositionsRef.current.get(zombie.targetBlockade);
      if (barrierPos) {
        // Zombie should be at the same Y as its target barrier
        container.x = zombie.position.x;
        container.y = barrierPos.y; // Use barrier's Y position for perfect alignment
      } else {
        // Fallback to zombie's position if barrier not found
        container.x = zombie.position.x;
        container.y = zombie.position.y;
      }
      
      // Update sprite frame using cached textures
      const sprite = container.children[0] as PIXI.Sprite;
      if (sprite && sprite.texture) {
        const animation = zombie.state === 'spawning' ? 'WakeUp' :
                         zombie.state === 'moving' ? 'Walk' : 
                         zombie.state === 'attacking' ? 'Attack1' : 
                         zombie.state === 'defeated' ? 'Die' : 'Idle';
        const direction = 'W'; // Always face West (left)
        const frameIndex = Math.floor(zombie.spriteFrame || 0) % 15;
        const cacheKey = `${zombie.id}_${animation}_${direction}`;
        
        // Use cached texture if available, otherwise load
        const cachedTextures = zombieTexturesRef.current.get(cacheKey);
        if (cachedTextures && cachedTextures[frameIndex]) {
          sprite.texture = cachedTextures[frameIndex];
        } else {
          // Load and cache on demand
          const zombieVariant = zombie.visualVariant || 5;
          loadZombieFrame(animation, direction, frameIndex, zombieVariant).then(texture => {
            if (sprite && !sprite.destroyed) {
              sprite.texture = texture;
              // Cache for future use
              if (!zombieTexturesRef.current.has(cacheKey)) {
                zombieTexturesRef.current.set(cacheKey, []);
              }
              const textures = zombieTexturesRef.current.get(cacheKey)!;
              textures[frameIndex] = texture;
            }
          });
        }
      }
      
      // Update opacity for defeated zombies
      container.alpha = zombie.state === 'defeated' ? 0.5 : 1.0;
    });
  }, [zombies]);

  // Update blockades with health visualization and shake on damage
  useEffect(() => {
    if (!appRef.current) return;
    
    blockades.forEach(blockade => {
      const sprite = blockadeSpritesRef.current.get(blockade.category);
      const renderedPos = blockadePositionsRef.current.get(blockade.category);
      const originalPos = blockadeOriginalPositionsRef.current.get(blockade.category);
      
      if (sprite && renderedPos && originalPos) {
        const healthPercent = blockade.maxHealth > 0 
          ? blockade.currentHealth / blockade.maxHealth 
          : 0;
        
        // Check if health decreased (damage taken)
        const lastHealth = lastBlockadeHealthRef.current.get(blockade.category) || blockade.maxHealth;
        if (blockade.currentHealth < lastHealth) {
          // Trigger shake animation
          const shakeIntensity = 5;
          const shakeDuration = 200; // ms
          const startTime = Date.now();
          
          const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < shakeDuration) {
              const progress = elapsed / shakeDuration;
              const intensity = shakeIntensity * (1 - progress); // Decay over time
              
              sprite.x = originalPos.x + (Math.random() - 0.5) * intensity * 2;
              sprite.y = originalPos.y + (Math.random() - 0.5) * intensity * 2;
              
              requestAnimationFrame(shake);
            } else {
              // Reset to original position
              sprite.x = originalPos.x;
              sprite.y = originalPos.y;
            }
          };
          
          shake();
        }
        
        // Store current health for next comparison
        lastBlockadeHealthRef.current.set(blockade.category, blockade.currentHealth);
        
        // Update opacity based on health
        sprite.alpha = 0.5 + (healthPercent * 0.5);
        
        // Add visual deterioration by changing tint
        // Healthy: normal color, Damaged: darker/redder
        sprite.tint = healthPercent > 0.5 ? 0xFFFFFF : 0xFF8888; // Red tint when damaged
        
        // Update blockade position in the blockade data to match rendered position
        // This ensures zombie collision detection uses the correct position
        blockade.position.x = renderedPos.x;
        blockade.position.y = renderedPos.y;
      }
    });
  }, [blockades]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
