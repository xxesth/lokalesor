"use client";
import { FlowHeader } from "@/components/layout/flow-header";
import { Page } from "@/components/layout/two-column";
import { NotificationList } from "@/features/notifications";
import { useSession } from "@/features/session";
import { AppHeader } from "@/features/shell";

export function NotificationsPage() {
  const { role } = useSession();
  return (
    <>
      <AppHeader hideOnMobile />
      <FlowHeader backHref={role === "local" ? "/lokal/gelen-kutusu" : "/ana-sayfa"} title="Bildirimler" />
      <Page className="max-w-[640px] px-0 pt-0 lg:px-6 lg:pt-8">
        <h1 className="sr-only">Bildirimler</h1>
        <NotificationList />
      </Page>
    </>
  );
}
