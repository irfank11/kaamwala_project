/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      boxShadow: {
        glow: '0 20px 50px -12px rgba(13, 148, 136, 0.45)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.12)',
      },
      keyframes: {
        'float-3d': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotateX(8deg) rotateY(-12deg)' },
          '50%': { transform: 'translate3d(0, -14px, 0) rotateX(4deg) rotateY(-6deg)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 16px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        'float-3d': 'float-3d 7s ease-in-out infinite',
        'spin-slow': 'spin-slow 28s linear infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
