import type { Metadata } from "next";
import { InboxPage } from "@/features/inbox";
import { RoleGate } from "@/features/shell";

export const metadata: Metadata = { title: "Gelen kutusu" };

export default function Page() {
  return (
    <RoleGate role="local">
      <InboxPage />
    </RoleGate>
  );
}
