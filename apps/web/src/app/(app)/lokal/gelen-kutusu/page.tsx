import type { Metadata } from "next";
import { InboxPage } from "@/features/inbox";

export const metadata: Metadata = { title: "Gelen kutusu" };

export default function Page() {
  return <InboxPage />;
}
