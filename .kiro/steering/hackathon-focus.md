---
inclusion: always
---

# Hackathon Judging Focus

## Critical Principle
**Judges will spend 5-10 minutes with your app. Build ONLY what they will see.**

## What Judges Will Experience

### 1. Landing Page (30 seconds)
- Clean, professional first impression
- Clear value proposition
- Obvious call-to-action
- **Build**: Landing page with hero section and demo button

### 2. Demo Mode Playback (2-3 minutes)
- The centerpiece feature - 30-45 second zombie animation
- Real-time charts updating
- Transaction feed scrolling
- Smooth 60fps performance
- **Build**: Polished playback experience with demo data

### 3. Quick Feature Tour (2-3 minutes)
- Add a transaction manually
- See zombie spawn immediately
- View budget configuration
- Check insights dashboard
- **Build**: Core CRUD features that work reliably

### 4. Mobile Responsiveness Check (1 minute)
- Judges may resize browser or check on phone
- **Build**: Responsive layouts that don't break

## What Judges Will NOT See

❌ **Component Demos** - Judges won't browse your `/demo` routes
❌ **Documentation Files** - Judges won't read markdown docs
❌ **Test Files** - Judges won't run your test suite
❌ **Storybook/Style Guides** - Judges won't explore component libraries
❌ **Developer Tools** - Judges won't open dev console
❌ **Edge Cases** - Judges won't try to break your app
❌ **Code Quality** - Judges won't review your source code (unless specifically asked)

## Demo File Policy

### ❌ DO NOT Create Demos For:
- Individual UI components (Button, Card, Input, etc.)
- Utility functions
- Helper components
- Internal game logic
- Animation systems
- Calculation functions
- Type definitions
- Constants

### ✅ ONLY Create Demos If:
- Explicitly requested by user for development/debugging
- Testing a complex integration that's hard to verify in main app
- Prototyping a feature before integrating into main flow

### Exception:
If you're building a component and need to verify it works, test it by integrating it into the actual app flow, not by creating a separate demo page.

## Development Priority

### Tier 1: Critical (Must Be Perfect)
1. **Playback animation** - This is your demo star
2. **Landing page** - First impression matters
3. **Demo mode** - Judges will use this
4. **Mobile responsive** - Judges will check this

### Tier 2: Important (Must Work)
1. **Transaction CRUD** - Core functionality
2. **Budget configuration** - Shows it's a real finance app
3. **Insights dashboard** - Shows data analysis
4. **Spooky theme consistency** - Visual polish

### Tier 3: Nice-to-Have (If Time Permits)
1. **Sound effects** - Adds polish but not essential
2. **Advanced animations** - Cool but not required
3. **Easter eggs** - Fun but judges won't find them

### Tier 4: Don't Build (Waste of Time)
1. **Component demos** - Judges won't see them
2. **Extensive documentation** - Judges won't read it
3. **Comprehensive test suites** - Judges won't run them
4. **Developer tools** - Judges won't use them
5. **Admin panels** - Not part of user experience
6. **Multiple themes** - Stick to one polished theme

## Testing Policy for Hackathon

### ❌ DO NOT Create Tests For:
- Individual utility functions
- Helper functions
- Type definitions
- Simple components
- Internal game logic
- Animation systems
- Every new feature or module

### ✅ ONLY Create Tests If:
- Explicitly requested by user
- Critical business logic that's complex and error-prone
- Integration points that are hard to verify manually
- Bug fixes that need regression prevention

### Testing Philosophy:
- **Manual testing in the actual app is faster and more valuable**
- Test by using the feature in the demo, not by writing test files
- Judges won't see your test coverage
- Time spent writing tests = time NOT spent polishing the demo
- If it works in the demo, it's good enough

**Exception:** If you're debugging a complex issue and a test would help isolate the problem, create a minimal test. Delete it after fixing the issue.

## Time Allocation

For a 10-day hackathon:
- **60%** - Playback animation and game visualization
- **15%** - Landing page and demo mode
- **15%** - Core features (transactions, budget, insights)
- **10%** - Polish, responsive design, bug fixes

## Code Quality vs. Feature Polish

Judges care about:
- ✅ Does it work smoothly?
- ✅ Does it look professional?
- ✅ Is the concept creative?
- ✅ Is the execution polished?

Judges don't care about:
- ❌ Is the code well-tested?
- ❌ Is the code well-documented?
- ❌ Is the code modular?
- ❌ Are there component demos?

**Build for the demo, not for production.**

## The 5-Minute Demo Script

Imagine you're showing the app to a judge. What would you show?

1. **Landing page** (30s) - "This is Zombie Budget, a spooky finance app"
2. **Click demo button** (5s) - "Let me show you with sample data"
3. **Start playback** (45s) - "Watch your spending come alive as zombies"
4. **Point out features** (30s) - "Charts update in real-time, transactions scroll"
5. **Add transaction** (30s) - "You can add expenses manually"
6. **Show zombie spawn** (15s) - "Bad spending spawns zombies immediately"
7. **Show insights** (30s) - "Get actionable recommendations"
8. **Show mobile** (30s) - "Fully responsive on mobile"
9. **Wrap up** (30s) - "Built with Kiro in 10 days"

**Total: 4 minutes 30 seconds**

Everything else is invisible to judges.

## When Building a Feature

Ask yourself:
1. **Will judges see this in 5-10 minutes?**
   - Yes → Build it and polish it
   - No → Skip it or deprioritize

2. **Does this enhance the demo experience?**
   - Yes → Prioritize it
   - No → Defer or skip

3. **Is this a demo component or documentation?**
   - Yes → Don't build it unless explicitly needed for development
   - No → Proceed

## Demo Component Red Flags

If you find yourself creating:
- `Button.demo.tsx`
- `Card.demo.tsx`
- `Input.demo.tsx`
- `ProgressBar.demo.tsx`
- `ZombieSprite.demo.tsx`
- `Blockade.demo.tsx`

**STOP.** These won't be seen by judges. Test components by integrating them into the actual app.

## Documentation Red Flags

If you find yourself creating:
- `COMPONENT_COMPLETE.md`
- `FEATURE_IMPLEMENTATION.md`
- `VISUAL_STATES_REFERENCE.md`
- `TECHNICAL_DETAILS.md`

**STOP.** Judges won't read these. Focus on building the app, not documenting it.

## The Hackathon Mindset

**Production App Mindset** (Wrong for hackathons):
- Comprehensive test coverage
- Extensive documentation
- Component libraries with demos
- Multiple environments
- Scalable architecture
- Edge case handling

**Hackathon Mindset** (Correct):
- Does it work in the demo?
- Does it look good?
- Is it creative?
- Can I show it in 5 minutes?
- Will judges be impressed?

## Remember

You're building a **demo**, not a **product**.
You're impressing **judges**, not **developers**.
You have **10 days**, not **10 months**.

**Focus ruthlessly on what judges will see in 5-10 minutes.**
