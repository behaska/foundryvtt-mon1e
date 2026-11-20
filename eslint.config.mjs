import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

// Only rules that catch certain errors block (`recommended`). Style rules are
// deliberately not enabled; see docs/DEVELOPMENT.md.
export default defineConfig([
  globalIgnores([
    "node_modules/",
    "dist/",
    "documentation/",
    ".claude/",
    ".agents/",
    ".llm-workbench/",
    ".idea/"
  ]),
  {
    files: ["**/*.mjs"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },
  {
    // Foundry runtime globals, limited to what src/ actually uses.
    files: ["src/**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.browser,
        game: "readonly",
        foundry: "readonly",
        Hooks: "readonly",
        CONFIG: "readonly",
        Actor: "readonly"
      }
    }
  },
  {
    files: ["scripts/**/*.mjs", "tests/**/*.mjs"],
    languageOptions: { globals: globals.node }
  }
]);
