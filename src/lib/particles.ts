/**
 * Particle System for Visual Effects
 * 
 * Simple particle system for zombie defeat and blockade healing effects.
 * Optimized for performance with minimal overhead.
 * 
 * Features:
 * - Blood splatter particles for zombie defeat
 * - Toxic glow particles for blockade healing
 * - Gravity and fade effects
 * - Automatic cleanup when particles expire
 */

export type ParticleType = 'blood' | 'toxic' | 'dust';

export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  life: number; // Remaining life (0-1)
  maxLife: number; // Total lifetime in seconds
  size: number;
  color: string;
  alpha: number;
}

/**
 * Create blood splatter particles for zombie defeat
 * Enhanced with varied sizes and speeds for more dramatic effect
 * 
 * @param x - Screen X position
 * @param y - Screen Y position
 * @param count - Number of particles to spawn (default: 8)
 * @returns Array of blood particles
 */
export function createBloodParticles(x: number, y: number, count: number = 8): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    // Random angle for particle spread with more variation
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
    const speed = 60 + Math.random() * 120; // Increased speed for more impact
    
    // Vary particle sizes more dramatically
    const sizeVariation = Math.random();
    const size = sizeVariation > 0.7 ? 6 + Math.random() * 4 : 3 + Math.random() * 3;
    
    particles.push({
      id: `blood-${Date.now()}-${i}`,
      type: 'blood',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60, // More upward velocity
      life: 1.0,
      maxLife: 0.9 + Math.random() * 0.5, // Slightly longer lifetime
      size,
      color: sizeVariation > 0.5 ? '#a83232' : '#8a2828', // Vary blood color
      alpha: 1.0,
    });
  }
  
  return particles;
}

/**
 * Create toxic glow particles for blockade healing
 * Enhanced with floating upward motion and glow effect
 * 
 * @param x - Screen X position
 * @param y - Screen Y position
 * @param count - Number of particles to spawn (default: 6)
 * @returns Array of toxic particles
 */
export function createToxicParticles(x: number, y: number, count: number = 6): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    // Random angle for particle spread (strong upward bias for healing effect)
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
    const speed = 40 + Math.random() * 60; // Faster upward movement
    
    // Vary particle sizes for depth
    const sizeVariation = Math.random();
    const size = sizeVariation > 0.6 ? 4 + Math.random() * 3 : 2 + Math.random() * 2;
    
    particles.push({
      id: `toxic-${Date.now()}-${i}`,
      type: 'toxic',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      maxLife: 1.2 + Math.random() * 0.6, // Longer lifetime for healing effect
      size,
      color: sizeVariation > 0.5 ? '#4a9d5f' : '#5cb574', // Vary green shades
      alpha: 1.0,
    });
  }
  
  return particles;
}

/**
 * Create dust particles for general effects
 * 
 * @param x - Screen X position
 * @param y - Screen Y position
 * @param count - Number of particles to spawn (default: 4)
 * @returns Array of dust particles
 */
export function createDustParticles(x: number, y: number, count: number = 4): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 20 + Math.random() * 40;
    
    particles.push({
      id: `dust-${Date.now()}-${i}`,
      type: 'dust',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      life: 1.0,
      maxLife: 0.5 + Math.random() * 0.3, // 0.5-0.8 seconds
      size: 2 + Math.random() * 2, // 2-4 pixels
      color: '#6a6a6a', // decay-light
      alpha: 0.6,
    });
  }
  
  return particles;
}

/**
 * Update particle physics and lifetime
 * 
 * @param particle - Particle to update
 * @param deltaTime - Time since last frame in seconds
 * @returns Updated particle or null if expired
 */
export function updateParticle(particle: Particle, deltaTime: number): Particle | null {
  // Update lifetime
  const newLife = particle.life - (deltaTime / particle.maxLife);
  
  // Remove expired particles
  if (newLife <= 0) {
    return null;
  }
  
  // Apply gravity (only for blood and dust)
  const gravity = particle.type === 'toxic' ? 0 : 200; // pixels per second squared
  const newVy = particle.vy + gravity * deltaTime;
  
  // Update position
  const newX = particle.x + particle.vx * deltaTime;
  const newY = particle.y + particle.vy * deltaTime;
  
  // Fade out based on remaining life
  const newAlpha = particle.alpha * newLife;
  
  return {
    ...particle,
    x: newX,
    y: newY,
    vy: newVy,
    life: newLife,
    alpha: newAlpha,
  };
}

/**
 * Render a single particle on canvas
 * Enhanced with better glow effects and visual polish
 * 
 * @param ctx - Canvas 2D rendering context
 * @param particle - Particle to render
 */
export function renderParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
  ctx.save();
  
  // Set alpha based on particle life
  ctx.globalAlpha = particle.alpha;
  
  // Enhanced glow effects based on particle type
  if (particle.type === 'toxic') {
    // Stronger glow for toxic particles
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 12 * particle.life; // Glow fades with life
    
    // Draw outer glow layer
    ctx.globalAlpha = particle.alpha * 0.3;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 1.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset alpha for main particle
    ctx.globalAlpha = particle.alpha;
  } else if (particle.type === 'blood') {
    // Subtle glow for blood particles
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 4;
  }
  
  // Draw main particle as circle
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
  
  // Add highlight for depth (except dust)
  if (particle.type !== 'dust' && particle.life > 0.5) {
    ctx.globalAlpha = particle.alpha * 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(
      particle.x - particle.size * 0.3, 
      particle.y - particle.size * 0.3, 
      particle.size * 0.4, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
  
  ctx.restore();
}

/**
 * Render all particles in an array
 * 
 * @param ctx - Canvas 2D rendering context
 * @param particles - Array of particles to render
 */
export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  particles.forEach(particle => renderParticle(ctx, particle));
}

/**
 * Update all particles and remove expired ones
 * 
 * @param particles - Array of particles to update
 * @param deltaTime - Time since last frame in seconds
 * @returns Updated array with expired particles removed
 */
export function updateParticles(particles: Particle[], deltaTime: number): Particle[] {
  return particles
    .map(p => updateParticle(p, deltaTime))
    .filter((p): p is Particle => p !== null);
}
