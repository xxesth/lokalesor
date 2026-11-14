// Ortak ESLint ayarları. Paketler `base`, uygulamalar kendi config'ine `boundaries(...)` ekler.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export const base = tseslint.config(
  { ignores: ["dist/**", ".next/**", "coverage/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
);

/**
 * Bağımlılık yönü kuralı (CLAUDE.md #3).
 * @param {string[]} forbidden import edilmesi yasak paket kalıpları
 */
export function boundaries(forbidden) {
  return {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...forbidden.map((group) => ({
              group: [group],
              message: "Bağımlılık yönü kuralı: bu paket buradan import edilemez (bkz. CLAUDE.md #3).",
            })),
            { group: ["**/apps/*", "../../apps/**"], message: "Paketler apps/* klasöründen import edemez." },
          ],
        },
      ],
    },
  };
}
