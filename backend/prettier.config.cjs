module.exports = {
  plugins: ["prettier-plugin-organize-imports"],

  importOrder: [
    "^node:", // Node built-ins (fs, path, crypto…)
    "^[a-zA-Z]", // npm packages
    "^@/.*$", // absolute imports (if you have tsconfig paths)
    "^[./]", // relative imports ("./controller/...")
  ],

  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
