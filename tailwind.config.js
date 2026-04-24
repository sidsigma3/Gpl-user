/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a6b3a', // Cricket green
        },
        accent: {
          DEFAULT: '#d4a017', // Accent gold
        },
        background: {
          DEFAULT: '#0d1117', // Dark background
        },
        surface: {
          DEFAULT: '#161b22', // Card surface
        },
        text: {
          primary: '#e6edf3',
          muted: '#8b949e',
        }
      },
    },
  },
  plugins: [],
}
