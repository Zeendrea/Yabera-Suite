/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf7f2',
          100: '#f3ebe0',
          200: '#e6d5c0',
          300: '#d4b896',
          400: '#c49a6c',
          500: '#b07d4a',
        },
        ink: {
          700: '#3f3429',
          800: '#2c241c',
          900: '#1c1612',
        },
        sage: {
          500: '#6b8f71',
          600: '#54785b',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 12px 40px rgba(28, 22, 18, 0.08)',
      },
    },
  },
  plugins: [],
}
