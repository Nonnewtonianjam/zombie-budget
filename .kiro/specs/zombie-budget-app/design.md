# Design Document

## Overview

Zombie Budget is a React-based single-page application built for the Kiroween Hackathon. The application transforms personal finance tracking into a visual experience through isometric game rendering, playback animations, and professional fintech features with a subtle dark theme.

The architecture prioritizes the 30-45 second playback experience as the centerpiece, with supporting features for transaction management, budget configuration, and financial insights. The zombie game visualization is the primary themed element, while the rest of the UI maintains a clean, professional fintech aesthetic.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Features   │  │  Components  │  │    Hooks     │ │
│  │              │  │              │  │              │ │
│  │ - Playback   │  │ - Game View  │  │ - useLocal   │ │
│  │ - Budget     │  │ - Charts     │  │   Storage    │ │
│  │ - Insights   │  │ - Trans      │  │ - usePlay    │ │
│  │ - Demo       │  │   actions    │  │   back       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Utils     │  │    Types     │  │  Constants   │ │
│  │              │  │              │  │              │ │
│  │ - Calcs      │  │ - Trans      │  │ - Categories │ │
│  │ - Animations │  │ - Budget     │  │ - Zombie     │ │
│  │ - Category   │  │ - Zombie     │  │   Types      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    localStorage API                      │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18.2+ with TypeScript 5.0+ (strict mode enabled)
- **Build Tool**: Vite 5.0+ for fast development and optimized production builds
- **Styling**: Tailwind CSS 3.4+ with custom spooky theme configuration
- **Charts**: Recharts 2.10+ for real-time analytics visualizations
- **Icons**: Lucide React for UI icons
- **State Management**: Zustand for global game state, React Context for theme/settings
- **Data Persistence**: Browser localStorage (no backend required for V1)
- **Animation**: 
  - Canvas API for isometric game rendering
  - requestAnimationFrame for 60fps game loop
  - CSS animations for UI transitions (NO Framer Motion - overkill for sprite games)
  - Custom particle system for visual effects
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns (lightweight alternative to moment.js)
- **Deployment**: Vercel or Netlify for static hosting

### Why These Choices?

- **No Framer Motion**: Unnecessary bundle size for sprite-based game animations
- **Zustand over Redux**: Simpler API, smaller bundle, perfect for game state
- **Canvas over SVG**: Better performance for isometric rendering with many sprites
- **localStorage over Backend**: Faster development, no server costs, meets V1 requirements

## Components and Interfaces

### Core Components

#### 1. App Component
- Root component managing global state and routing
- Provides context for transactions and budgets
- Handles demo mode toggle
- Manages current view (dashboard, playback, insights)

#### 2. Game View Components

**GameCanvas**
- Main container for game visualization
- Manages canvas rendering and animation loop
- Coordinates zombie spawning and movement
- Handles blockade damage and healing
- Renders home base

**Zombie**
- Represents individual overspending transactions
- Properties: type (based on category), health, position, speed
- Attacks assigned blockade
- Animated movement using isometric sprites (128x256px)

**Blockade**
- Represents budget allocation for a category
- Properties: category, maxHealth (budget amount), currentHealth
- Visual health indicator (progress bar)
- Takes damage from zombies, heals from good spending
- Four types: Food, Entertainment, Shopping, Subscriptions

**HomeBase**
- Central defensive structure
- Represents overall financial health
- Takes damage when blockades are destroyed
- Visual indicator of monthly financial status

#### 3. Transaction Components

**TransactionList**
- Displays all transactions in chronological order
- Supports filtering by category and date range
- Shows transaction amount, category, date, description
- Provides edit and delete actions

**TransactionForm**
- Input form for creating/editing transactions
- Fields: amount (number), category (select), date (date picker), description (text)
- Validation for required fields and data types
- Submit and cancel actions

**TransactionItem**
- Individual transaction display
- Color-coded by category
- Shows impact (zombie spawn or healing)
- Click to edit functionality

#### 4. Chart Components

**SpendingChart**
- Line chart showing cumulative spending over time
- X-axis: days of month, Y-axis: cumulative amount
- Budget line overlay for comparison
- Responsive to container size
- Updates in real-time during playback

**CategoryBreakdown**
- Pie or bar chart showing spending by category
- Color-coded by category
- Percentage and amount labels
- Interactive hover states

#### 5. Feature Modules

