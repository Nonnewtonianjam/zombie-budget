# Documentation Guidelines

## Core Principle
**Do NOT create markdown documentation files for every change or feature implementation.**

## When to Create Documentation

### ✅ DO Create Documentation When:
- Explicitly requested by the user
- Complex system architecture that needs explanation for future reference
- API documentation for public interfaces
- Setup/installation instructions
- Contributing guidelines for team projects

### ❌ DO NOT Create Documentation When:
- Completing a task from the implementation plan
- Making code changes or bug fixes
- Implementing features (the code should be self-documenting)
- Finishing a component or module
- Adding tests

## Why This Matters
- **Noise:** Excessive documentation files clutter the repository
- **Maintenance:** More files to keep updated when code changes
- **Redundancy:** Good code with comments is self-documenting
- **Time:** Focus on implementation, not documentation overhead

## What to Do Instead

### Use Code Comments
```typescript
/**
 * Calculate home base state from health percentage
 * @param health - Current health value
 * @param maxHealth - Maximum health value
 * @returns State: 'safe' (75-100%), 'threatened' (50-74%), or 'critical' (0-49%)
 */
export function getHomeBaseState(health: number, maxHealth: number): HomeBaseState {
  // Implementation...
}
```

### Use README Files (Sparingly)
- One README per major feature/module if needed
- Keep it concise and focused
- Update existing READMEs rather than creating new ones

### Use Inline Documentation
- JSDoc comments for functions and components
- Type definitions with descriptions
- Brief comments for complex logic

## Summary Files

### ❌ NEVER Create:
- `FEATURE_COMPLETE.md` files
- `IMPLEMENTATION_SUMMARY.md` files
- `CHANGES.md` files for individual tasks
- `VISUAL_STATES_REFERENCE.md` type files
- Any markdown file documenting what you just did

### ✅ Exception:
- If the user explicitly asks: "Document this feature" or "Create a guide for X"

## Remember
**Your job is to write code, not write about writing code.**

Let the code speak for itself. Use comments where needed. Create documentation only when it adds real value that code cannot provide.
