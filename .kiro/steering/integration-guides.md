---
inclusion: always
---

# Integration Guide Policy

## Core Principle
**Do NOT create integration guides, migration checklists, or "how to use" documentation files.**

## ❌ NEVER Create These Files

### Integration Guides
- `FEATURE_INTEGRATION.md`
- `HOW_TO_USE_X.md`
- `MIGRATION_GUIDE.md`
- `INTEGRATION_CHECKLIST.md`
- `GETTING_STARTED_WITH_X.md`

### Implementation Documentation
- `IMPLEMENTATION_NOTES.md`
- `TECHNICAL_DETAILS.md`
- `ARCHITECTURE_DECISIONS.md`
- `PERFORMANCE_GUIDE.md`

### Usage Examples (as separate files)
- `feature.example.ts`
- `feature.usage.ts`
- `feature.demo.ts` (unless for visual component testing during development)

## Why This Matters

### 1. Judges Won't Read Them
- Judges spend 5-10 minutes with your app
- They won't browse documentation files
- They won't read integration guides
- They care about the working demo, not the docs

### 2. Waste of Time
- Writing docs takes time away from building features
- Maintaining docs takes time away from polish
- Judges evaluate the demo, not the documentation quality

### 3. Code Should Be Self-Documenting
- Good code with comments is better than separate docs
- JSDoc comments explain functions inline
- Type definitions document interfaces
- README covers high-level concepts

### 4. Creates Noise
- Clutters the repository
- Makes it harder to find actual code
- Gives false impression of complexity
- Distracts from the actual implementation

## What to Do Instead

### Use Code Comments
```typescript
/**
 * Spawn a zombie from the object pool
 * Automatically reuses defeated zombies for better performance
 * 
 * @param config - Zombie configuration
 * @returns Zombie instance from pool
 */
export function spawnZombieFromPool(config: ZombieAcquireConfig): Zombie {
  return globalZombiePool.acquire(config);
}
```

### Use JSDoc for Complex Functions
```typescript
/**
 * Process zombie attacks on blockades
 * 
 * Handles attack cooldowns, damage calculation, and blockade health updates.
 * Call this each game loop iteration to process all active zombie attacks.
 * 
 * @example
 * const events = processAttacks(zombies, blockades, deltaTime);
 * events.forEach(event => console.log(`Zombie ${event.zombieId} dealt ${event.damage} damage`));
 */
export function processAttacks(/* ... */) { /* ... */ }
```

### Use Type Definitions
```typescript
/**
 * Configuration for acquiring a zombie from the pool
 */
export interface ZombieAcquireConfig {
  type: ZombieType;
  strength: number;
  position: IsometricPosition;
  targetBlockade: string;
  speed: number;
  transactionId: string;
  direction?: Direction;
}
```

### Keep README High-Level
```markdown
## 🎮 Features
- **Zombie Spawning**: Overspending spawns zombies that attack your budget
- **Smooth Animation**: 60fps gameplay with optimized rendering
```

## Exceptions

### ✅ You MAY Create Documentation If:
1. **Explicitly requested by user**: "Create a guide for X"
2. **Complex external API**: Documenting third-party integration
3. **Team onboarding**: Multiple developers need coordination (not applicable for hackathon)

### ❌ You MUST NOT Create Documentation For:
1. Internal optimizations (object pooling, batching, culling)
2. Utility functions and helpers
3. Integration between your own modules
4. Performance improvements
5. Code refactoring
6. Bug fixes
7. Feature implementations

## Red Flags

If you're creating a file with these names, STOP:
- `*_INTEGRATION.md`
- `*_GUIDE.md`
- `*_CHECKLIST.md`
- `*_MIGRATION.md`
- `*_USAGE.md`
- `*_EXAMPLES.md`
- `*.example.ts`
- `*.usage.ts`

## The Hackathon Reality

**You have 10 days to build a demo that impresses judges in 5 minutes.**

Time spent on documentation is time NOT spent on:
- Polishing the playback animation
- Improving visual effects
- Fixing bugs
- Adding juice to the UI
- Making the demo smoother

**Every minute counts. Build the demo, not the docs.**

## Summary

- ❌ No integration guides
- ❌ No usage examples as separate files
- ❌ No migration checklists
- ❌ No "how to use" documentation
- ✅ Use code comments and JSDoc
- ✅ Keep README high-level and user-focused
- ✅ Let the code speak for itself

**If judges won't see it in 5 minutes, don't document it.**
