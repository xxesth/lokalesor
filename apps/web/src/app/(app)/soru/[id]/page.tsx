import type { Metadata } from "next";
import { QuestionDetail } from "@/features/question";

export const metadata: Metadata = { title: "Sorun" };

export default async function Page({ params }: PageProps<"/soru/[id]">) {
  const { id } = await params;
  return <QuestionDetail id={id} />;
}