**Playback Feature**
- Controls: play, pause, restart, speed adjustment
- Timeline scrubber for navigation
- Synchronized animation of zombies and charts
- Progress indicator
- 30-45 second duration with configurable speed

**Budget Configuration**
- Input fields for each category budget
- Visual preview of blockade strength
- Total budget calculation
- Save and reset functionality

**Insights Dashboard**
- Monthly summary statistics
- Spending trends and patterns
- Actionable recommendations
- Category-specific insights
- Comparison to budget goals

**Demo Mode**
- Toggle to activate/deactivate
- Generates realistic sample transactions
- Clear visual indicator of demo status
- One-click data population

### UI Components Library

**Button**
- Variants: primary, secondary, danger, ghost
- Sizes: small, medium, large
- Loading and disabled states

**Card**
- Container for grouped content
- Variants: standard, featured
- Optional header and footer sections

**ProgressBar**
- Visual indicator for health/budget utilization
- Color-coded by status (healthy, warning, danger)
- Animated transitions

**Input**
- Text, number, date, select variants
- Validation states and error messages
- Consistent styling across types

## Data Models

### Transaction Interface
```typescript
interface Transaction {
  id: string;                    // UUID
  amount: number;                // Positive number (validated)
  category: TransactionCategory; // Food | Entertainment | Shopping | Subscriptions
  date: Date;                    // Transaction date
  description: string;           // User-provided description (max 200 chars)
  isGoodSpending: boolean;       // Determines zombie spawn or healing
  zombieGenerated?: Zombie;      // Reference to spawned zombie (if bad spending)
  createdAt: Date;              // Record creation timestamp
  updatedAt: Date;              // Last modification timestamp
}

enum TransactionCategory {
  FOOD = 'food',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  SUBSCRIPTIONS = 'subscriptions',
  SAVINGS = 'savings',           // Good spending
  DEBT_PAYMENT = 'debt_payment'  // Good spending
}
```

### Budget Interface
```typescript
interface Budget {
  category: Category;
  amount: number;                // Budget limit for category
  spent: number;                 // Current spending in category
  remaining: number;             // Calculated: amount - spent
  utilizationPercent: number;    // Calculated: (spent / amount) * 100
}
```

### Zombie Interface
```typescript
interface Zombie {
  id: string;
  type: ZombieType;              // Based on transaction category
  strength: number;              // transaction amount / 10
  position: { x: number; y: number; z: number }; // Isometric coordinates
  targetBlockade: BlockadeType;
  speed: number;                 // Shambling speed (varies by type)
  state: 'spawning' | 'moving' | 'attacking' | 'defeated';
  transactionId: string;         // Reference to source transaction
  spriteFrame: number;           // Current animation frame
  spawnedFrom: string;           // Transaction ID for tracking
}

enum ZombieType {
  FAST_FOOD = 'fast_food',       // Food category
  IMPULSE = 'impulse',           // Shopping category
  SUBSCRIPTION = 'subscription', // Subscriptions category
  LUXURY = 'luxury'              // Entertainment category
}

// Zombie Generation Rules:
// - Each bad transaction spawns 1 zombie
// - Zombie strength = transaction amount / 10
// - Zombies target specific blockades based on category
```

### Blockade Interface
```typescript
interface Blockade {
  category: Category;
  maxHealth: number;             // Budget amount
  currentHealth: number;         // Remaining after damage/healing
  position: { x: number; y: number; z: number };
  state: 'intact' | 'damaged' | 'critical' | 'destroyed';
  visualLevel: number;           // 0-3 for visual representation
}
```

### HomeBase Interface
```typescript
interface HomeBase {
  health: number;                // Overall financial health
  maxHealth: number;             // Total budget across categories
  state: 'safe' | 'threatened' | 'critical';
  position: { x: number; y: number; z: number };
}
```

### PlaybackState Interface
```typescript
interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;           // Milliseconds into playback
  duration: number;              // Total playback duration (30-45s)
  speed: number;                 // Playback speed multiplier (0.5x - 2x)
  transactions: Transaction[];   // Transactions to animate
  currentIndex: number;          // Current transaction being processed
}
```

### Category Type
```typescript
type Category = 'Food' | 'Entertainment' | 'Shopping' | 'Subscriptions';
```

### ZombieType Enum
```typescript
enum ZombieType {
  Food = 'food',
  Entertainment = 'entertainment',
  Shopping = 'shopping',
  Subscriptions = 'subscriptions'
}
```

