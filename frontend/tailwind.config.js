/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin');

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
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
        }
      };

      addUtilities(newUtilities);
    })
  ],
};
