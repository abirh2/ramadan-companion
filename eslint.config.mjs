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
    // Copied native/web assets and agent-owned browser tooling are not app source.
    "public/maplibre/**",
    "ios/App/App/public/**",
    "android/app/build/**",
    ".agents/**",
    ".cursor/**",
    ".gemini/**",
    ".kiro/**",
  ]),
]);

export default eslintConfig;
