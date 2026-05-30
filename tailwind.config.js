/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        bg: '#0f0f11',
        surface: '#17171a',
        surface2: '#1e1e22',
        border: '#2a2a30',
        border2: '#38383f',
        accent: '#c8f564',
        accent2: '#a8d94a',
        muted: '#6b6b78',
        muted2: '#48484f',
      },
    },
  },
  plugins: [],
}
