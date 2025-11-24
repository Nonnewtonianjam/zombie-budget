/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0f0a1f',
          secondary: '#1a1230',
          tertiary: '#251d3a',
          card: '#2a2040',
        },
        brand: {
          purple: '#8b5cf6',
          'purple-light': '#a78bfa',
          'purple-dark': '#7c3aed',
          'purple-glow': 'rgba(139, 92, 246, 0.3)',
        },
        accent: {
          green: '#10b981',
          'green-dark': '#059669',
          red: '#ef4444',
          'red-dark': '#dc2626',
          orange: '#f59e0b',
          blue: '#3b82f6',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      screens: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1440px',
      },
      minHeight: {
        'touch': '44px', // Minimum touch target for mobile accessibility
      },
      minWidth: {
        'touch': '44px', // Minimum touch target for mobile accessibility
      },
      animation: {
        shamble: 'shamble 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'blood-drip': 'blood-drip 3s ease-in infinite',
        'fog-drift': 'fog-drift 10s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shamble: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(-2px) rotate(-1deg)' },
          '75%': { transform: 'translateX(2px) rotate(1deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 5px currentColor)' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 10px currentColor)' },
        },
        'blood-drip': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0' },
        },
        'fog-drift': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(20px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(74, 157, 95, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(74, 157, 95, 0.6)',
          },
        },
        'slide-up': {
          '0%': { 
            transform: 'translateY(10px)',
            opacity: '0',
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
