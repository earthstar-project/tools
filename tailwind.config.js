module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      gridTemplateColumns: {
        "app-lg": "12rem minmax(20rem, 25rem) 1fr",
        "app-md": "minmax(15rem, 20rem) 1fr",
        "app": "1fr",
      },
      height: {
        "app": "calc(100vh - 52px)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
