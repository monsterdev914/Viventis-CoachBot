import { heroui } from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        "c-primary": "#FFFFFF",
      },
      button: {
        "solid": "bg-gradient-primary hover:opacity-90 transition-opacity text-[black]",
        "bordered": "hover:opacity-90 transition-opacity text-[white]",
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(39deg, #C4B200 0%, #F8EB69 70%)',
        'gradient-secondary': 'linear-gradient(39deg, #C4B200 0%, #F8EB69 70%)',
        'gradient-success': 'linear-gradient(39deg, #C4B200 0%, #F8EB69 70%)',
        'gradient-warning': 'linear-gradient(39deg, #C4B200 0%, #F8EB69 70%)',
        'gradient-danger': 'linear-gradient(39deg, #C4B200 0%, #F8EB69 70%)',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;