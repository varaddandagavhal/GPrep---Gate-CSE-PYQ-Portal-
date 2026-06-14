/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          50: '#F5EDE3',
          100: '#EDE0D1',
          200: '#E0CEB8',
          300: '#D4B89A',
          400: '#C87A5A',
          500: '#B86A4A',
          600: '#A05A3E',
          700: '#8B6F5E',
          800: '#6B5547',
          900: '#4A3728',
        },
        primary: '#C87A5A',
        secondary: '#8FAB7A',
        accent: '#E8B86D',
        success: '#16a34a',
        warning: '#ea580c',
        danger: '#dc2626',
      },
      borderRadius: {
        'clay': '1.25rem',
        'clay-lg': '1.75rem',
        'clay-xl': '2rem',
      },
    },
  },
  plugins: [],
};
