---
inclusion: always
---

# Technology Stack & Code Standards

## Core Technologies

- **React 18.2+** with TypeScript for component-based architecture
- **TypeScript 5.0+** with strict mode enabled
- **Vite 5.0+** for fast development and optimized builds
- **Tailwind CSS 3.4+** for utility-first styling

## Code Organization

### File Structure
- Functional components only (no class components)
- Custom hooks in `/src/hooks/`
- Utility functions in `/src/lib/`
- Types in `/src/types/`
- Constants in `/src/constants/`
- Each component in its own file
- Colocate tests with components

### Naming Conventions
- **Components:** PascalCase (`ZombieSprite.tsx`)
- **Hooks:** camelCase with 'use' prefix (`useGameLoop.ts`)
- **Utilities:** camelCase (`calculateZombieStrength.ts`)
- **Types:** PascalCase (`Transaction.ts`)
- **Constants:** SCREAMING_SNAKE_CASE (`ZOMBIE_TYPES.ts`)

### Import Order
```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';

// 2. Internal components
import { ZombieSprite } from '@/components/game/ZombieSprite';

// 3. Hooks
import { useGameState } from '@/hooks/useGameState';

// 4. Utils and types
import { calculateDamage } from '@/lib/gameLogic';
import type { Zombie } from '@/types/game';

// 5. Assets
import zombieImage from '@/assets/sprites/zombie.png';
```

## State Management

- **Zustand** for global state (zombies, blockades, game state)
- **React Context** for theme and settings
- **TanStack Query** for async data operations
- Local component state with `useState`/`useReducer` for isolated state

## Styling Approach

- Tailwind utility classes for most styling
- Custom CSS for complex animations
- Dark theme with professional fintech aesthetics
- Subtle animations (200ms duration, small scale changes)

### Color Palette
```javascript
colors: {
  background: {
    primary: '#0a0a0f',
    secondary: '#1a1a24',
    tertiary: '#242432',
  },
  brand: {
    primary: '#8b5cf6',
    secondary: '#a78bfa',
  },
  success: '#10b981',
  danger: '#ef4444',
}
```

## Performance Best Practices

- Code splitting by route with lazy loading
- `React.memo` for expensive components
- `useMemo`/`useCallback` for optimization
- Object pooling for frequently created/destroyed game entities
- Cull off-screen objects in game view
- Use `requestAnimationFrame` for game loops (not `setTimeout`/`setInterval`)

## Animation Strategy

- **UI transitions:** CSS transitions and animations (200ms duration)
- **Game loop:** `requestAnimationFrame` for 60fps updates
- **Sprite animation:** Frame-based switching
- **Particle effects:** Canvas API with custom particle system
- Avoid Framer Motion (unnecessary bundle size for this use case)

## Form Handling

- **React Hook Form** for transaction input forms
- **Zod** for schema validation

## Date & Number Formatting

- **date-fns** for date manipulation (avoid moment.js)
- `Intl.NumberFormat` for currency formatting
- `Intl.DateTimeFormat` for date formatting

## Browser APIs

- `localStorage` for demo data persistence
- `Canvas API` for game rendering
- `requestAnimationFrame` for smooth animations
- `IntersectionObserver` for performance optimization

## Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Visible focus indicators (2px ring with brand-primary)

## Writing Style

### Financial UI (Primary)
- Professional, clear language
- "Add Transaction" (not "Summon Transaction")
- "Budget Categories" (not "Fortify Defenses")
- Trust-building, straightforward copy

### Game View (Playback Screen)
- Game metaphors appropriate here
- "Your defenses held strong this month"
- "Defense Status" for blockades

**Principle:** Professional first, playful second. This is a premium fintech app with gamified storytelling, not a Halloween-themed game.

## Bundle Size Targets

- Initial bundle < 200KB gzipped
- Each route chunk < 100KB gzipped
- Use `vite-plugin-visualizer` to analyze bundle

## Browser Support

- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+
- No IE11 support required

## Testing

- **Vitest** for unit tests
- **React Testing Library** for component tests
- Run tests with `--run` flag for CI (avoid watch mode in automation)
- **Not every component needs tests or demos** - focus on core functionality and complex logic
- Demos are helpful for visual components but not required for every step
- Prioritize implementation velocity over comprehensive test coverage during development

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7",
    "recharts": "^2.10.3",
    "date-fns": "^3.0.0",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@tanstack/react-query": "^5.17.0",
    "lucide-react": "^0.294.0"
  }
}
```

## Development Tools

- **ESLint** with React, TypeScript, and Tailwind plugins
- **Prettier** for code formatting
- Use provided `eslint.config.js` configuration
