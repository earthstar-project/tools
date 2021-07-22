module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      gridTemplateColumns: {
        "app-wide": "minmax(10rem, 15rem) minmax(20rem, 25rem) 1fr",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
