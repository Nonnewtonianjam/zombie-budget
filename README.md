# 🧟 Night Of The Living Debt

A spooky, Halloween-themed personal finance application that transforms budget tracking into a fight for your life! Watch your spending habits come to life as zombies attack your financial defenses!

## 🎮 Features

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
