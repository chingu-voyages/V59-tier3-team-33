/** @type {import('prettier').Config} */
module.exports = {
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
  // tailwindcss
  tailwindAttributes: ["theme"],
  tailwindFunctions: ["twMerge", "createTheme"],
};
