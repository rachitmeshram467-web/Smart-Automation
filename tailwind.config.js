/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#3ecf8e', // Supabase & SmartAuto iconic mint
          600: '#10b981',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        dark: {
          bg: '#080b0f',
          surface: '#0e131b',
          card: '#131924',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: '#1a2232',
        }
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px rgba(62, 207, 142, 0.25)',
        'glow-cyan': '0 0 25px rgba(56, 189, 248, 0.25)',
      }
    },
  },
  plugins: [],
}