## Error Handling

### localStorage Errors
- Catch QuotaExceededError and notify user of storage limits
- Provide option to clear old data or export to file
- Graceful degradation if localStorage unavailable
- Fallback to in-memory storage with warning

### Validation Errors
- Client-side validation for all form inputs
- Clear error messages displayed inline
- Prevent form submission until errors resolved
- Highlight invalid fields with visual indicators

### Animation Errors
- Catch and log requestAnimationFrame errors
- Fallback to CSS animations if canvas fails
- Performance monitoring to detect frame drops
- Automatic quality reduction if performance degrades

### Data Integrity
- Validate data structure on localStorage read
- Migrate old data formats automatically
- Handle corrupted data with user notification
- Provide data export/import for backup

## Testing Strategy

### Unit Tests
- Utility functions (calculations, categorization, animations)
- Custom hooks (useLocalStorage, usePlayback, useTransactions)
- Data model validation and transformations
- Component logic (excluding visual rendering)

### Integration Tests
- Transaction CRUD operations with localStorage
- Budget configuration and blockade health calculations
- Playback synchronization between game and charts
- Demo mode data generation and cleanup

### Component Tests
- Form validation and submission
- User interactions (clicks, inputs, navigation)
- Conditional rendering based on state
- Accessibility features (keyboard nav, ARIA labels)

### Performance Tests
- Animation frame rate monitoring (60fps target)
- Page load time measurement (< 3s target)
- Transaction processing time (< 500ms target)
- Chart update latency (< 100ms target)

### Browser Compatibility Tests
- Manual testing on Chrome, Firefox, Safari, Edge
- Responsive design testing on mobile, tablet, desktop
- Touch interaction testing on mobile devices
- localStorage functionality across browsers

### Accessibility Tests
- Automated WCAG 2.1 AA compliance checking
- Screen reader compatibility testing
- Keyboard navigation verification
- Color contrast validation

## Performance Optimizations

### Rendering Optimizations
- Use React.memo for expensive components
- Implement virtual scrolling for long transaction lists
- Debounce chart updates during rapid data changes
- Use CSS transforms for animations (GPU acceleration)
- Lazy load non-critical components

### Data Management
- Batch localStorage writes to reduce I/O
- Cache calculated values (budget utilization, totals)
- Use useMemo for expensive calculations
- Implement efficient zombie spawning algorithm

### Animation Performance
- Use requestAnimationFrame for game loop
- Limit particle effects on mobile devices
- Reduce sprite quality on low-end devices
- Implement frame skip if performance degrades
- Use CSS will-change for animated elements

### Bundle Optimization
- Code splitting by route/feature
- Tree shaking unused dependencies
- Minification and compression
- Lazy load Recharts library
- Optimize image assets (sprites, icons)

## Security Considerations

### Content Security Policy
- Restrict script sources to same-origin
- Disable inline scripts and eval()
- Whitelist external resources (fonts, CDNs)

### Data Privacy
- All data stored locally (no server transmission)
- No third-party analytics in V1
- Clear data deletion functionality
- Export data in standard format (JSON)

### Input Validation
- Sanitize all user inputs
- Validate data types and ranges
- Prevent XSS through React's built-in escaping
- Limit string lengths to prevent DoS

## Deployment Considerations

### Build Process
- Vite production build with optimizations
- Environment-specific configurations
- Source maps for debugging (dev only)
- Asset optimization and compression

### Hosting
- Static file hosting (Netlify, Vercel, GitHub Pages)
- HTTPS required for localStorage security
- CDN for global distribution
- Caching strategy for static assets

### Monitoring
- Error logging (console errors in production)
- Performance metrics (Web Vitals)
- User feedback mechanism
- Version tracking for bug reports


## Spooky Design System

### Color Palette (CRITICAL FOR THEME)

```javascript
// Tailwind config colors
colors: {
  background: {
    primary: '#1a0f1f',    // Deep purple-black
    secondary: '#0a0a0f',  // Darker variant
    tertiary: '#242432',   // Lighter variant
  },
  blood: {
    red: '#8B0000',        // For negative transactions/zombie attacks
    dark: '#660000',       // Darker variant for shadows
  },
  toxic: {
    green: '#39FF14',      // For positive transactions/defense
    glow: '#2dd40c',       // Glow effect variant
  },
  decay: {
    gray: '#4a4a4a',       // Neutral elements
    light: '#6a6a6a',      // Lighter variant
  },
  warning: {
    orange: '#FF6B35',     // Alerts, low balance
  },
  ghost: {
    white: '#f8f8ff',      // Text, highlights
    dim: '#d8d8df',        // Dimmed text
  },
}
```

