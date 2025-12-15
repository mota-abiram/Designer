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
                "background-dark": "#ffffff", // Swapped to white
                "surface-dark": "#f9fafb",    // Swapped to light gray
                "border-dark": "#e5e7eb",     // Swapped to light border gray
                "text-main": "#111827",       // New: Dark text
                "text-muted": "#6b7280",      // New: Muted text
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
