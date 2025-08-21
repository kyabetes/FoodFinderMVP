import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#ffd1dc',
          purple: '#d9c9ff',
          blue: '#cde8ff',
          green: '#d1ffd6',
          yellow: '#fff3c4',
        },
      },
      boxShadow: {
        soft: '0 10px 25px -15px rgba(0,0,0,0.2)'
      },
      borderRadius: {
        pill: '999px'
      },
    },
  },
  plugins: [],
} satisfies Config
