# Translation Management

This project uses i18next for internationalization (i18n) with support for English, German, and Bulgarian.

## Extracting Translations

The `npm run i18n:extract` command scans all your component files (`.ts` and `.tsx` files in `app/`, `components/`, `context/`, `hooks/`, and `lib/` directories) for untranslated strings wrapped with the `t()` function.

### Usage

```bash
npm run i18n:extract
```

This command will:

1. 🔍 Scan all relevant files for `t("string")` patterns
2. 📝 Find all translation keys that are not yet in the translation files
3. 📦 Add new keys to all translation files (`en/translation.json`, `bg/translation.json`, `de/translation.json`) with empty values
4. ✅ Report which files were updated

### Example

If you add this to your code:

```tsx
<h1>{t("Hello World")}</h1>
<p>{t("Welcome to our app")}</p>
```

Running `npm run i18n:extract` will:

- Find these two keys: "Hello World" and "Welcome to our app"
- Add them to all translation files with empty values:
  ```json
  {
    "Hello World": "",
    "Welcome to our app": ""
  }
  ```

Then you can manually fill in the translations for each language.

## Translation Files

Translation files are located in `locales/` directory:

- `locales/en/translation.json` - English translations
- `locales/bg/translation.json` - Bulgarian translations
- `locales/de/translation.json` - German translations

Each file is a JSON object where:

- **Key**: The text string used in `t()` function
- **Value**: The translated text

### Example Structure

```json
{
  "Hello World": "Hello World",
  "Welcome to our app": "Добре дошли в нашето приложение",
  "Save": "Запази"
}
```

## How to Use Translations in Code

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("Hello World")}</h1>
      <button>{t("Save")}</button>
    </div>
  );
}
```

## Workflow

1. Write your UI with `t()` function calls:

   ```tsx
   <h1>{t("My new heading")}</h1>
   ```

2. Run the extraction script:

   ```bash
   npm run i18n:extract
   ```

3. The script automatically adds new keys to all translation files

4. Manually translate the new keys in `locales/bg/translation.json` and `locales/de/translation.json`

5. Commit the updated translation files

## Notes

- The `t()` function must use string literals (not variables)
- Supported quote styles: single `'`, double `"`, and backticks `` ` ``
- The script ignores `node_modules/` and `.next/` directories
- Existing translations are preserved; only new keys are added with empty values
