// Benzer soru bulma: mock için basit kelime eşleşmesi (Faz 2'de Postgres full-text search).

const STOPWORDS = new Set([
  "bir", "ve", "ile", "için", "bu", "şu", "o", "da", "de", "mi", "mı", "mu", "mü", "ne", "nerede", "nereye",
  "hangi", "en", "çok", "gibi", "ama", "ya", "veya", "ki", "var", "yok", "olan", "olarak", "daha", "her",
  "yer", "yeri", "yerde", "bana", "benim", "sen", "ben", "biz",
]);

/** Türkçe küçük harf, noktalama ve kesme işaretinden sonrasını at, kısa ve yaygın kelimeleri çıkar, 5 harfe kırp (kaba kök). */
export function tokenize(text: string): Set<string> {
  const words = text
    .toLocaleLowerCase("tr")
    .replace(/['’][a-zçğıöşü]*/g, "")
    .split(/[^a-zçğıöşü0-9]+/u)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .map((w) => w.slice(0, 5));
  return new Set(words);
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export function findSimilar<T>(text: string, entries: T[], getText: (e: T) => string, limit: number, minScore = 0.12): T[] {
  const q = tokenize(text);
  if (q.size < 2) return [];
  return entries
    .map((e) => ({ e, s: jaccard(q, tokenize(getText(e))) }))
    .filter((x) => x.s >= minScore)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.e);
}
