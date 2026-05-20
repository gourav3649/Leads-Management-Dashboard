import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        slate: {
          ...colors.slate,
          950: '#030305', // Ultra dark obsidian background
          900: '#07070a', // Extremely deep card background
          850: '#0f0f12', // Custom intermediate dark
          800: '#17171c', // Subtle dark border/background
        }
      },
    },
  },
  plugins: [],
} satisfies Config

