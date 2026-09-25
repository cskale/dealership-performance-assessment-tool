import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // ponytail: 92 legacy `any`s; clean up as files are touched, then flip back to "error".
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // shadcn/ui is regenerated, not hand-edited (see CLAUDE.md).
    files: ["src/components/ui/**"],
    rules: { "@typescript-eslint/no-empty-object-type": "off" },
  }
);
