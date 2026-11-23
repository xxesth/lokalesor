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

const DESCRIPTION = "Gittiğin şehrin yerlisine sor. Gerçek insanlardan, dakikalar içinde cevap.";

export const metadata: Metadata = {
  // Paylaşım önizlemesindeki görsel adresi mutlak olmalı; yayında NEXT_PUBLIC_SITE_URL verilir.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Lokale Sor", template: "%s · Lokale Sor" },
  description: DESCRIPTION,
  openGraph: { type: "website", locale: "tr_TR", siteName: "Lokale Sor", title: "Lokale Sor", description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: "Lokale Sor", description: DESCRIPTION },
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
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-control focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
        >
          İçeriğe geç
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
