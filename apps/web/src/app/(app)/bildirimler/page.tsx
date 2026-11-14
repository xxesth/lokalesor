import type { Metadata } from "next";
import { NotificationsPage } from "./notifications-page";

export const metadata: Metadata = { title: "Bildirimler" };

export default function Page() {
  return <NotificationsPage />;
}
