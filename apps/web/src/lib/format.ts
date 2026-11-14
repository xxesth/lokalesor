// Süre ve tarih biçimlendirme (Türkçe). Saat dilimi: tarayıcı.

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDayMonth(ts: number): string {
  return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }).replace(".", "");
}

/** "Bugün 19:02", "Dün 23:10", "3 Kas" */
export function formatRelative(ts: number, now: number): string {
  const d = new Date(ts);
  const n = new Date(now);
  const sameDay = d.toDateString() === n.toDateString();
  const y = new Date(now - 86_400_000);
  if (sameDay) return `Bugün ${formatClock(ts)}`;
  if (d.toDateString() === y.toDateString()) return `Dün ${formatClock(ts)}`;
  return formatDayMonth(ts);
}

/** "5 dk önce" gibi kısa göreli zaman (bildirimler). */
export function timeAgo(ts: number, now: number): string {
  const m = Math.max(0, Math.round((now - ts) / 60_000));
  if (m < 1) return "şimdi";
  if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} sa önce`;
  return formatDayMonth(ts);
}

export function minutesBetween(a: number, b: number): number {
  return Math.max(1, Math.round((b - a) / 60_000));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").toLocaleUpperCase("tr");
}
