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
                "background-dark": "#0f172a", // True Dark: Slate 900
                "surface-light": "#ffffff",
                "surface-dark": "#1e293b",    // True Dark Surface: Slate 800
                "border-light": "#e5e7eb",
                "border-dark": "#334155",     // True Dark Border: Slate 700
                "text-main": "#111827",
                "text-main-dark": "#f8fafc",  // Light text for dark mode
                "text-muted": "#6b7280",
                "text-muted-dark": "#94a3b8", // Muted text for dark mode
            },
            fontFamily: {
                "display": ["League Spartan", "Inter", "sans-serif"],
                "sans": ["League Spartan", "Inter", "sans-serif"]
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
