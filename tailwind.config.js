/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#09090b',
          900: '#0e0e12',
          850: '#131318',
          800: '#181820',
          750: '#1e1e27',
          700: '#262633',
          600: '#323242',
          500: '#48485e',
          accent: {
            DEFAULT: '#8b5cf6',
            hover: '#7c3aed',
            light: '#a78bfa',
            glow: '#c4b5fd',
            dark: '#6d28d9',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-subtle': '0 0 20px -5px rgba(139, 92, 246, 0.15)',
        'obsidian-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
