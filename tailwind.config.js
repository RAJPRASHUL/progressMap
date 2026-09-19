/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          // Core backgrounds
          bg: '#0a0d14',
          surface: '#121722',
          card: '#151b28',
          cardBorder: '#1e2638',
          inputBg: '#0C111A',
          borderLight: 'rgba(255, 255, 255, 0.08)',

          // Accent colors
          purple: '#6d5dfc',
          purpleGlow: '#8068ff',
          cyan: '#00e5ff',
          emerald: '#10b981',
          neonGreen: '#22c55e',

          // Auth page indigo palette (design-reference/3)
          indigo: '#6366F1',
          indigoDark: '#585CE5',
          indigoDeep: '#4F46E5',
          indigoLight: '#EEF2FF',
          indigoBg: '#EEF1F6',
          gold: '#F5B744',
          goldHover: '#E5A633',

          // Muted & text
          muted: '#7E8B9B',
          darkBg: '#090D14',

          // Danger
          danger: '#EF4444',
          dangerBg: '#2A141A',
          dangerBorder: 'rgba(239, 68, 68, 0.25)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
