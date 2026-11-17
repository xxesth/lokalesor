// Demo verisi: docs/handoff/data/seed.json yapısından sözleşme tiplerine çevrildi (ADR-014).
// Kullanıcı isimleri ekip tarafından verildi (tasarımdaki Elif/Mert/Zeynep yerine).
// Senaryo: Efe'nin (turist) Kadıköy/Yerel yemek sorusunda eşleştirme Mert Özçelik'i 1.,
// Nevin Arslan'ı 2. sıraya koymalı (todo 1.4). Diğer İstanbul lokallerinin "Yerel yemek" ilgisi yok.
// Geçmiş atama/cevap/değerlendirmeler sentetik üretilir; istatistikler bunlardan HESAPLANIR,
// böylece Nevin cevap verince profil kartı gerçekten güncellenir.
import type { Answer, Assignment, Budget, CityId, Rating, Topic, User } from "@lokale/contracts";
import { DAY, MINUTE, messages as msg } from "@lokale/domain";

const openPool = msg.openPool;
import type { MockState } from "./store";

/**
 * Seed içeriği (kullanıcılar, arşiv) değişince bunu artır: tarayıcılardaki eski demo verisi
 * bir sonraki açılışta kendiliğinden yenilenir.
 */
export const SEED_VERSION = 3;

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
  // --- Senaryo ---
  // Turist: Ankara'dan İstanbul'a gelmiş
  { user: T("efe", "Efe Genç", { color: "erik", homeCity: "ankara", homeDistrict: "cankaya", interests: ["local_food", "budget"] }), history: null },
  // 1. lokal (cevap vermeyecek, süre dolacak)
  {
    user: T("mert", "Mert Özçelik", { color: "kobalt", homeDistrict: "kadikoy", interests: ["local_food", "nightlife", "route"], verified: true }),
    history: { median: 20, rate: 0.92, score: 88, count: 25 },
  },
  // 2. lokal (yeniden atanan, cevaplayan)
  {
    user: T("nevin", "Nevin Arslan", { color: "safran", homeDistrict: "moda", interests: ["hidden_gem", "local_food", "route"], verified: true }),
    history: { median: 25, rate: 0.95, score: 91, count: 22 },
  },

  // --- Diğer İstanbul lokalleri (Yerel yemek ilgisi yok → senaryoda öne geçmezler) ---
  {
    user: T("merve", "Merve Güler", { color: "deniz", homeDistrict: "besiktas", interests: ["nightlife", "hidden_gem", "safe_places"], verified: true }),
    history: { median: 28, rate: 0.9, score: 85, count: 15 },
  },
  {
    user: T("caglar", "Çağlar Fidan", { color: "yosun", homeDistrict: "beyoglu", interests: ["nightlife", "hidden_gem"], verified: true }),
    history: { median: 35, rate: 0.85, score: 79, count: 14 },
  },
  {
    user: T("serkan", "Gündüz Serkan Dağaşan", { color: "erik", homeDistrict: "uskudar", interests: ["route", "safe_places"], verified: true, dailyLimit: 3 }),
    history: { median: 40, rate: 0.8, score: 84, count: 12 },
  },
  {
    user: T("yagmur", "Yağmur Arpa", { color: "safran", homeDistrict: "sariyer", interests: ["route", "hidden_gem"], verified: false }),
    history: { median: 55, rate: 0.74, score: 76, count: 9 },
  },
  {
    user: T("melike", "Melike Kaplan", { color: "yosun", homeDistrict: "fatih", interests: ["safe_places", "budget"], verified: true }),
    history: { median: 30, rate: 0.88, score: 86, count: 16 },
  },

  // --- Türkiye'nin başka şehirleri ---
  { user: T("uzay", "Uzay Çetin", { color: "deniz", homeCity: "izmir", homeDistrict: "alsancak", interests: ["route", "nightlife"], verified: true }), history: { median: 32, rate: 0.87, score: 83, count: 11 } },

  // --- Dünyadan lokaller (İstanbul'a giriş yapınca turist olurlar) ---
  { user: T("gulcin", "Gülçin Büyüközkan Feyzioğlu", { color: "kobalt", homeCity: "paris", homeDistrict: "marais", interests: ["hidden_gem", "local_food"], verified: true }), history: { median: 45, rate: 0.82, score: 90, count: 10 } },
  { user: T("fatih", "Fatih Furkan Altınkaya", { color: "yosun", homeCity: "berlin", homeDistrict: "kreuzberg", interests: ["nightlife", "budget"], verified: true }), history: { median: 38, rate: 0.86, score: 82, count: 13 } },
  { user: T("okkes", "Ökkeş Donbaloğlu", { color: "kobalt", homeCity: "tokyo", homeDistrict: "shibuya", interests: ["local_food", "route"], verified: true }), history: { median: 50, rate: 0.79, score: 87, count: 9 } },
  { user: T("taylan", "Taylan Poyraz Kalfalar", { color: "erik", homeCity: "newyork", homeDistrict: "brooklyn", interests: ["nightlife", "safe_places"], verified: true }), history: { median: 42, rate: 0.84, score: 80, count: 12 } },
  { user: T("muhammed", "Muhammed Ali Karslı", { color: "safran", homeCity: "barselona", homeDistrict: "gracia", interests: ["local_food", "hidden_gem"], verified: false }), history: { median: 60, rate: 0.72, score: 78, count: 8 } },
];

