import type { Metadata } from "next";
import { DevPanel } from "@/features/dev-panel";

export const metadata: Metadata = { title: "Geliştirici paneli" };

export default function Page() {
  return <DevPanel />;
}
