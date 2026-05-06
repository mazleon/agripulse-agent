import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#39ff14',
          blue: '#00f3ff',
          red: '#ff0055',
          yellow: '#ccff00',
        },
        agri: {
          dark: '#050a06', // very dark background
          card: '#0a140c', // slightly lighter for cards
          800: '#112216',
          700: '#17301e',
          600: '#1f4028',
          500: '#2a5535',
          400: '#387347',
          300: '#4aa161',
        },
        earth: {
          dark: '#1a110a',
          800: '#2b1c11',
          500: '#8c5936',
          300: '#d98b55',
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      boxShadow: {
        'neon-green': '0 0 10px #39ff14, 0 0 20px #39ff14',
        'neon-blue': '0 0 10px #00f3ff, 0 0 20px #00f3ff',
        'neon-red': '0 0 10px #ff0055, 0 0 20px #ff0055',
      },
    },
  },
  plugins: [],
};
export default config;
