/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      colors: {
        /**
         * INDLearns logo palette (cyan → royal blue → navy)
         * Builds trust: blue = reliability, professionalism (EdTech standard)
         */
        brand: {
          50: "#EEF8FE",
          100: "#D6EEFB",
          200: "#A8DDF7",
          300: "#7ECCEF",
          400: "#58C4F6",
          500: "#2D89EF",
          600: "#1A78D4",
          700: "#1565C0",
          800: "#0D5BB5",
          900: "#0056B3",
          950: "#003D82",
        },
        accent: {
          300: "#7DD3FC",
          400: "#58C4F6",
          500: "#38BDF8",
          600: "#0EA5E9",
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 85% 60% at 50% -15%, rgba(88, 196, 246, 0.22), rgba(45, 137, 239, 0.08) 45%, transparent 70%)",
        "brand-gradient": "linear-gradient(135deg, #58C4F6 0%, #2D89EF 50%, #0056B3 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(88, 196, 246, 0.15) 0%, rgba(45, 137, 239, 0.12) 50%, rgba(0, 86, 179, 0.08) 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(238, 248, 254, 0.75) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(45, 137, 239, 0.1)",
        "glass-dark": "0 8px 32px 0 rgba(0, 61, 130, 0.35)",
        brand: "0 4px 20px -4px rgba(45, 137, 239, 0.35)",
        "brand-lg": "0 10px 40px -8px rgba(26, 120, 212, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