interface ArchiveSeed {
  localId: string;
  touristId: string;
  city: CityId;
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
  // İstanbul
  { localId: "nevin", touristId: "uzay", city: "istanbul", topic: "route", budget: "low", district: "moda", q: "Moda'da sakin bir sahil yürüyüşü için en iyi saat?", a: "Hafta içi sabah 9'dan önce git. Akşamüstü sahil çok kalabalık oluyor.", daysAgo: 11, useful: 24, responseMin: 22 },
  { localId: "nevin", touristId: "fatih", city: "istanbul", topic: "local_food", budget: "low", district: "moda", q: "Moda'da kahvaltı için turistik olmayan bir yer?", a: "Ana caddeden bir sokak içeri gir; küçük esnaf kahvaltıcıları hem ucuz hem sakin.", daysAgo: 26, useful: 27, responseMin: 19 },
  { localId: "mert", touristId: "taylan", city: "istanbul", topic: "route", budget: "low", district: "kadikoy", q: "Kadıköy'den Adalar'a gitmenin en pratik yolu?", a: "İskeledeki vapur saatlerine bak, hafta sonu ilk seferlerden birine bin. Öğlene doğru çok doluyor.", daysAgo: 17, useful: 31, responseMin: 15 },
  { localId: "merve", touristId: "efe", city: "istanbul", topic: "safe_places", budget: "mid", district: "besiktas", q: "Beşiktaş'ta maç günü nerelerden uzak durmalıyım?", a: "Stadyum çevresi ve çarşı maçtan iki saat önce dolar. O saatlerde sahil yolunu kullan.", daysAgo: 24, useful: 18, responseMin: 31 },
  { localId: "mert", touristId: "okkes", city: "istanbul", topic: "nightlife", budget: "mid", district: "kadikoy", q: "Kadıköy'de gece 1'den sonra açık, sakin bir yer?", a: "Çarşı içindeki barlar geç saate kadar açık ama hafta sonu çok kalabalık. Hafta içi çok daha rahat.", daysAgo: 30, useful: 12, responseMin: 24 },
  { localId: "mert", touristId: "uzay", city: "istanbul", topic: "local_food", budget: "low", district: "kadikoy", q: "Kadıköy'de ucuz ve yerel bir akşam yemeği önerisi?", a: "Çarşı'daki esnaf lokantaları akşam 8'e kadar açık, kişi başı uygun. Hafta içi git, hafta sonu kuyruk oluyor.", daysAgo: 12, useful: 21, responseMin: 18 },
  { localId: "nevin", touristId: "gulcin", city: "istanbul", topic: "local_food", budget: "low", district: "moda", q: "Moda'da öğrenci bütçesiyle nerede yenir?", a: "Moda Caddesi pahalı. Bir sokak arkadaki ev yemekçilerine bak, çok daha uygun.", daysAgo: 20, useful: 15, responseMin: 27 },
  { localId: "caglar", touristId: "muhammed", city: "istanbul", topic: "hidden_gem", budget: "mid", district: "beyoglu", q: "Beyoğlu'nda kalabalıktan uzak, manzaralı bir teras?", a: "İstiklal'in arka sokaklarında, Galata'ya bakan küçük teraslar var. Gün batımından yarım saat önce git, yer kalmıyor.", daysAgo: 8, useful: 19, responseMin: 33 },
  { localId: "serkan", touristId: "okkes", city: "istanbul", topic: "route", budget: "low", district: "uskudar", q: "Üsküdar'da yarım günde ne gezilir?", a: "Kız Kulesi'ne sahilden yürü, sonra Çengelköy'e kadar devam et. Dönüşte vapurla Beşiktaş'a geç.", daysAgo: 15, useful: 22, responseMin: 41 },
  { localId: "melike", touristId: "efe", city: "istanbul", topic: "safe_places", budget: "low", district: "fatih", q: "Fatih'te akşam tek başına yürümek güvenli mi?", a: "Sultanahmet ve çevresi akşam da kalabalık, rahat yürürsün. Ara sokaklarda gece geç saatte ana yoldan ayrılma.", daysAgo: 6, useful: 14, responseMin: 28 },
  { localId: "yagmur", touristId: "taylan", city: "istanbul", topic: "hidden_gem", budget: "mid", district: "sariyer", q: "Sarıyer'de hafta sonu kaçamak için sakin bir koy?", a: "Rumeli Feneri tarafındaki küçük koylar hafta içi bomboş. Hafta sonu sabah erken git, öğlene doğru doluyor.", daysAgo: 19, useful: 9, responseMin: 52 },
  { localId: "caglar", touristId: "fatih", city: "istanbul", topic: "nightlife", budget: "high", district: "beyoglu", q: "Beyoğlu'nda canlı müzik dinlenebilecek bir yer?", a: "Asmalımescit'teki küçük caz barlarına bak. Hafta içi giriş ücreti yok, hafta sonu rezervasyon yaptır.", daysAgo: 3, useful: 11, responseMin: 37 },
  // Dünya
  { localId: "gulcin", touristId: "nevin", city: "paris", topic: "hidden_gem", budget: "mid", district: "marais", q: "Marais'de turist kalabalığı olmayan sakin bir avlu?", a: "Rue des Rosiers'den bir sokak içeri gir; küçük konakların iç avluları hafta içi sabah bomboş.", daysAgo: 9, useful: 17, responseMin: 44 },
  { localId: "fatih", touristId: "mert", city: "berlin", topic: "budget", budget: "low", district: "kreuzberg", q: "Kreuzberg'de ucuz ve doyurucu bir akşam yemeği?", a: "Kanal kenarındaki salı ve cuma pazarına git; sokak yemekleri hem ucuz hem çok iyi.", daysAgo: 14, useful: 20, responseMin: 35 },
  { localId: "okkes", touristId: "caglar", city: "tokyo", topic: "local_food", budget: "low", district: "shibuya", q: "Shibuya'da yerel halkın gittiği bir ramen dükkânı?", a: "İstasyonun batı çıkışından ara sokaklara gir; bilet makineli küçük dükkânlar turistik olanlardan hem ucuz hem lezzetli.", daysAgo: 22, useful: 26, responseMin: 48 },
  { localId: "taylan", touristId: "merve", city: "newyork", topic: "safe_places", budget: "mid", district: "brooklyn", q: "Brooklyn'de gece metroya binmek güvenli mi?", a: "Ana hatlarda sorun yok; gece geç saatte kalabalık vagona bin, boş peronlarda bekleme.", daysAgo: 10, useful: 13, responseMin: 40 },
  { localId: "muhammed", touristId: "yagmur", city: "barselona", topic: "local_food", budget: "mid", district: "gracia", q: "Gràcia'da tapas için turistik olmayan bir yer?", a: "Meydanlardaki büyük barlar yerine yan sokaklardaki küçük bodegalara bak; vermut saatinde (öğlen) git.", daysAgo: 5, useful: 10, responseMin: 58 },
];

