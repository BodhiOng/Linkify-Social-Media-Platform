/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      screens: {
        'tablet': '768px',  
        'laptop': '1366px', 
        'desktop': '1920px', 
        'mobile': '360px',
      },
    },
  },
  plugins: [],
}

