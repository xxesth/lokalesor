export interface NavItem {
  key: "home" | "ask" | "mine" | "inbox" | "profile";
  label: string;
  href: (userId: string) => string;
  match: (path: string) => boolean;
}

export const NAV: NavItem[] = [
  { key: "home", label: "Ana sayfa", href: () => "/ana-sayfa", match: (p) => p === "/ana-sayfa" },
  { key: "ask", label: "Soru sor", href: () => "/sor", match: (p) => p === "/sor" },
  { key: "mine", label: "Sorularım", href: () => "/sorularim", match: (p) => p === "/sorularim" || p.startsWith("/soru/") },
  { key: "inbox", label: "Gelen kutusu", href: () => "/lokal/gelen-kutusu", match: (p) => p.startsWith("/lokal") },
  { key: "profile", label: "Profil", href: (id) => `/profil/${id}`, match: (p) => p.startsWith("/profil") || p === "/ayarlar" },
];