/** Deterministik sözde rastgele (seed değişmesin). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function buildSeed(now: number): Omit<MockState, "offsetMs" | "reassignAfterMinutes" | "seq" | "rev" | "lastChannels" | "seedVersion"> {
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
      id: qid, touristId: a.touristId, city: a.city, district: a.district, text: a.q, topic: a.topic,
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
        id: qid, touristId: "anon", city: p.user.homeCity, district: p.user.homeDistrict, text: "(geçmiş soru)",
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

  // 3) Açık havuz: deneme sınırı aşılmış iki İstanbul sorusu (lokalin "Açık havuz" ekranı için).
  //    Mert ve Nevin'e atanmamış; senaryodaki kapasiteyi etkilemesin diye atamalar dünden.
  const POOL: { touristId: string; topic: Topic; budget: Budget; district: string | null; q: string; locals: string[]; hoursAgo: number }[] = [
    { touristId: "okkes", topic: "hidden_gem", budget: "low", district: "beyoglu", q: "Beyoğlu'nda kalabalık olmayan, kitap okunabilecek sakin bir kafe var mı?", locals: ["caglar", "serkan", "yagmur"], hoursAgo: 20 },
    { touristId: "taylan", topic: "route", budget: "mid", district: null, q: "İstanbul'da tek günüm var, vapurla en çok yeri nasıl görürüm?", locals: ["merve", "melike", "yagmur"], hoursAgo: 26 },
  ];
  for (const p of POOL) {
    const createdAt = now - p.hoursAgo * 60 * MINUTE;
    const qid = id("qp");
    let t = createdAt;
    p.locals.forEach((localId, i) => {
      assignments.push({
        id: id("ap"), questionId: qid, localId, attempt: i + 1, assignedAt: t, deadline: t + 30 * MINUTE,
        status: "expired", resolvedAt: t + 30 * MINUTE,
      });
      t += 30 * MINUTE;
    });
    questions.push({
      id: qid, touristId: p.touristId, city: "istanbul", district: p.district, text: p.q, topic: p.topic, budget: p.budget,
      status: "open_pool", attemptCount: p.locals.length, currentAssignmentId: null, createdAt,
    });
    messages.push({ id: id("m"), questionId: qid, kind: "open_pool", text: openPool(), createdAt: t });
  }

  return { users, questions, assignments, answers, ratings, messages, notifications: [], reports: [], blocks: [], usefulBoost };
}
