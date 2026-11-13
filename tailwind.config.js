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
        forest: {
          50: '#F0F7F4',
          100: '#D8ECE2',
          200: '#B3DBC7',
          300: '#84C4A5',
          400: '#54A782',
          500: '#2E8B61',
          600: '#22724E',
          700: '#1B5B3E',
          800: '#164831',
          900: '#123B28',
          950: '#0B2418',
        },
        brand: {
          dark: '#143D2B',
          darker: '#0E2E20',
          accent: '#26734D',
          hover: '#1B4D36',
          mint: '#EBF7EE',
          mintText: '#156B42',
          amberBg: '#FEF7EC',
          amberBorder: '#F9DFB8',
          amberText: '#92400E',
          surface: '#F4F7F5',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card': '0 2px 6px -1px rgba(0, 0, 0, 0.04), 0 1px 4px -1px rgba(0, 0, 0, 0.02)',
        'drawer': '-4px 0 24px -2px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
};

