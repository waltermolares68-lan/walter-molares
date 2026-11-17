/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bce4ff',
          300: '#8ed3ff',
          400: '#59baff',
          500: '#319df8',
          600: '#1c7ede',
          700: '#1864b4',
          800: '#19558f',
          900: '#1a4876',
        },
      },
    },
  },
  plugins: [],
}