### Typography

```javascript
// Tailwind config fonts
fontFamily: {
  sans: ['Inter', 'sans-serif'],           // Primary font for all text
  mono: ['Fira Code', 'monospace'],        // Numbers and code
}
```

### Animation Principles

1. **Zombie Movement**: Shambling, lurching motion with slight randomness (game canvas only)
2. **UI Transitions**: 200ms duration, ease-in-out timing
3. **Particle Effects**: Simple effects for zombie destruction and blockade healing (game canvas only)
4. **Smooth Scrolling**: For transaction feed during playback
5. **60fps Target**: All animations must maintain smooth performance

### Custom Animations

```css
@keyframes shamble {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-2px) rotate(-1deg); }
  75% { transform: translateX(2px) rotate(1deg); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Component Patterns

- **Cards**: Subtle shadows for depth, clean borders
- **Buttons**: Smooth hover states with slight color shifts
- **Loading States**: Simple spinner
- **Error States**: Clear, professional error messages
- **Success States**: Subtle success indicators
- **Input Fields**: Dark backgrounds with clean styling

## Isometric Rendering Specifications

### Sprite Details

```typescript
const SPRITE_CONFIG = {
  width: 128,              // pixels
  height: 256,             // pixels
  pixelsPerUnit: 128,
  pivot: {
    x: 0.5,                // Center horizontally
    y: 0.19               // Near bottom for ground contact
  },
  format: 'PNG',           // With alpha channel
  projection: 30,          // 30-degree angle
};
```

### Isometric Grid System

```typescript
// Convert screen coordinates to isometric
function screenToIso(x: number, y: number) {
  return {
    x: (x - y) * Math.cos(Math.PI / 6),
    y: (x + y) * Math.sin(Math.PI / 6)
  };
}

// Convert isometric to screen coordinates
function isoToScreen(x: number, y: number) {
  return {
    x: (x / Math.cos(Math.PI / 6) + y / Math.sin(Math.PI / 6)) / 2,
    y: (y / Math.sin(Math.PI / 6) - x / Math.cos(Math.PI / 6)) / 2
  };
}
```

### Z-Index Layering

```typescript
// Calculate z-index for proper depth perception
function calculateZIndex(x: number, y: number, z: number): number {
  return Math.floor(x + y + z * 1000);
}
```

### Asset Organization

```
/public/assets/
  /sprites/
    /zombies/
      - zombie-food.png           (128x256)
      - zombie-entertainment.png  (128x256)
      - zombie-shopping.png       (128x256)
      - zombie-subscriptions.png  (128x256)
    /base/
      - home-base.png             (256x256)
    /blockades/
      - blockade-food.png         (128x128)
      - blockade-entertainment.png
      - blockade-shopping.png
      - blockade-subscriptions.png
  /particles/
    - particle-damage.png
    - particle-heal.png
```

## Playback Engine Architecture

### Timeline Generation

```typescript
interface PlaybackTimeline {
  totalDuration: number;        // 30-45 seconds
  events: PlaybackEvent[];
  fps: 60;
}

interface PlaybackEvent {
  timestamp: number;            // Milliseconds into playback
  type: 'spawn' | 'attack' | 'heal' | 'destroy';
  transactionId: string;
  zombieId?: string;
  blockadeId?: string;
  position: { x: number; y: number; z: number };
}

// Generate timeline from transactions
function generatePlaybackTimeline(transactions: Transaction[]): PlaybackTimeline {
  const sorted = transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
  const totalDuration = 35000; // 35 seconds
  const events: PlaybackEvent[] = [];
  
  sorted.forEach((tx, index) => {
    const timestamp = (index / sorted.length) * totalDuration;
    events.push({
      timestamp,
      type: tx.isGoodSpending ? 'heal' : 'spawn',
      transactionId: tx.id,
      position: calculateSpawnPosition(tx.category)
    });
  });
  
  return { totalDuration, events, fps: 60 };
}
```

### Animation Synchronization

```typescript
class PlaybackEngine {
  private currentTime: number = 0;
  private isPlaying: boolean = false;
  private speed: number = 1.0;
  private timeline: PlaybackTimeline;
  
