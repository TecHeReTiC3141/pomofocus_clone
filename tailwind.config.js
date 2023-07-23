/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./public/**/*.{html,js}", './views/**/*.{html,js,ejs}'],
  theme: {
    extend: {
      colors: {
        pomodoro: '#BA4949',
        shortBreak: '#38858A',
        longBreak: '#397097',
      },
      fontFamily: {
        'body': ['Nunito', 'ui-sans-serif'],
      }
    },

  },
  plugins: [],
}

