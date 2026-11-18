/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mist: '#EDF1EF',
        ink: '#22333A',
        ink2: '#586A70',
        line: '#DEE6E3',
        sage: { DEFAULT: '#D2E6D9', d: '#4E8A68' },
        sky: { DEFAULT: '#D6E8F4', d: '#3F7BA0' },
        sand: { DEFAULT: '#F4E7CA', d: '#9A7B30' },
        rose: { DEFAULT: '#F5DADA', d: '#A95C5C' },
        lilac: { DEFAULT: '#E4DFF4', d: '#6F5FA8' },
      },
      fontFamily: { sans: ['"Readex Pro Variable"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
