import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Demo ve ekran görüntülerinde Next.js geliştirme rozeti görünmesin.
  devIndicators: false,
  // GEÇİCİ (sadece demo): Cloudflare quick tunnel ile dev sunucusunu paylaşmak için.
  // TODO(Faz 2): kaldır. Takip: docs/memory/todo.md → Mali → "allowedDevOrigins".
  allowedDevOrigins: ["*.trycloudflare.com"],
  // Workspace paketleri TS kaynak olarak gelir (@lokale/*), Next derler.
  transpilePackages: ["@lokale/contracts", "@lokale/domain"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Faz 2: /api → api servisi (:4000), /events → realtime servisi (:4001)
  // async rewrites() { ... }
};

export default nextConfig;
