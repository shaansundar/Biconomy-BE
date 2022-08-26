/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors:{
        bgPrimary: "#f3f6ff",
        fgPrimary: "#d85111",
        fgSecondary: "#fbeee8",
        bgSecondary: "#ffffff",
        textPrimary: "#2c3640",
        textSecondary: "#acb8d0"
      }
    },
  },
  plugins: [],
}