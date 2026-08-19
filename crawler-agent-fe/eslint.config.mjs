import path from "node:path"
import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import prettier from "eslint-config-prettier"
import globals from "globals"
import tseslint from "typescript-eslint"

const compat = new FlatCompat({ baseDirectory: new URL(".", import.meta.url).pathname })

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "dist/**",
      "build/**",
      "out/**",
      "node_modules/**",
      "public/**",
      "coverage/**",
      "next-env.d.ts",
      "**/*.esm.js",
    ],
  },
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("plugin:tailwindcss/recommended"),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    rules: {
      // TypeScript itself resolves identifiers and types; the core rule reports
      // false positives for type-only globals such as the React namespace.
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.node },
  },
  {
    settings: {
      tailwindcss: {
        callees: ["cn"],
        config: path.join(import.meta.dirname, "tailwind.config.js"),
      },
      next: {
        rootDir: ["./"],
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": "off",
      "tailwindcss/no-custom-classname": "off",
      "no-unused-vars": "off",
    },
  },
  prettier
)
