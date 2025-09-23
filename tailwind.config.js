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
        green: "#D9E9CF",
      },
      fontFamily: {
        light: ["Light", "sans-serif"],
        regular: ["Regular", "sans-serif"],
        medium: ["Medium", "sans-serif"],
        semiBold: ["SemiBold", "sans-serif"],
        bold: ["Bold", "sans-serif"],
        extraBold: ["ExtraBold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
