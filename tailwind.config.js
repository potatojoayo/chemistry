/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#222",
        foreground: "#ECEEDF",
        green: "#26B066",
        red: "#F58476",
        yellow: "#ffd54f",
        blue: "#5AAEFF",
        gray: "#888",
        muted: "#666",
      },
      fontFamily: {
        light: ["Light", "sans-serif"],
        regular: ["Regular", "sans-serif"],
        medium: ["Medium", "sans-serif"],
        semibold: ["SemiBold", "sans-serif"],
        bold: ["Bold", "sans-serif"],
        extraBold: ["ExtraBold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
