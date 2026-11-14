import { SealIcon } from "./icons";

export function VerifiedSeal({ size = 15 }: { size?: number }) {
  return <SealIcon size={size} title="Doğrulanmış" />;
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2">
      <SealIcon size={15} />
      Doğrulanmış
    </span>
  );
}
