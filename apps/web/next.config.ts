import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace paketleri TS kaynak olarak gelir (@lokale/*), Next derler.
  // Demo ve ekran görüntülerinde Next.js geliştirme rozeti görünmesin.
  devIndicators: false,
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
