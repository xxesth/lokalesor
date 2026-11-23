// Otomatik mesaj ve bildirim metinleri. Kural tabanlı, LLM yok (ADR-012).
// Metinler SADECE burada yazılır.
import type { DistrictId, Topic } from "@lokale/contracts";
import { TOPIC_LABELS, districtName } from "./labels";

/** Türkçe yönelme eki: "Mert" → "Mert'e", "Zeynep" → "Zeynep'e", "Can" → "Can'a". */
export function dative(name: string): string {
  const lower = name.toLocaleLowerCase("tr");
  const vowels = [...lower].filter((ch) => "aeıioöuü".includes(ch));
  const last = vowels[vowels.length - 1] ?? "a";
  const front = "eiöü".includes(last);
  const endsWithVowel = "aeıioöuü".includes(lower[lower.length - 1] ?? "");
  return `${name}'${endsWithVowel ? "y" : ""}${front ? "e" : "a"}`;
}

// --- Sohbet akışına düşen otomatik mesajlar (turiste) ---

/** eta: formatEta() çıktısı ("~20 dk"); null ise yedek metin kullanılır. */
export function assigned(localName: string, eta: string | null): string {
  return `Sorun ${dative(localName)} iletildi. Genelde ${eta ?? "1 saat"} içinde yanıt veriyor.`;
}

export function reassigned(prevName: string, newName: string, eta: string | null): string {
  return `${prevName} şu an müsait değil. Sorunu ${dative(newName)} yönlendirdik, tahmini süre ${eta ?? "~1 saat"}.`;
}

export function openPool(): string {
  return "Şu an müsait lokal bulamadık. Sorun açık havuzda; ilk cevap veren lokal sana dönecek.";
}

/** Turistin soru detayında, soru açık havuzdayken. */
export function poolNoticeTourist(cityName: string): string {
  return `Sorun şu an ${cityName} lokallerinin hepsine açık. İlk cevaplayan sana dönecek, cevap gelince bildirim alacaksın.`;
}

/** Lokalin açık havuz bölümü açıklaması. */
export function poolIntroLocal(): string {
  return "Sıra bittiği için kimseye atanmamış sorular. İstediğini cevapla; atama sayılmaz, günlük kapasiten dolmaz. İlk cevap veren kazanır.";
}

export function poolEmptyLocal(): string {
  return "Açık havuzda bekleyen soru yok.";
}

export function answered(localName: string): string {
  return `${localName} soruna cevap verdi. Cevabı değerlendirmeyi unutma.`;
}

// --- Bildirimler ---

export function notifyQuestionAssigned(localName: string): string {
  return `Sorun ${dative(localName)} iletildi.`;
}

export function notifyQuestionReassigned(localName: string): string {
  return `Sorun ${dative(localName)} yönlendirildi.`;
}

export function notifyAnswerReceived(localName: string): string {
  return `${localName} soruna cevap verdi.`;
}

export function localNewQuestion(topic: Topic, district: DistrictId | null, minutes: number): string {
  const where = districtName(district);
  return `Yeni bir soru var: ${TOPIC_LABELS[topic]}${where ? ` – ${where}` : ""}. Cevaplamak için ${minutes} dk'n var.`;
}

export function localAssignmentExpired(): string {
  return "Soru bir sonraki lokale yönlendirildi.";
}

export function answerRated(touristName: string): string {
  return `${touristName} cevabını faydalı buldu.`;
}
