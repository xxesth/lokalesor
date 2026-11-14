import type { Metadata } from "next";
import { HomePage } from "@/features/home";

export const metadata: Metadata = { title: "Ana sayfa" };

export default function Page() {
  return <HomePage />;
}
