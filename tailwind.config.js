/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        card: '#111111',
        elevated: '#171717',
        line: '#262626',
        muted: '#a1a1a1',
        neon: '#00ff9d',
        cyan: '#22d3ee',
      },
    },
  },
  plugins: [],
};
