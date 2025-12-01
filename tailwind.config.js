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
        "pastel-green": "#1E8E52",
        "pastel-red": "#F58476",
        "pastel-yellow": "#ffd54f",
        "pastel-blue": "#5AAEFF",
        "pastel-gray": "#888",
        "pastel-muted": "#666",
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
