/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:       "#0f0e1a",
          card:     "#1a1830",
          deep:     "#0d0c17",
          border:   "#2d2a5e",
          indigo:   "#4f46e5",
          gold:     "#fde047",
          cyan:     "#67e8f9",
          urgent:   "#ec4899",
          high:     "#f97316",
          good:     "#84cc16",
          model1:   "#facc15",
          model2:   "#f472b6",
          nav:      "#13112b",
        },
      },
      fontFamily: {
        sans: ["'Outfit'", "'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up":    "fadeUp 0.5s ease-out forwards",
        "fade-in":    "fadeIn 0.4s ease-out forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "shimmer":    "shimmer 1.5s linear infinite",
        "slide-right":"slideRight 0.6s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
