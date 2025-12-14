// @ts-check
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * @type {import("eslint").Linter.FlatConfig[]}
 */
export default [
  {
    ignores: ["dist", "node_modules", "coverage"],
  },
  js.configs.recommended, // ESLint recommended base rules
  ...tseslint.configs.recommended, // TypeScript recommended rules
  prettier, // Disable formatting rules that conflict with Prettier

  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: {
        process: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
      },
    },

    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },

    rules: {
      // 🧠 General Code Quality
      "no-console": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "no-undef": "off",

      // 🧱 TypeScript Best Practices
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],

      // 🪶 Style Consistency (Prettier handles formatting)
      "prettier/prettier": "off",
    },
  },
];
