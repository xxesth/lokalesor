import type { Metadata } from "next";
import { MyQuestions } from "@/features/question";

export const metadata: Metadata = { title: "Sorularım" };

export default function Page() {
  return <MyQuestions />;
}
