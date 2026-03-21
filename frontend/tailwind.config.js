/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a1a2e',
        'bg-card': '#16213e',
        'bg-sidebar': '#0f0f23',
        'ball-red': '#e94560',
        'ball-blue': '#0ea5e9',
        'text-primary': '#e2e8f0',
        'text-secondary': '#94a3b8',
        'border-color': '#334155',
      },
    },
  },
  plugins: [],
}
