#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readdirSync, statSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// Translation files paths
const localesDir = path.join(rootDir, "locales");
const enFilePath = path.join(localesDir, "en", "translation.json");
const bgFilePath = path.join(localesDir, "bg", "translation.json");
const deFilePath = path.join(localesDir, "de", "translation.json");

// Regex to find t("...") or t('...') patterns
const translationRegex = /t\(['"`]([^'"`]+)['"`]\)/g;

// Load existing translations
function loadTranslations(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return {};
  }
}

// Recursively find files matching patterns
function findFiles(dir, extensions, ignore = []) {
  const files = [];

  function traverse(currentDir) {
    try {
      const entries = readdirSync(currentDir);

      for (const entry of entries) {
        // Skip ignored directories
        if (ignore.some((ign) => currentDir.includes(ign))) {
          continue;
        }

        const fullPath = path.join(currentDir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (extensions.some((ext) => entry.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Silently skip directories we can't read
    }
  }

  traverse(dir);
  return files;
}

// Extract translation keys from files
function extractKeys() {
  const keys = new Set();

  const dirsToScan = [
    path.join(rootDir, "app"),
    path.join(rootDir, "components"),
    path.join(rootDir, "context"),
    path.join(rootDir, "hooks"),
    path.join(rootDir, "lib"),
  ];

  const files = [];
  for (const dir of dirsToScan) {
    if (fs.existsSync(dir)) {
      files.push(...findFiles(dir, [".tsx", ".ts"], ["node_modules", ".next"]));
    }
  }

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      let match;

      while ((match = translationRegex.exec(content)) !== null) {
        keys.add(match[1]);
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
    }
  }

  return keys;
}

// Update translation file with new keys
function updateTranslationFile(filePath, extractedKeys) {
  const translations = loadTranslations(filePath);
  let updated = false;

  // Add missing keys with empty value
  for (const key of extractedKeys) {
    if (!(key in translations)) {
      translations[key] = "";
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + "\n");
    console.log(`✓ Updated ${path.relative(rootDir, filePath)}`);
  } else {
    console.log(`✓ No new keys in ${path.relative(rootDir, filePath)}`);
  }

  return updated;
}

// Main function
function main() {
  console.log("🔍 Scanning for translation keys...\n");

  const extractedKeys = extractKeys();

  if (extractedKeys.size === 0) {
    console.log("✓ No translation keys found");
    return;
  }

  console.log(`Found ${extractedKeys.size} translation keys\n`);
  console.log("Updating translation files...\n");

  let totalUpdated = 0;

  if (updateTranslationFile(enFilePath, extractedKeys)) totalUpdated++;
  if (updateTranslationFile(bgFilePath, extractedKeys)) totalUpdated++;
  if (updateTranslationFile(deFilePath, extractedKeys)) totalUpdated++;

  console.log(`\n✅ Done! Updated ${totalUpdated} translation file(s)`);
}

main();
