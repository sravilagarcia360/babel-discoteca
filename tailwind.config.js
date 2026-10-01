/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        slate: {
          50: '#f0f2f4',
          100: '#e2e6e9',
          200: '#c8ccd0',
          300: '#AFB3B7',
          400: '#69818D',
          500: '#5A636A',
          600: '#465660',
          700: '#2D4A53',
          800: '#132E35',
          900: '#0D1F23',
          950: '#081417',
        }
      }
    },
  },
  plugins: [],
}