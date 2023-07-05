/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}", './views/**/*.{html,js,ejs}'],
  theme: {
    extend: {
      colors: {
        primary: '#BA4949',
        secondary: '#C15C5C',
      }
    },

  },
  plugins: [],
}

