/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#ffffff',
        'bg-card': '#f1f5f9',
        'bg-sidebar': '#1e293b',
        'ball-red': '#e94560',
        'ball-blue': '#0ea5e9',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        'border-color': '#e2e8f0',
      },
    },
  },
  plugins: [],
}
