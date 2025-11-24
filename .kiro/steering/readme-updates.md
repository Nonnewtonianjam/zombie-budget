---
inclusion: always
---

# README Update Guidelines

## Core Principle
**The README is for users and judges, not developers. Keep it high-level and valuable.**

## ❌ DO NOT Add to README

### Implementation Details
- Internal utility functions and their parameters
- Object pooling statistics or technical metrics
- Performance optimization techniques
- Internal API documentation
- Code-level integration details
- Helper function lists

### Developer Documentation
- "How to integrate X into Y"
- Technical implementation notes
- Performance benchmarks with specific numbers
- Memory usage details
- Reuse rates and efficiency metrics

### Noise
- Every new utility function
- Every performance optimization
- Every internal system change
- Granular technical details

## ✅ DO Add to README

### User-Facing Features
- New gameplay mechanics visible to users
- New UI components users interact with
- Major visual improvements
- New screens or pages

### High-Level Architecture
- Major technology choices (React, Vite, Canvas)
- Core game concepts (isometric view, zombies, blockades)
- Overall project structure

### Getting Started Info
- Installation steps
- Development commands
- Build instructions
- Basic project overview

## Examples

### ❌ Bad README Update
```markdown
### Zombie Object Pool (`src/lib/zombiePool.ts`)
- **ZombiePool** - Object pool class for managing zombie lifecycle and memory
- **spawnZombieFromPool** - Acquire zombie from pool (reuses defeated zombies)
- **releaseZombieToPool** - Return defeated zombie to pool for reuse
- **getActiveZombies** - Get all currently active zombies in the game
- **clearZombiePool** - Clear all zombies (active and pooled) for game reset
- **getZombiePoolStats** - Get pool statistics for performance monitoring

## 🎯 Performance Targets
- **Object pooling** for 20-30% reduction in GC pressure
```

**Why it's bad:**
- Users don't care about object pooling
- Judges won't look at internal optimization details
- Clutters the README with developer-only information
- Specific performance metrics are meaningless to non-developers

### ✅ Good README Update
```markdown
## 🎮 Features
- **Smooth 60fps Animation**: Optimized rendering for fluid gameplay
```

**Why it's good:**
- User-facing benefit (smooth animation)
- No technical jargon
- Judges will notice and appreciate this
- Concise and valuable

## When to Update README

### Update When:
1. Adding a new user-facing feature
2. Changing major technology stack
3. Adding new getting started steps
4. Changing project structure significantly

### Don't Update When:
1. Implementing internal optimizations
2. Adding utility functions
3. Refactoring code
4. Adding tests or examples
5. Creating integration guides

## README Sections to Avoid

### ❌ Don't Create These Sections:
- "Utilities" with function lists
- "Performance Optimizations"
- "Internal Systems"
- "Developer Tools"
- Detailed API documentation

### ✅ Keep These Sections:
- Features (user-facing only)
- Tech Stack (high-level)
- Getting Started
- Project Structure (folders only)
- Design System (colors, fonts)

## The 5-Minute Test

Before adding something to the README, ask:
1. **Will a judge care about this in 5 minutes?**
   - No → Don't add it
2. **Will a user see or benefit from this?**
   - No → Don't add it
3. **Is this a technical implementation detail?**
   - Yes → Don't add it

## Remember

The README is marketing material for your hackathon project, not technical documentation for developers.

**Focus on what judges will see and users will experience, not how the code works internally.**
