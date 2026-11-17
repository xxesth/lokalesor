import { base, boundaries } from "@lokale/config/eslint";

// db sadece @lokale/contracts'a bağımlı (enum değerleri). İş kuralı yok (ADR-010).
export default [...base, boundaries(["@lokale/domain", "@lokale/core", "@lokale/web", "@lokale/api", "@lokale/realtime", "@lokale/worker"])];
