import type { Metadata } from "next";
import { ProfilePage } from "@/features/profile";

export const metadata: Metadata = { title: "Profil" };

export default async function Page({ params }: PageProps<"/profil/[id]">) {
  const { id } = await params;
  return <ProfilePage id={id} />;
}
