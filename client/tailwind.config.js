import plugin from "tailwindcss/plugin";
import scrollbarHide from "tailwind-scrollbar-hide";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        "auto-fit": "repeat(auto-fit,minmax(300px,1fr))",
      },
      backgroundImage: {
        stars:
          "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png')",
        twinkling:
          "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/twinkling.png')",
        stripe: `repeating-linear-gradient(45deg,transparent,transparent 20px,white 60px),
                 linear-gradient(10deg,#339933,#86C232)`,
      },
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
        "shooting-star":
          "0 0 0 4px rgba(255, 255, 255, 0.1), 0 0 0 8px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 1)",
      },
      textShadow: {
        DEFAULT: "0 0 10px #151515",
      },
      animation: {
        input: "input .8s ease-out infinite alternate",
        stripe: "stripe 3s alternate infinite",
        twinkling: "twinkling 70s linear infinite",
        "shooting-star": "shooting-star 3s linear infinite",
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
        stripe: {
          "0%": {
            "background-position": "0 100px",
          },
          "100%": {
            "background-position": "300px 300px",
          },
        },
        twinkling: {
          "0%": {
            transform: "translate3d(0px,0px,0px)",
          },
          "100%": {
            transform: "translate3d(1000px,0px,0px)",
          },
        },
        "shooting-star": {
          "0%": {
            transform: "rotate(315deg) translateX(0)",
            opacity: 1,
          },
          "70%": {
            opacity: 1,
          },
          "100%": {
            transform: "rotate(315deg) translateX(-1500px)",
            opacity: 0,
          },
        },
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") },
      );
    }),
    plugin(({ addUtilities, theme }) => {
      const fontSize = theme("fontSize.2xs", "0.625rem");
      const lineHeight = theme("lineHeight.2xs", "0.75rem");

      const styles = {
        ".text-2xs": {
          "font-size": fontSize,
          "line-height": lineHeight,
        },
      };

      addUtilities(styles, ["responsive", "hover"]);
    }),
    scrollbarHide,
  ],
};
