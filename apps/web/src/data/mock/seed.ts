// Demo verisi: docs/handoff/data/seed.json sözleşme tiplerine çevrildi (ADR-014).
// Senaryo: Elif'in sorusunda eşleştirme Mert'i 1., Zeynep'i 2. sıraya koymalı (todo 1.4).
// Geçmiş atama/cevap/değerlendirmeler sentetik üretilir; istatistikler bunlardan HESAPLANIR,
// böylece Zeynep cevap verince profil kartı gerçekten güncellenir.
import type { Answer, Assignment, Budget, Rating, Topic, User } from "@lokale/contracts";
import { DAY, MINUTE } from "@lokale/domain";
import type { MockState } from "./store";

interface LocalProfileSeed {
  user: Omit<User, "createdAt" | "avatarUrl">;
  /** hedef medyan yanıt (dk), yanıt oranı (0-1), Local Score (0-100), geçmiş atama sayısı */
  history: { median: number; rate: number; score: number; count: number } | null;
}

const T = (id: string, name: string, p: Partial<User>): Omit<User, "createdAt" | "avatarUrl"> => ({
  id,
  name,
  color: "kobalt",
  homeCity: "istanbul",
  homeDistrict: null,
  interests: [],
  verified: false,
  dailyLimit: 2,
  ...p,
});

const PEOPLE: LocalProfileSeed[] = [
  // Turistler
  { user: T("elif", "Elif", { color: "erik", homeCity: "ankara", homeDistrict: "cankaya", interests: ["local_food", "budget"] }), history: null },
  { user: T("can", "Can", { color: "yosun", homeCity: "izmir", homeDistrict: "alsancak", interests: ["route", "safe_places"] }), history: null },
  { user: T("efe", "Efe Genç", { color: "deniz", homeCity: "ankara", homeDistrict: "kizilay", interests: ["nightlife", "route"] }), history: null },
  // Senaryonun lokalleri
  {
    user: T("mert", "Mert", { color: "kobalt", homeDistrict: "kadikoy", interests: ["local_food", "nightlife", "route"], verified: true }),
    history: { median: 20, rate: 0.92, score: 88, count: 25 },
  },
  {
    user: T("zeynep", "Zeynep", { color: "safran", homeDistrict: "moda", interests: ["hidden_gem", "local_food", "route"], verified: true }),
    history: { median: 25, rate: 0.95, score: 91, count: 22 },
  },
  {
    user: T("deniz", "Deniz", { color: "deniz", homeDistrict: "besiktas", interests: ["nightlife", "hidden_gem", "safe_places"], verified: true }),
    history: null,
  },
  // Ek lokaller (Mert ve Zeynep'in önüne geçmemeli: yerel yemek ilgisi yok)
  {
    user: T("caglar", "Çağlar Fidan", { color: "yosun", homeDistrict: "beyoglu", interests: ["nightlife", "hidden_gem"], verified: true }),
    history: { median: 35, rate: 0.85, score: 79, count: 14 },
  },
  {
    user: T("serkan", "Serkan Dağaşan", { color: "erik", homeDistrict: "uskudar", interests: ["route", "safe_places"], verified: true, dailyLimit: 3 }),
    history: { median: 40, rate: 0.8, score: 84, count: 12 },
  },
  {
    user: T("yagmur", "Yağmur Arpa", { color: "safran", homeDistrict: "sariyer", interests: ["route", "hidden_gem"], verified: false }),
    history: { median: 55, rate: 0.74, score: 76, count: 9 },
  },
  {
    user: T("melike", "Melike Kaplan", { color: "kobalt", homeDistrict: "fatih", interests: ["safe_places", "budget"], verified: true }),
    history: { median: 30, rate: 0.88, score: 86, count: 16 },
  },
];

interface ArchiveSeed {
  localId: string;
  touristId: string;
  topic: Topic;
  budget: Budget;
  district: string | null;
  q: string;
  a: string;
  daysAgo: number;
  useful: number;
  responseMin: number;
}

