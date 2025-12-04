/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Brand: Amber/Caramel for a warm, bookstore vibe
        brand: {
          DEFAULT: "#D97706", // amber-600
          light: "#F59E0B",   // amber-500
          dark: "#B45309",    // amber-700
          tint: "#FEF3C7",    // amber-100 (backgrounds)
        },
        // Gray: Using 'Stone' scale for warmer neutrals (paper-like)
        gray: {
          ...colors.stone,
          soft: "#FAFAF9", // stone-50
          100: "#F5F5F4",  // stone-100
          200: "#E7E5E4",
          300: "#D6D3D1",
          500: "#78716C",
          700: "#44403C",
          900: "#1C1917",  // stone-900
        },
        // Keep semantic colors standard
        success: "#10B981", // emerald-500
        danger: "#EF4444",
        warning: "#F59E0B",
        info: "#0EA5E9",
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.08)", // Slightly stronger shadow for depth
        card: "0 8px 24px rgba(28,25,23,0.08)", // Warm shadow
      },
      fontFamily: {
        // Adding Serif for headings could be nice, but keeping Sans for modern feel
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  safelist: [
    'bg-brand',
    'bg-gray-soft',
    'text-gray-900',
    'font-sans'
  ],
  plugins: [],
}
