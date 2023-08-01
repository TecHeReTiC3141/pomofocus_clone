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
      },
      backgroundImage: {
        'select-arrow': `url("data:image/svg+xml,<svg width='24' height='24' xmlns='http://www.w3.org/2000/svg'><path d='m0,6l12,12l12,-12l-24,0z'/><path fill='none' d='m0,0l24,0l0,24l-24,0l0,-24z'/></svg>");`
      }
    },

  },
  plugins: [],
}

