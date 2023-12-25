/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "Arial", "sans-serif"],
      },
      colors: {
        primary: "#339933",
        "primary-600": "#33993399",
        "primary-light": "#86C232",
        "deep-black": "#151515",
        black: "#222",
        charcoal: "#333",
        white: "#fff",
        grey: "#474B4F",
        lightgrey: "#868686",
      },
      boxShadow: {
        input: "0 0 5px rgba(0,255,0,.2), inset 0 0 5px rgba(0,255,0,.1)",
        button:
          "0 0 5px rgba(0,255,0,.3), 0 0 10px rgba(0,255,0,.2), 0 0 15px rgba(0,255,0,.1), 0 2px 0 black",
      },
      animation: {
        input: "input .8s ease-out infinite alternate",
      },
      keyframes: {
        input: {
          "0%": {
            "border-color": "#339933",
            "box-shadow":
              "0 0 5px rgba(0,255,0,.2), inset 0 0 5px rgba(0,0,0,.1)",
          },
          "100%": {
            "border-color": "#6f6",
            "box-shadow":
              "0 0 20px rgba(0,255,0,.6), inset 0 0 10px rgba(0,255,0,.4)",
          },
        },
      },
    },
  },
  plugins: [],
};
