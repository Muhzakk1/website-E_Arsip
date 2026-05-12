/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F7FD',
          100: '#E0EFFB',
          200: '#BBE0F6',
          300: '#8BCBF0',
          400: '#53AEE7',
          500: '#297BBF',
          600: '#22639E',
          700: '#1C5082',
          800: '#17426A',
          900: '#143859',
          950: '#0E243B',
        },
        sidebar: { DEFAULT: '#1e293b', hover: '#334155', active: '#475569' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 24px rgba(41, 123, 191, 0.08)',
        'modal': '0 20px 40px rgba(0, 0, 0, 0.1)',
        'login': '0 24px 48px rgba(41, 123, 191, 0.12)',
      }
    },
  },
  plugins: [],
};
