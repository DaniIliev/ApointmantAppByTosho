module.exports = {
  input: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "context/**/*.{js,jsx,ts,tsx}",
    "i18n/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
  ],
  output: "./locales/$LOCALE/translation.json",
  locales: ["en", "bg", "de"],
  defaultNamespace: "translation",
  keySeparator: false,
  namespaceSeparator: false,
  createOldCatalogs: false,
  keepRemoved: true,
  sort: false,
  updateFiles: true,
  lexers: {
    tsx: ["JsxLexer"],
    ts: ["JavascriptLexer"],
    jsx: ["JsxLexer"],
    js: ["JavascriptLexer"],
  },
};
