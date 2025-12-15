/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#111a22",
        "surface-dark": "#192633",
        "border-dark": "#324d67",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
       borderRadius: {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
      },
    },
  },
  plugins: [],
}
