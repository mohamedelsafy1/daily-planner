/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(--${v}) / <alpha-value>)`
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: c('white'),
        mist: c('mist'),
        ink: c('ink'),
        ink2: c('ink2'),
        line: c('line'),
        sage: { DEFAULT: c('sage'), d: c('sage-d') },
        sky: { DEFAULT: c('sky'), d: c('sky-d') },
        sand: { DEFAULT: c('sand'), d: c('sand-d') },
        rose: { DEFAULT: c('rose'), d: c('rose-d') },
        lilac: { DEFAULT: c('lilac'), d: c('lilac-d') },
      },
      fontFamily: { sans: ['"Readex Pro Variable"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
