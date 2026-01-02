/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'mint-primary-blue': '#0d6670',
        'mint-accent-green': '#4CAF50',
        'mint-secondary-blue': '#0a4f57', // Darker shade of primary for hover states
        'mint-light-gray': '#F9FAFB',
        'mint-medium-gray': '#E5E7EB',
        'mint-dark-text': '#374151',
      },
    },
  },
  plugins: [],
}

