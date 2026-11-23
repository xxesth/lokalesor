import type { Metadata } from "next";
import { DemoUserPicker } from "@/features/session";
import { Logo } from "@/features/shell";

export const metadata: Metadata = { title: "Giriş" };

export default function GirisPage() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1248px] items-center justify-between px-4 py-3.5 lg:px-6">
          <Logo />
          <span className="text-[15px] text-gray">Demo</span>
        </div>
      </header>
      <DemoUserPicker />
    </>
  );
}
