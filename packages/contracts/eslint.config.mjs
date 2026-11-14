import { base, boundaries } from "@lokale/config/eslint";

// contracts hiçbir pakete bağımlı değil.
export default [...base, boundaries(["@lokale/domain", "@lokale/db", "@lokale/core", "@lokale/web", "@lokale/api", "@lokale/realtime", "@lokale/worker"])];