const ARCHIVE: ArchiveSeed[] = [
  { localId: "zeynep", touristId: "can", topic: "route", budget: "low", district: "moda", q: "Moda'da sakin bir sahil yürüyüşü için en iyi saat?", a: "Hafta içi sabah 9'dan önce git. Akşamüstü sahil çok kalabalık oluyor.", daysAgo: 11, useful: 24, responseMin: 22 },
  { localId: "zeynep", touristId: "efe", topic: "local_food", budget: "low", district: "moda", q: "Moda'da kahvaltı için turistik olmayan bir yer?", a: "Ana caddeden bir sokak içeri gir; küçük esnaf kahvaltıcıları hem ucuz hem sakin.", daysAgo: 26, useful: 27, responseMin: 19 },
  { localId: "mert", touristId: "can", topic: "route", budget: "low", district: "kadikoy", q: "Kadıköy'den Adalar'a gitmenin en pratik yolu?", a: "İskeledeki vapur saatlerine bak, hafta sonu ilk seferlerden birine bin. Öğlene doğru çok doluyor.", daysAgo: 17, useful: 31, responseMin: 15 },
  { localId: "deniz", touristId: "efe", topic: "safe_places", budget: "mid", district: "besiktas", q: "Beşiktaş'ta maç günü nerelerden uzak durmalıyım?", a: "Stadyum çevresi ve çarşı maçtan iki saat önce dolar. O saatlerde sahil yolunu kullan.", daysAgo: 24, useful: 18, responseMin: 31 },
  { localId: "mert", touristId: "efe", topic: "nightlife", budget: "mid", district: "kadikoy", q: "Kadıköy'de gece 1'den sonra açık, sakin bir yer?", a: "Çarşı içindeki barlar geç saate kadar açık ama hafta sonu çok kalabalık. Hafta içi çok daha rahat.", daysAgo: 30, useful: 12, responseMin: 24 },
  { localId: "mert", touristId: "can", topic: "local_food", budget: "low", district: "kadikoy", q: "Kadıköy'de ucuz ve yerel bir akşam yemeği önerisi?", a: "Çarşı'daki esnaf lokantaları akşam 8'e kadar açık, kişi başı uygun. Hafta içi git, hafta sonu kuyruk oluyor.", daysAgo: 12, useful: 21, responseMin: 18 },
  { localId: "zeynep", touristId: "can", topic: "local_food", budget: "low", district: "moda", q: "Moda'da öğrenci bütçesiyle nerede yenir?", a: "Moda Caddesi pahalı. Bir sokak arkadaki ev yemekçilerine bak, çok daha uygun.", daysAgo: 20, useful: 15, responseMin: 27 },
  { localId: "caglar", touristId: "efe", topic: "hidden_gem", budget: "mid", district: "beyoglu", q: "Beyoğlu'nda kalabalıktan uzak, manzaralı bir teras?", a: "İstiklal'in arka sokaklarında, Galata'ya bakan küçük teraslar var. Gün batımından yarım saat önce git, yer kalmıyor.", daysAgo: 8, useful: 19, responseMin: 33 },
  { localId: "serkan", touristId: "can", topic: "route", budget: "low", district: "uskudar", q: "Üsküdar'da yarım günde ne gezilir?", a: "Kız Kulesi'ne sahilden yürü, sonra Çengelköy'e kadar devam et. Dönüşte vapurla Beşiktaş'a geç.", daysAgo: 15, useful: 22, responseMin: 41 },
  { localId: "melike", touristId: "efe", topic: "safe_places", budget: "low", district: "fatih", q: "Fatih'te akşam tek başına yürümek güvenli mi?", a: "Sultanahmet ve çevresi akşam da kalabalık, rahat yürürsün. Ara sokaklarda gece geç saatte ana yoldan ayrılma.", daysAgo: 6, useful: 14, responseMin: 28 },
  { localId: "yagmur", touristId: "can", topic: "hidden_gem", budget: "mid", district: "sariyer", q: "Sarıyer'de hafta sonu kaçamak için sakin bir koy?", a: "Rumeli Feneri tarafındaki küçük koylar hafta içi bomboş. Hafta sonu sabah erken git, öğlene doğru doluyor.", daysAgo: 19, useful: 9, responseMin: 52 },
  { localId: "caglar", touristId: "can", topic: "nightlife", budget: "high", district: "beyoglu", q: "Beyoğlu'nda canlı müzik dinlenebilecek bir yer?", a: "Asmalımescit'teki küçük caz barlarına bak. Hafta içi giriş ücreti yok, hafta sonu rezervasyon yaptır.", daysAgo: 3, useful: 11, responseMin: 37 },
];

