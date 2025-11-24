# Requirements Document

## Introduction

This spec addresses critical UX issues that prevent judges from experiencing the app's core value proposition. The current implementation has three major problems: (1) intrusive red/green color usage that looks unprofessional, (2) messy black/grey/purple color scheme that lacks cohesion, and (3) demo mode requires manual data entry instead of being immediately usable. The app should look like a professional finance landing page (inspired by FNBC banking app) with subtle Halloween theming, and the demo should be pre-populated so judges can immediately access the playback feature.

## Glossary

- **System**: The Zombie Budget web application
- **Landing Page**: The first page users see when visiting the app
- **Demo Mode**: Pre-populated sample data mode for judges to experience the app
- **Playback Feature**: The 30-45 second cinematic animation showing monthly spending
- **Color Scheme**: The visual color palette used throughout the application
- **Professional Finance Aesthetic**: Clean, trustworthy design similar to banking apps
- **Halloween Theming**: Subtle spooky elements (zombies, purple accents) without overwhelming the professional look

## Requirements

### Requirement 1: Professional Color Scheme

**User Story:** As a judge evaluating the app, I want to see a professional, cohesive color scheme so that I trust this as a real finance application.

#### Acceptance Criteria

1. WHEN the System renders any page, THE System SHALL use a cohesive purple-based color scheme inspired by professional banking apps
2. THE System SHALL limit red color usage to critical alerts and error states only
3. THE System SHALL limit green color usage to success confirmations and positive metrics only
4. THE System SHALL use purple as the primary brand color with white/light gray for text and dark backgrounds
5. WHERE transaction displays are shown, THE System SHALL use neutral colors (white, gray) for transaction amounts instead of red/green

### Requirement 2: Professional Landing Page Design

**User Story:** As a first-time visitor, I want to see a professional landing page that looks like a real finance app so that I understand this is a serious product with playful elements.

#### Acceptance Criteria

1. WHEN a user visits the landing page, THE System SHALL display a clean, professional hero section with clear value proposition
2. THE System SHALL use the FNBC banking app aesthetic as design inspiration with purple branding
3. THE System SHALL include subtle Halloween elements (zombie emoji, purple moon, spooky silhouettes) without overwhelming the professional design
4. THE System SHALL display a prominent call-to-action button that immediately starts the demo experience
5. THE System SHALL use professional typography and spacing consistent with modern finance apps

### Requirement 3: Immediate Demo Access

**User Story:** As a judge with limited time, I want to immediately see the playback feature without entering data so that I can evaluate the core innovation quickly.

#### Acceptance Criteria

1. WHEN a user clicks "Try Demo" on the landing page, THE System SHALL immediately populate the app with sample transactions
2. WHEN demo mode is activated, THE System SHALL automatically navigate to a view where the playback feature is prominently accessible
3. THE System SHALL display a clear "Watch Playback" button immediately visible after demo activation
4. THE System SHALL NOT require any manual data entry before accessing the playback feature in demo mode
5. WHEN demo data is loaded, THE System SHALL include 20-30 realistic transactions spanning the current month

### Requirement 4: Streamlined Demo Flow

**User Story:** As a judge, I want a clear path from landing page to playback animation so that I can see the main feature within 30 seconds.

#### Acceptance Criteria

1. WHEN a user activates demo mode, THE System SHALL complete the activation within 2 seconds
2. WHEN demo mode is active, THE System SHALL display the dashboard with pre-populated data and a prominent playback button
3. THE System SHALL provide a single-click path from landing page to playback animation
4. THE System SHALL NOT show empty states or "add transaction" prompts in demo mode
5. WHEN the playback button is clicked, THE System SHALL immediately start the cinematic animation

### Requirement 5: Color Consistency Across Views

**User Story:** As a user navigating the app, I want consistent, professional colors throughout so that the experience feels cohesive.

#### Acceptance Criteria

1. THE System SHALL use the same purple-based color palette across all views (landing, dashboard, playback, insights)
2. THE System SHALL use consistent button styles with purple primary buttons and neutral secondary buttons
3. THE System SHALL use consistent card backgrounds with subtle shadows instead of bright colored borders
4. WHERE charts are displayed, THE System SHALL use purple gradients and neutral colors instead of red/green
5. THE System SHALL use white or light gray text on dark backgrounds for optimal readability
