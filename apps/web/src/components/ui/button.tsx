import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "text";
type Size = "md" | "lg";

const base = "inline-flex items-center justify-center gap-2 font-bold rounded-control transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-2",
  secondary: "bg-paper text-ink border border-ink hover:bg-mist",
  text: "bg-transparent text-ink underline underline-offset-4 px-1.5 hover:text-nar",
};
const sizes: Record<Size, string> = { md: "h-11 px-4 text-[15px]", lg: "h-12 px-5 text-[15px]" };

export function buttonClass(variant: Variant = "primary", size: Size = "lg", className?: string) {
  return cn(base, variants[variant], variant !== "text" && sizes[size], variant === "text" && "h-11 text-[15px]", className);
}

export function Button({
  variant = "primary",
  size = "lg",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...rest} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "lg",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(buttonClass(variant, size, className), "hover:text-paper", variant !== "primary" && "hover:text-ink")}>
      {children}
    </Link>
  );
}
