/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0B1120',
        surface: '#111827',
        card: '#1A2538',
        border: '#1E3050',
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: '#F1F5F9',
        muted: '#64748B',
        secondary: '#94A3B8',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
}
