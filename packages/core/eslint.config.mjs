import { base, boundaries } from "@lokale/config/eslint";

// core: contracts + domain + db. Servisleri (apps/*) ve web'i import edemez (CLAUDE.md #3).
export default [...base, boundaries(["@lokale/web", "@lokale/api", "@lokale/realtime", "@lokale/worker", "react", "next", "next/*"])];
