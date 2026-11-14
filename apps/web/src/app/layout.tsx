import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { Providers } from "./providers";

// Schibsted Grotesk, yerel (Google Fonts'a bağımlılık yok, ADR-013). Lisans: fonts/OFL.txt
const schibsted = localFont({
  src: [
    { path: "./fonts/schibsted-grotesk-latin-wght-normal.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/schibsted-grotesk-latin-ext-wght-normal.woff2", weight: "400 900", style: "normal" },
  ],
  variable: "--font-schibsted",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Lokale Sor", template: "%s · Lokale Sor" },
  description: "Gittiğin şehrin yerlisine sor. Gerçek insanlardan, dakikalar içinde cevap.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={schibsted.variable}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
