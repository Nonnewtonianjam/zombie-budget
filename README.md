# 🧟 Night Of The Living Debt

A spooky, Halloween-themed personal finance application that transforms budget tracking into an isometric tower defense game. Watch your spending habits come to life as zombies attack your financial defenses!

## 🎮 Features

- **Isometric Game Visualization**: 30-degree projection with 128px per unit scale
- **Zombie Spawning**: Overspending transactions spawn zombies that attack budget blockades
- **Real-time Playback**: 30-45 second cinematic playback of monthly transactions
- **Budget Defense**: Four blockades representing spending categories (Food, Entertainment, Shopping, Subscriptions)
- **Professional Fintech UI**: Clean, dark-themed interface with spooky accents
- **Smooth 60fps Animation**: Optimized rendering for fluid gameplay
- **Responsive Design**: Mobile-first with 44px minimum touch targets

## 🛠️ Tech Stack

- **React 18.2+** with TypeScript 5.0+ (strict mode)
- **Vite 5.0+** for fast development and optimized builds
- **Tailwind CSS 3.4+** with custom spooky theme
- **Canvas API** for isometric game rendering
- **localStorage** for data persistence (no backend required)

## 🎮 Core Features

### Transaction Management
- Add, edit, and delete transactions with category assignment
- Real-time budget tracking across four categories
- Demo mode with pre-populated sample data
- localStorage persistence (no backend required)

### Playback Visualization
- 30-45 second cinematic playback of monthly spending
- Zombies spawn from overspending transactions
- Real-time chart updates during playback
- Transaction feed with scrolling history
- Completion summary with budget analysis

### Budget Configuration
- Set monthly budgets for each category
- Visual budget vs. actual spending comparison
- Category-specific blockades with health bars
- Automatic zombie spawning on overspending

### Insights Dashboard
- Spending trends analysis
- Category breakdown charts
- Actionable recommendations
- Highest overspending alerts

## 🎨 Design System

### Color Palette
- **Background**: Deep purple-black (#1a0f1f) with darker variants
- **Blood Red**: #a83232 for negative transactions and zombie attacks
- **Toxic Green**: #4a9d5f for positive transactions and defenses
- **Decay Gray**: #4a4a4a for neutral elements
- **Warning Orange**: #d97548 for alerts and low balance
- **Ghost White**: #e8e8f0 for text and highlights

### Typography
- **Sans**: Inter for all UI text
- **Mono**: Fira Code for numbers and code

### Animation Principles
- **UI Transitions**: 200ms duration with ease-in-out timing
- **Game Loop**: 60fps using requestAnimationFrame
- **Sprite Animation**: Frame-based cycling (15 frames per animation)
- **Hover States**: Smooth color shifts with subtle scale effects (1.02x)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

This project is configured for easy deployment to:

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect Vite and deploy
4. Configuration is already set in `vercel.json`

### Netlify
1. Push your code to GitHub
2. Import the repository in Netlify
3. Build settings are configured in `netlify.toml`
4. Build command: `npm run build`
5. Publish directory: `dist`

Both platforms offer free hosting with automatic deployments on push.

## 📱 Responsive Design

- **Mobile**: 320px minimum width with optimized touch targets
- **Tablet**: 768px breakpoint with adjusted layouts
- **Desktop**: 1024px+ with full feature set
- **Touch Targets**: 44px minimum for mobile accessibility

## ♿ Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Visible focus indicators (2px toxic green ring)
- Semantic HTML elements
- ARIA labels where needed

## 🎯 Performance Targets

- **60fps** game rendering on desktop
- **30fps minimum** on mobile devices
- **< 200KB** initial bundle size (gzipped)
- **< 3 seconds** initial page load
- **Optimized rendering** with viewport culling and object pooling

## 📄 License

MIT License - Built for the Kiroween Hackathon

## 🧪 Development

### Project Structure

```
src/
├── assets/           # Sprite sheets and static assets
├── components/       # React components
│   ├── game/        # Game visualization components
│   ├── layout/      # Layout components (future)
│   └── ui/          # Reusable UI components
├── constants/       # Game constants and configuration
├── features/        # Feature modules (future)
├── hooks/           # Custom React hooks (future)
├── lib/             # Utility functions and game logic
├── types/           # TypeScript type definitions
├── App.tsx          # Root application component
└── main.tsx         # Application entry point
```

### Key Files

- **`src/lib/isometric.ts`** - Core isometric coordinate system
- **`src/lib/sprites.ts`** - Sprite loading and management
- **`src/lib/zombieSpawning.ts`** - Zombie generation logic
- **`src/components/game/GameCanvas.tsx`** - Main game renderer
- **`src/constants/game.ts`** - Game configuration constants

### Built With Kiro

This project was built using Kiro AI IDE during the Kiroween Hackathon 2024.
