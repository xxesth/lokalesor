import type { Metadata } from "next";
import { SettingsPage } from "@/features/settings";

export const metadata: Metadata = { title: "Ayarlar" };

export default function Page() {
  return <SettingsPage />;
}
