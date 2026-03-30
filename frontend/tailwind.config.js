/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          light: '#3B82F6',
        },
        secondary: {
          DEFAULT: '#6366F1',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        bg: {
          light: '#F9FAFB',
          dark: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
