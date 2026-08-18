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
          DEFAULT: '#0F172A',
          hover: '#1E293B',
        },
        secondary: {
          DEFAULT: '#64748B',
        },
        accent: {
          DEFAULT: '#FF4A3D',
        },
        success: '#10B981',
        warning: '#F59E0B',
        page: '#F8FAFC',
        surface: '#FFFFFF',
        base: '#E2E8F0',
        ink: {
          DEFAULT: '#020617',
          lighter: '#475569',
          muted: '#94A3B8'
        },
        // Legacy colors mapped to new ones
        shopee: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          light: '#F1F5F9',
        },
        bmart: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          light: '#F1F5F9',
          accent: '#FF4A3D',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
