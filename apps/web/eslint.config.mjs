import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { boundaries } from "@lokale/config/eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // web sunucu paketlerini import edemez (CLAUDE.md #3).
  boundaries(["@lokale/db", "@lokale/core", "@lokale/api", "@lokale/realtime", "@lokale/worker"]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
