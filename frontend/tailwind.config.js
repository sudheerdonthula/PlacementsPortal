/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NIT Warangal Custom Palette
        'nit-red': '#BF0A2B',
        'nit-purple': '#948EBF',
        'nit-mint': '#E9F2EF',
        'nit-green': '#9CD9B6',
        'nit-pink': '#F2BBBB',
        'nit-dark-purple': '#595573',
        'nit-navy': '#57568C',
        'nit-light-gray': '#F2F2F2',
        'nit-lavender': '#7472A6',
        // Gold variations
        'nit-gold': '#FFD700',
        'nit-gold-light': '#FFF8DC',
        'nit-gold-dark': '#B8860B',
        'nit-amber': '#FFBF00',
      },
    },
  },
  plugins: [],
}
