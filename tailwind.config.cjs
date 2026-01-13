/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e7f6f3",
          100: "#c9eee7",
          200: "#9fe1d6",
          300: "#6fd2c2",
          400: "#3fc0ad",
          500: "#26a69a",
          600: "#1c857c",
          700: "#166a63",
          800: "#135650",
          900: "#104844",
        },
      },
      boxShadow: {
        soft: "0 12px 40px rgba(16, 24, 40, 0.10)",
        softer: "0 8px 24px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};
