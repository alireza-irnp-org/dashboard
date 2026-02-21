import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/app/globals.css",
  ]),
  {
    rules: {
      // "@typescript-eslint/no-explicit-any": "off",
      // "react-hooks/rules-of-hooks": "warn",
      // "react-hooks/exhaustive-deps": "warn",
      // "@typescript-eslint/no-unused-vars": [
      //   "off",
      //   { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      // ],
      // "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    },
  },
]);

export default eslintConfig;
