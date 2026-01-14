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
          50: '#f7f2fa',
          100: '#efe6f5',
          200: '#dfcdea',
          300: '#c6a7d9',
          400: '#a676c2',
          500: '#8a4ea8',
          600: '#713a8c',
          700: '#590b77',
          800: '#4b0d61',
          900: '#3f0f4f',
          950: '#330b40',
        },
      },
    },
  },
}


// #590B77