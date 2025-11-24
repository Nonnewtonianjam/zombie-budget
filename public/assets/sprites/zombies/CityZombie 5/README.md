# CityZombie 5 Sprite Sheets

## Overview

Professional zombie sprite sheets with full animation support for isometric games. Each animation includes 15 frames across 8 directions.

## Directory Structure

```
CityZombie 5/
├── Idle/           # Default resting state
├── Idle2/          # Alternative idle animation
├── Walk/           # Standard walking (use for approaching zombies)
├── Run/            # Fast movement
├── CrouchRun/      # Sneaky movement
├── Attack1/        # Primary attack
├── Attack2/        # Secondary attack
├── Attack3/        # Tertiary attack
├── Attack4/        # Quaternary attack
├── Attack5/        # Quinary attack
├── TakeDamage/     # Zombie gets hit
├── Die/            # Death animation
├── Die2/           # Alternative death
├── Taunt/          # Zombie taunts player
└── WakeUp/         # Zombie rises from ground
```

## Frame Structure

Each animation folder contains 8 direction subfolders:

```
Walk/
├── N/    (90°)  - Moving up
├── NE/   (45°)  - Moving up-right
├── E/    (0°)   - Moving right
├── SE/   (315°) - Moving down-right
├── S/    (270°) - Moving down (toward player)
├── SW/   (225°) - Moving down-left
├── W/    (180°) - Moving left
└── NW/   (135°) - Moving up-left
```

Each direction contains 15 PNG frames:
- Frame naming: `{Animation}_{Angle}_{FrameNumber}.png`
- Frame numbers: 001, 003, 005, 007, 009, 011, 013, 015, 017, 019, 021, 023, 025, 027, 029
- Example: `Walk_270_001.png`, `Walk_270_003.png`, etc.

## Sprite Specifications

| Property | Value |
|----------|-------|
| Dimensions | 128x256 pixels per frame |
| Format | PNG (32-bit with alpha) |
| Frames per Animation | 15 |
| Directions | 8 (full isometric) |
| Total Frames per Animation | 120 (15 frames × 8 directions) |
| Recommended FPS | 12-15 fps |

## Usage in Zombie Budget

### For Zombie Spawning (Task 2.2)
Use these animations for zombie behavior:

1. **Spawning**: `WakeUp` animation when zombie first appears
2. **Approaching**: `Walk` animation with `S` direction (toward player)
3. **Attacking Blockade**: `Attack1` animation
4. **Taking Damage**: `TakeDamage` when blockade fights back
5. **Defeated**: `Die` animation when transaction is defended

### Recommended Animation Mapping

```typescript
const ZOMBIE_BEHAVIOR_ANIMATIONS = {
  spawn: 'WakeUp',
  idle: 'Idle',
  moving: 'Walk',
  attacking: 'Attack1',
  damaged: 'TakeDamage',
  defeated: 'Die'
};
```

### Direction Selection

For Zombie Budget, zombies primarily move toward the player (homebase):
- Use **S (270°)** direction for zombies approaching from top
- Calculate direction based on zombie position relative to target
- Use 8-directional movement for smooth pathfinding

## Loading Sprites

Use the utilities in `src/lib/sprites.ts`:

```typescript
import {
  getZombieSpriteFramePath,
  preloadZombieAnimation,
  preloadEssentialZombieAnimations
} from '@/lib/sprites';

// Load essential animations at game start
const animations = await preloadEssentialZombieAnimations('S');

// Access frames
const walkFrames = animations.get('Walk');
const attackFrames = animations.get('Attack1');
```

## Performance Tips

1. **Preload Essential Animations**: Load Idle, Walk, Attack1, and Die at game start
2. **Lazy Load Others**: Load Attack2-5, Taunt, etc. only if needed
3. **Direction Optimization**: If zombies only approach from one direction, only load that direction
4. **Frame Caching**: Keep loaded frames in memory, don't reload
5. **Object Pooling**: Reuse zombie instances instead of creating new ones

## Animation Timing

Recommended frame rates for different animations:

| Animation | FPS | Duration | Use Case |
|-----------|-----|----------|----------|
| Idle | 8 | ~1.9s | Waiting state |
| Walk | 12 | ~1.25s | Normal movement |
| Run | 15 | ~1s | Fast movement |
| Attack | 12 | ~1.25s | Attacking blockade |
| TakeDamage | 15 | ~1s | Quick reaction |
| Die | 10 | ~1.5s | Dramatic death |
| WakeUp | 10 | ~1.5s | Spawning |

## Integration with Game Systems

### Isometric Rendering
- Sprites are designed for 30° isometric projection
- Use pivot point (0.5, 0.19) for ground contact
- Z-index calculated from position for depth layering

### Zombie Strength Visualization
Different zombie types can use different animations:
- **Weak zombies** (small transactions): Walk, Attack1
- **Strong zombies** (large transactions): Run, Attack3
- **Boss zombies** (huge transactions): Run, Attack5, Taunt

### Category Differentiation
Since all zombies use the same sprite, differentiate by:
- **Color tinting** (food=green, entertainment=purple, shopping=blue, subscriptions=orange)
- **Size scaling** (strength-based)
- **Animation speed** (stronger = faster)
- **Particle effects** (category-specific)

## Credits

CityZombie 5 sprite sheets - Professional game assets for isometric zombie games.

## License

[Add license information if available]
