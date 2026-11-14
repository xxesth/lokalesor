// SVG ikonları handoff ekranlarından (docs/handoff/screens). Tek yerde toplanır.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const line = (size: number, sw = 2) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: sw, strokeLinecap: "square" as const, "aria-hidden": true,
});

export const BackIcon = ({ size = 22, ...p }: P) => (<svg {...line(size)} {...p}><path d="M15 5 8 12l7 7" /></svg>);
export const ChevronDownIcon = ({ size = 14, ...p }: P) => (<svg {...line(size)} {...p}><path d="m6 9 6 6 6-6" /></svg>);
export const ChevronRightIcon = ({ size = 20, ...p }: P) => (<svg {...line(size)} {...p}><path d="m9 5 7 7-7 7" /></svg>);
export const ArrowRightIcon = ({ size = 16, ...p }: P) => (<svg {...line(size)} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const CloseIcon = ({ size = 18, ...p }: P) => (<svg {...line(size, 2.2)} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const CheckIcon = ({ size = 14, ...p }: P) => (<svg {...line(size, 3)} {...p}><path d="m5 12 5 5 9-10" /></svg>);
export const BellIcon = ({ size = 22, ...p }: P) => (<svg {...line(size, 1.8)} {...p}><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9Z" /><path d="M10 20.5h4" /></svg>);
export const ThumbUpIcon = ({ size = 18, ...p }: P) => (<svg {...line(size)} {...p}><path d="M7 10v10H4V10Z" /><path d="M7 10l4-7c1.5 0 2.5 1 2.5 2.5V9h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.3 20H7" /></svg>);
export const ThumbDownIcon = ({ size = 18, ...p }: P) => (<svg {...line(size)} {...p} style={{ transform: "rotate(180deg)", ...p.style }}><path d="M7 10v10H4V10Z" /><path d="M7 10l4-7c1.5 0 2.5 1 2.5 2.5V9h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.3 20H7" /></svg>);
export const LockIcon = ({ size = 18, ...p }: P) => (<svg {...line(size, 1.8)} {...p}><rect x="5" y="11" width="14" height="10" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);

// Alt sekme ikonları (aktifken kalın çizgi)
export const HomeIcon = ({ size = 22, active, ...p }: P & { active?: boolean }) => (<svg {...line(size, active ? 2.2 : 1.8)} {...p}><path d="M4 10 12 4l8 6v10H4Z" /></svg>);
export const PlusIcon = ({ size = 22, active, ...p }: P & { active?: boolean }) => (<svg {...line(size, active ? 2.2 : 1.8)} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const ListIcon = ({ size = 22, active, ...p }: P & { active?: boolean }) => (<svg {...line(size, active ? 2.2 : 1.8)} {...p}><path d="M5 6h14M5 12h14M5 18h9" /></svg>);
export const InboxIcon = ({ size = 22, active, ...p }: P & { active?: boolean }) => (<svg {...line(size, active ? 2.2 : 1.8)} {...p}><path d="M4 5h16v14H4Z" /><path d="M4 13h5l1 2h4l1-2h5" /></svg>);
export const UserIcon = ({ size = 22, active, ...p }: P & { active?: boolean }) => (<svg {...line(size, active ? 2.2 : 1.8)} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>);

/** Otomatik mesaj / sistem bildirimi ikonu (robot değil, kare). */
export const SystemSquareIcon = ({ size = 12, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden {...p}>
    <rect x="1.5" y="1.5" width="11" height="11" fill="none" stroke="var(--gray)" strokeWidth="1.5" />
    <rect x="5" y="5" width="4" height="4" fill="var(--gray)" />
  </svg>
);

/** Doğrulanmış mührü. inverse: koyu zemin üzerinde. */
export const SealIcon = ({ size = 15, inverse, title, ...p }: P & { inverse?: boolean; title?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} {...p}>
    <path d="M8 0.8 9.9 2.3 12.3 2.1 12.9 4.4 15 5.6 14.1 7.9 15 10.1 12.9 11.4 12.3 13.7 9.9 13.5 8 15 6.1 13.5 3.7 13.7 3.1 11.4 1 10.1 1.9 7.9 1 5.6 3.1 4.4 3.7 2.1 6.1 2.3Z" fill={inverse ? "var(--paper)" : "var(--ink)"} />
    <path d="m5.2 8.1 1.9 1.9 3.8-3.8" fill="none" stroke={inverse ? "var(--ink)" : "var(--paper)"} strokeWidth="1.6" strokeLinecap="square" />
  </svg>
);
