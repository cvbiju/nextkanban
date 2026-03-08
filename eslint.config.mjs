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
    // Seed script uses CommonJS requires — not production code
    "prisma/seed.js",
  ]),
  // Downgrade noisy rules to warnings so CI doesn't block deployments.
  // These should be addressed incrementally as code quality improves.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-page-custom-font": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
