/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit', // ⚠ Make sure to have this
  purge: ["./src/**/*.svelte"],
  content: [],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
}
