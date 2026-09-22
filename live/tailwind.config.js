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
        blackops: ['"Black Ops One"', "sans-serif"],
        bowlby: ['"Bowlby One"', "sans-serif"],
        inter: ['"Inter"', "sans-serif"],
        yesteryear: ['"Yesteryear"', "cursive"],
        spicyrice: ['"Spicy Rice"', "sans-serif"],
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
        "wcu-float-dot": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "wcu-float-dot-2": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "wcu-float-dot-3": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "wcu-img-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        swipeLeft: "swipeLeft 1s ease-in",
        swipeRight: "swipeRight 1s ease-in",
        "wcu-float-dot": "wcu-float-dot 4s ease-in-out infinite",
        "wcu-float-dot-2": "wcu-float-dot-2 5s ease-in-out 1s infinite",
        "wcu-float-dot-3": "wcu-float-dot-3 6s ease-in-out 2s infinite",
        "wcu-img-float": "wcu-img-float 5s ease-in-out infinite",
      },
      screens: {
        "3xl": "1920px",
        "4xl": "2560px"
      }
    },
  },
  plugins: [],
};