  update(deltaTime: number) {
    if (!this.isPlaying) return;
    
    this.currentTime += deltaTime * this.speed;
    
    // Process events at current timestamp
    const events = this.timeline.events.filter(e => 
      e.timestamp <= this.currentTime && 
      e.timestamp > this.currentTime - deltaTime
    );
    
    events.forEach(event => this.processEvent(event));
    
    // Update charts
    this.updateCharts(this.currentTime);
    
    // Update transaction feed
    this.updateTransactionFeed(this.currentTime);
  }
  
  private processEvent(event: PlaybackEvent) {
    switch (event.type) {
      case 'spawn':
        this.spawnZombie(event);
        break;
      case 'heal':
        this.healBlockade(event);
        break;
      // ... other event types
    }
  }
}
```

## Performance Optimization Strategy

### Object Pooling for Zombies

```typescript
class ZombiePool {
  private pool: Zombie[] = [];
  private active: Zombie[] = [];
  
  acquire(): Zombie {
    return this.pool.pop() || this.createZombie();
  }
  
  release(zombie: Zombie) {
    zombie.state = 'defeated';
    this.pool.push(zombie);
    this.active = this.active.filter(z => z.id !== zombie.id);
  }
}
```

### Sprite Batching

```typescript
// Batch render all zombies in single draw call
function renderZombies(ctx: CanvasRenderingContext2D, zombies: Zombie[]) {
  // Sort by z-index for proper layering
  const sorted = zombies.sort((a, b) => 
    calculateZIndex(a.position.x, a.position.y, a.position.z) -
    calculateZIndex(b.position.x, b.position.y, b.position.z)
  );
  
  sorted.forEach(zombie => {
    const sprite = getSpriteForZombie(zombie);
    ctx.drawImage(sprite, zombie.position.x, zombie.position.y);
  });
}
```

### Culling Off-Screen Objects

```typescript
function cullOffScreen(zombies: Zombie[], viewport: Viewport): Zombie[] {
  return zombies.filter(zombie => 
    zombie.position.x >= viewport.left &&
    zombie.position.x <= viewport.right &&
    zombie.position.y >= viewport.top &&
    zombie.position.y <= viewport.bottom
  );
}
```

## Landing Page Design

### Hero Section

- Clean, full-width hero with dark background
- Application title and tagline
- Clear call-to-action button
- Brief description of the zombie budget concept

### Feature Showcase

- Simple feature cards with icons
- Screenshot or GIF of the game playback
- Brief descriptions of key features
- "Try Demo" button to load sample data

## Mobile Optimization

### Responsive Breakpoints

```javascript
// Tailwind config
screens: {
  'mobile': '320px',
  'tablet': '768px',
  'desktop': '1024px',
  'wide': '1440px',
}
```

### Mobile-Specific Adjustments

- Reduce particle effects (performance)
- Simplify zombie sprites (lower resolution)
- Stack layout vertically
- Larger touch targets (44px minimum)
- Simplified playback controls
- Bottom navigation for thumb access

### Performance Targets

- Mobile: 30fps minimum (60fps ideal)
- Desktop: 60fps consistent
- Initial load: < 3 seconds
- Playback start: < 500ms
- Chart updates: < 100ms

## Deployment Configuration

### Vercel/Netlify Setup

```json
{
  "build": {
    "command": "npm run build",
    "publish": "dist"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

### Environment Variables

```
VITE_APP_VERSION=1.0.0
VITE_DEMO_MODE=true
VITE_PLAID_MOCK=true
```

## Testing Strategy for Hackathon

### Priority Testing

1. **Playback Animation** (CRITICAL)
   - 60fps performance
   - Synchronization accuracy
   - Visual polish

2. **Responsive Design** (CRITICAL)
   - Mobile, tablet, desktop
   - Touch interactions

3. **Spooky Theme** (CRITICAL)
   - Color consistency
   - Animation quality
   - Visual effects

4. **Core Features** (IMPORTANT)
   - Transaction CRUD
   - Budget configuration
   - Demo mode

### Manual Testing Checklist

- [ ] Playback runs smoothly on mobile
- [ ] All zombies render correctly
- [ ] Charts update in real-time
- [ ] Landing page is captivating
- [ ] Theme is consistent throughout
- [ ] No console errors
- [ ] localStorage works across browsers
- [ ] Demo mode tells compelling story
