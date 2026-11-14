import type { Metadata } from "next";
import { MyArchivePage } from "@/features/archive";

export const metadata: Metadata = { title: "Soru arşivim" };

export default function Page() {
  return <MyArchivePage />;
}
