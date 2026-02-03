/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#7B4A2E',
        secondary: '#FFFCF9',
        accent: '#D88A3D',
        success: "#6B8E4E",
        light: {
          50: '#F5F5F5',
          100: '#E3E3E3',
          200: '#C7C7C7',
          300: '#F2F2F2',
          400: '#B2B2B2'
        },
        dark: {
          100: '#2F2F2F',
          200: '#8A8A8A',
        },
      }
    },
  },
  plugins: [],
}

