/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Nunito', 'system-ui', 'sans-serif'] },
      boxShadow: { game: '0 10px 0 rgba(35,20,70,.12), 0 18px 40px rgba(35,20,70,.12)' },
      animation: { pop: 'pop .35s ease-out', shake: 'shake .35s ease-in-out', float: 'float 3s ease-in-out infinite' },
      keyframes: {
        pop: { '0%': { transform: 'scale(.85)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-7px)' }, '75%': { transform: 'translateX(7px)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-7px)' } }
      }
    }
  },
  plugins: []
}
