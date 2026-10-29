/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: Object.fromEntries(
        ['canvas', 'panel', 'raised', 'line', 'ink', 'muted', 'accent', 'paper', 'danger']
          .map((name) => [name, `rgb(var(--${name}) / <alpha-value>)`]),
      ),
      fontFamily: {
        sans: ['Segoe UI', 'Arial', 'sans-serif'],
        editorial: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
