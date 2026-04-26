/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EBF6FD",
          100: "#CFEBFB",
          200: "#9FD7F7",
          300: "#6FC3F3",
          400: "#53A9EF",
          500: "#2B90E6",
          600: "#1A72C4",
          700: "#1356A0",
          800: "#0E3D7D",
          900: "#0A2B59",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
