import { base, boundaries } from "@lokale/config/eslint";

// domain sadece @lokale/contracts'a bağımlı; saf TS (React/Node yok).
export default [
  ...base,
  boundaries(["@lokale/db", "@lokale/core", "@lokale/web", "react", "react-dom", "next", "next/*", "node:*"]),
  {
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "Date", property: "now", message: "domain saf olmalı: zamanı `now` parametresiyle al." },
      ],
    },
  },
];
