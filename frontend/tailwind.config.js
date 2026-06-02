/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shopee: {
          DEFAULT: '#ee4d2d',
          hover: '#f05d40',
          light: '#feeee8',
        }
      }
    },
  },
  plugins: [],
}
