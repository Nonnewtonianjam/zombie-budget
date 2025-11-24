/**
 * Landing Page Component
 * 
 * Professional Halloween-themed landing page with hero section.
 * Auto-loads demo data for immediate playback experience.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useDemoMode } from '../../hooks/useDemoMode';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Play, TrendingUp, Shield, Zap, Ghost, Moon, Skull } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { activateDemoMode } = useDemoMode();
  const [hasLoaded, setHasLoaded] = useLocalStorage('demoDataLoaded', false);
  const [, setHasVisitedBefore] = useLocalStorage('hasVisitedBefore', false);

  // Auto-activate demo mode on first visit (only once)
  useEffect(() => {
    if (!hasLoaded) {
      activateDemoMode();
      setHasLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleViewDemo = () => {
    setHasVisitedBefore(true);
    navigate('/playback');
  };

  const handleGetStarted = () => {
    setHasVisitedBefore(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen text-neutral-100">
      {/* Spooky decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <Ghost className="absolute top-20 left-10 w-12 h-12 text-brand-purple opacity-20 animate-float" />
        <Moon className="absolute top-40 right-20 w-16 h-16 text-brand-purple-light opacity-30" />
        <Skull className="absolute bottom-40 left-20 w-10 h-10 text-brand-purple opacity-15 animate-pulse-subtle" />
        <Ghost className="absolute bottom-20 right-40 w-14 h-14 text-brand-purple-light opacity-20 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center">
            {/* Zombie emoji with glow effect */}
            <div className="relative inline-block mb-8">
              <div className="text-8xl md:text-9xl animate-float">
                🧟
              </div>
              <div className="absolute inset-0 blur-3xl bg-brand-purple opacity-30 animate-pulse-subtle" />
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight bg-gradient-to-r from-brand-purple-light via-brand-purple to-brand-purple-dark bg-clip-text text-transparent">
              Night Of The Living Debt
            </h1>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl text-neutral-300 mb-6 font-light">
              Watch Your Spending Come Alive
            </p>

            {/* Description */}
            <div className="max-w-3xl mx-auto mb-12 space-y-4">
              <p className="text-lg md:text-xl text-neutral-400 leading-relaxed">
                Transform budget tracking into an unforgettable cinematic experience. 
                Watch your monthly spending come alive in a <span className="text-brand-purple-light font-semibold">30-45 second animated playback</span> where every transaction tells a story.
              </p>
              <p className="text-base md:text-lg text-neutral-400 leading-relaxed">
                Overspending spawns zombies. Good spending heals your defenses. 
                See your financial patterns visualized in real-time with professional charts 
                and a haunting isometric game view.
              </p>
            </div>

            {/* Call-to-action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                variant="primary"
                size="large"
                onClick={handleViewDemo}
                className="w-full sm:w-auto bg-brand-purple hover:bg-brand-purple-dark text-white font-bold text-lg px-10 py-5 rounded-xl shadow-2xl shadow-brand-purple-glow transition-all duration-200 hover:scale-105 hover:shadow-brand-purple/50 flex items-center gap-3"
              >
                <Play className="w-6 h-6" />
                Watch Demo Playback
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-background-card hover:bg-background-tertiary text-neutral-100 font-semibold text-lg px-10 py-5 rounded-xl border border-brand-purple/30 transition-all duration-200 hover:scale-105 hover:border-brand-purple/60"
              >
                Explore Dashboard
              </Button>
            </div>

            {/* Demo data notice */}
            <p className="text-sm text-neutral-500">
              Demo data pre-loaded • No signup required • Experience it instantly
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section heading */}
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-brand-purple-light to-brand-purple bg-clip-text text-transparent">
              Hauntingly Powerful Features
            </h2>
            <p className="text-center text-neutral-400 mb-12 text-lg">
              Professional finance tracking meets spooky storytelling
            </p>

            {/* Feature cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cinematic Playback */}
              <div className="bg-background-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-brand-purple/20 hover:border-brand-purple/40 group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purple-dark flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-100 text-center mb-3">
                  Cinematic Playback
                </h3>
                <p className="text-neutral-400 text-center text-sm leading-relaxed">
                  30-45 second animated replay with synchronized zombie attacks and real-time chart updates
                </p>
              </div>

              {/* Real-Time Analytics */}
              <div className="bg-background-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-brand-purple/20 hover:border-brand-purple/40 group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-green to-accent-green-dark flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-100 text-center mb-3">
                  Real-Time Analytics
                </h3>
                <p className="text-neutral-400 text-center text-sm leading-relaxed">
                  Professional charts and insights that update live to reveal your spending patterns
                </p>
              </div>

              {/* Budget Defense */}
              <div className="bg-background-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-brand-purple/20 hover:border-brand-purple/40 group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-100 text-center mb-3">
                  Budget Defense
                </h3>
                <p className="text-neutral-400 text-center text-sm leading-relaxed">
                  Set budget limits and watch blockades protect your financial fortress from zombie attacks
                </p>
              </div>

              {/* Instant Feedback */}
              <div className="bg-background-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-brand-purple/20 hover:border-brand-purple/40 group">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-brand-purple flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-100 text-center mb-3">
                  Instant Feedback
                </h3>
                <p className="text-neutral-400 text-center text-sm leading-relaxed">
                  Add transactions and see zombies spawn or blockades heal with smooth 60fps animations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-100">
              Ready to See Your Spending Come Alive?
            </h2>
            <p className="text-lg text-neutral-400 mb-8">
              Demo data is already loaded. Jump straight into the experience.
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={handleViewDemo}
              className="bg-brand-purple hover:bg-brand-purple-dark text-white font-bold text-xl px-12 py-6 rounded-xl shadow-2xl shadow-brand-purple-glow transition-all duration-200 hover:scale-105 hover:shadow-brand-purple/50 flex items-center gap-3 mx-auto"
            >
              <Play className="w-7 h-7" />
              Watch Demo Playback Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
