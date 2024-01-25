/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./src/**/*.{svelte,html,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
      require('daisyui')
  ],
}

