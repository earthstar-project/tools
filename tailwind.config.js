module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      gridTemplateColumns: {
        "app-lg": "12rem minmax(20rem, 25rem) 1fr",
        "app-md": "minmax(15rem, 20rem) 1fr",
        "app": "1fr",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
