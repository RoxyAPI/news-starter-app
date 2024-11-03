/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        light: {
          text: '#000',
          background: '#fff',
          tint: '#333',
          tabIconDefault: '#ccc',
          tabIconSelected: '#333',
        },
        dark: {
          text: '#fff',
          'text-muted': '#999',
          background: '#000',
          tint: '#fff',
          tabIconDefault: '#ccc',
          tabIconSelected: '#fff',
        },
      }
    },
  },
  plugins: [],
}

