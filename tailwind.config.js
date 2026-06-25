/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#034289',
        'primary-blue-dark': '#022a5c',
        'primary-blue-light': '#0459b7',
        'accent-green': '#4F8751',
        'accent-green-dark': '#3d6a3f',
        'accent-green-light': '#6ba96d',
        'light-sage': '#D2E1D9',
        // Brand tokens
        primary: '#034289',
        secondary: '#4F8751',
        border: '#D2E1D9',
        // Dark theme
        bgDark: '#0a1628',
        bgDarkCard: '#0f172a',
        bgDarkElevated: '#0d1f3c',
        textDark: '#f1f5f9',
        textDarkMuted: '#94a3b8',
        borderDark: 'rgba(255,255,255,0.06)',
        // Semantic
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#38bdf8',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
        xl: '0 16px 48px rgba(0,0,0,0.16)',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        float: 'float 3s ease-in-out infinite',
        'pulse-gentle': 'pulse 2s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        gradient: 'gradientShift 4s ease infinite',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
