/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        secondary: "#1e293b",
        primary_faded: "#E9D5FF",
        third_color: "#F38200",
        hot_pink: "#0a6fad",
      },
      fontFamily: {
        primary: "Jost",
        secondary: "Jost",
      },
      keyframes: {
        swipeLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        swipeRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      animation: {
        swipeLeft: "swipeLeft 1s ease-in",
        swipeRight: "swipeRight 1s ease-in",
      },
    },
  },
  plugins: [],
};
