const fs = require("fs");
const path = require("path");

const languages = ["en", "bg", "de"];
const basePath = path.join(__dirname, "locales");

function updateLanguageTranslations(language) {
  const filePath = path.join(basePath, language, "translation.json");

  const translations = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const existingKeys = Object.keys(translations);
  const newKeys = [];
  const oldKeys = [];

  for (const key of existingKeys) {
    if (key.startsWith("// NEW STRINGS BELOW")) {
      continue;
    }
    if (translations[key] === "") {
      newKeys.push(key);
    } else {
      oldKeys.push(key);
    }
  }

  const sortedTranslations = {};

  for (const key of oldKeys) {
    sortedTranslations[key] = translations[key];
  }

  sortedTranslations["// NEW STRINGS BELOW - TRANSLATE THESE"] = "";

  for (const key of newKeys) {
    sortedTranslations[key] = translations[key];
  }

  fs.writeFileSync(
    filePath,
    JSON.stringify(sortedTranslations, null, 2),
    "utf8"
  );

  console.log(
    `✅ Новите ключове (${newKeys.length}) са преместени в края на файла за ${language}!`
  );
}

languages.forEach((language) => {
  updateLanguageTranslations(language);
});
