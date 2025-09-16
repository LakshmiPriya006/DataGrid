const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter, sans-serif', { fontFeatureSettings: '"cv11"' }],
      },
      animation: {
        'modal-fade': 'modal-fade 200ms ease-in-out',
        'modal-zoom': 'modal-zoom 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        'modal-fade': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'modal-zoom': {
          from: { transform: 'scale(0.8)' },
          to: { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
  important: '#root',
}
/** @type {import('tailwindcss').Config} */
module.exports = config
