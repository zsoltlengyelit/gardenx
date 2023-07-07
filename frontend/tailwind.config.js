/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin');

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)'
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)'
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)'
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)'
        },
        '.arrow-hide': {
          '&::-webkit-inner-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0
          },
          '&::-webkit-outer-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0
          },
        }

      };

      addUtilities(newUtilities);
    })
  ],
};
