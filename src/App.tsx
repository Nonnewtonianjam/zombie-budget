/**
 * App Component
 * 
 * Main application component for Night Of The Living Debt.
 * Provides routing, transaction management, game visualization, and demo mode.
 * 
 * Performance optimizations:
 * - Lazy load heavy components (PlaybackView, GameView, InsightsDashboard)
 * - Landing page loads immediately with minimal bundle
 * - Code splitting by route
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './features/landing/LandingPage';

// Lazy load heavy components to reduce initial bundle size
const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const PlaybackView = lazy(() => import('./features/playback/PlaybackView').then(m => ({ default: m.PlaybackView })));
const InsightsPage = lazy(() => import('./features/insights/InsightsPage').then(m => ({ default: m.InsightsPage })));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🧟</div>
        <p className="text-neutral-400">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Protected route wrapper - removed protection since demo auto-loads
 * All routes are now accessible immediately
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Landing page - shown to first-time visitors */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Dashboard - main app view with transactions and game */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Playback - cinematic monthly replay */}
          <Route 
            path="/playback" 
            element={
              <ProtectedRoute>
                <PlaybackView />
              </ProtectedRoute>
            } 
          />
          
          {/* Insights - detailed analytics and recommendations */}
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute>
                <InsightsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect any unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