/** Deterministik sözde rastgele (seed değişmesin). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function buildSeed(now: number): Omit<MockState, "offsetMs" | "reassignAfterMinutes" | "seq" | "rev" | "lastChannels"> {
  const users: User[] = PEOPLE.map((p) => ({ ...p.user, avatarUrl: null, createdAt: now - 120 * DAY }));
  const questions: MockState["questions"] = [];
  const assignments: Assignment[] = [];
  const answers: Answer[] = [];
  const ratings: Rating[] = [];
  const messages: MockState["messages"] = [];
  const usefulBoost: Record<string, number> = {};
  let n = 0;
  const id = (p: string) => `${p}_s${++n}`;

  // 1) Arşiv soru-cevapları (popüler sorular + benzer cevaplar)
  for (const a of ARCHIVE) {
    const createdAt = now - a.daysAgo * DAY - 3 * 60 * MINUTE;
    const qid = id("q");
    const asg: Assignment = {
      id: id("a"), questionId: qid, localId: a.localId, attempt: 1, assignedAt: createdAt,
      deadline: createdAt + 30 * MINUTE, status: "answered", resolvedAt: createdAt + a.responseMin * MINUTE,
    };
    const ans: Answer = {
      id: id("ans"), questionId: qid, localId: a.localId, text: a.a, templateId: null, archived: true,
      createdAt: asg.resolvedAt!,
    };
    questions.push({
      id: qid, touristId: a.touristId, city: "istanbul", district: a.district, text: a.q, topic: a.topic,
      budget: a.budget, status: "answered", attemptCount: 1, currentAssignmentId: asg.id, createdAt,
    });
    assignments.push(asg);
    answers.push(ans);
    // Asıl soranın değerlendirmesi (Local Score'a girer).
    ratings.push({ id: id("r"), answerId: ans.id, touristId: a.touristId, useful: true, upToDate: true, trustworthy: true, createdAt: ans.createdAt + MINUTE });
    // Arşiv kartındaki "faydalı" sayısı: sonradan okuyanların oyları (Local Score'a girmez).
    usefulBoost[ans.id] = a.useful - 1;
  }

  // 2) Sentetik geçmiş: medyan süre, yanıt oranı ve Local Score hedeflerine yakın.
  //    Arşiv kayıtları da bu istatistiklere girer; hedefler buna göre kabaca tutar.
  PEOPLE.forEach((p, pi) => {
    if (!p.history) return;
    const r = rng(pi + 7);
    const { median, rate, score, count } = p.history;
    const answeredN = Math.round(count * rate);
    const usefulN = Math.round(answeredN * (score / 100));
    for (let i = 0; i < count; i++) {
      const assignedAt = now - Math.floor(1 + r() * 27) * DAY - Math.floor(r() * 600) * MINUTE;
      const qid = id("qh");
      const isAnswered = i < answeredN;
      // medyan etrafında simetrik dağılım: 0.5x … 1.5x
      const factor = 0.5 + i / Math.max(1, answeredN - 1);
      const mins = Math.max(3, Math.round(median * factor));
      const asg: Assignment = {
        id: id("ah"), questionId: qid, localId: p.user.id, attempt: 1, assignedAt, deadline: assignedAt + 30 * MINUTE,
        status: isAnswered ? "answered" : "expired",
        resolvedAt: isAnswered ? assignedAt + mins * MINUTE : assignedAt + 30 * MINUTE,
      };
      assignments.push(asg);
      questions.push({
        id: qid, touristId: "anon", city: "istanbul", district: p.user.homeDistrict, text: "(geçmiş soru)",
        topic: p.user.interests[0] ?? "route", budget: "mid", status: isAnswered ? "answered" : "open_pool",
        attemptCount: 1, currentAssignmentId: asg.id, createdAt: assignedAt,
      });
      if (isAnswered) {
        const ans: Answer = { id: id("ansh"), questionId: qid, localId: p.user.id, text: "(geçmiş cevap)", templateId: null, archived: false, createdAt: asg.resolvedAt! };
        answers.push(ans);
        ratings.push({ id: id("rh"), answerId: ans.id, touristId: "anon", useful: i < usefulN, upToDate: true, trustworthy: true, createdAt: ans.createdAt + MINUTE });
      }
    }
  });

  return { users, questions, assignments, answers, ratings, messages, notifications: [], reports: [], usefulBoost };
}
