const colors = require('tailwindcss/colors')

module.exports = {
  purge: [
    '*.html',
    '*.js',
  ],
  darkMode: 'class',
  theme: {
    colors: {
      gray: colors.trueGray,
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}