const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx,html}",],
  theme: {
    screens: {
      'xs': '425px',
      'sm': '768px',
      'md': '1024px',
      'lg': '1440px',
      'xl': '1920px'
    },
    fontFamily: {
      'antipasto': 'Antipasto',
      'caviar': 'Caviar',
      'josefin': 'Josefin',
      'calypsoka': 'Calypsoka',
      'sourcesans': 'Sourcesans',
      'roboto': 'Roboto'
    },
    colors: {
      darkNavBg: '#1a1a1c',
      ...colors
    },

    extend: {},
  },
  plugins: [],
}

