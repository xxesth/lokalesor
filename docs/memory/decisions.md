# Kararlar (ADR)

Format: `ADR-NNN — Başlık` · Durum (Kabul / Açık / İptal) · Tarih · Gerekçe.
Kabul edilmiş bir kararı değiştirmek için yeni bir ADR aç ve eski ADR'yi "İptal → ADR-xxx" olarak işaretle.

## ADR-001 — Next.js (App Router) + TypeScript + Tailwind
Kabul · 2026-11-13
Ön yüz ve API aynı repoda tutulur, ayrı bir backend projesine gerek kalmaz. Ekip React, TS ve Tailwind biliyor.

## ADR-002 — Repository arayüzü + adapter deseni
Kabul · 2026-11-13
UI veri kaynağını tanımaz. Mock'tan gerçek arka uca geçerken UI değişmez. Ekip sözleşme üzerinden paralel çalışabilir.

## ADR-003 — İlk faz MockAdapter ile
Kabul · 2026-11-13
1 günde arka uç kurmadan, yeniden atama dahil tüm akışı göstermek için. Mock tarayıcı içinde çalışır ve sekmeleri `BroadcastChannel` ile senkronlar. Mock hile yapmaz: her çağrı `async`'tir, ID ve zamanı mock üretir, hataları gerçek bir arka uçtaki gibi fırlatır.

## ADR-004 — Arka uç: kendi Postgres'imiz + Next.js API
Kabul · 2026-11-13
Yerelde `docker-compose` ile sadece Postgres çalışır (~150 MB). Ücretsizdir, kontrol tamamen bizdedir, standart Postgres olduğu için taşınabilir.

## ADR-005 — Supabase kullanılmıyor
İptal edilen aday · 2026-11-13
Self-host sürümü ~10 container ve 2-4 GB RAM gerektiriyor. Ekip kontrolün kendisinde olmasını istiyor. Ölçeklenebilirlik açısından düz Postgres'ten bir farkı yok.

## ADR-006 — Realtime: SSE + Postgres LISTEN/NOTIFY
Kabul · 2026-11-13
Bize sadece sunucudan istemciye sinyal gönderilmesi yetiyor. Yazma işlemleri zaten HTTP POST ile yapılıyor. SSE Next.js route handler'ında çalışıyor (WebSocket için ayrı bir sunucu gerekirdi). Tarayıcı kopan bağlantıyı kendisi yeniden kuruyor. Gecikme yerelde 10 ms'nin altında, internette 50-150 ms.
Sınırlar: kalıcı bağlantı gerektiği için Vercel serverless'ta çalışmaz, `next start` ile çalıştırılır. Çok instance'a geçilince Redis pub/sub eklenir.

## ADR-007 — ORM: Drizzle
Kabul · 2026-11-13
Hafif ve SQL'e yakın. `FOR UPDATE SKIP LOCKED` ve kısmi index gibi ince ayarları doğrudan yazdırıyor.

## ADR-008 — Auth: Better Auth
Kabul · 2026-11-13
Kendi Postgres'imize yazıyor ve TypeScript ile iyi çalışıyor. Demoda hazır kullanıcılar seed ile oluşturulur.

## ADR-009 — Yeniden atama zamanlayıcısı `instrumentation.ts` içinde
Kabul · 2026-11-13
Her 15 sn'de bir `expireAssignments()` çalışır. `SKIP LOCKED` sayesinde birden fazla instance aynı atamayı iki kez işlemez. Ölçek büyüyünce bu iş ayrı bir worker'a taşınır. `pg_cron` için özel bir Postgres imajı gerekeceğinden tercih edilmedi.

## ADR-010 — İş mantığı veritabanına gömülmez
Kabul · 2026-11-13
Kurallar `domain/` içinde saf TS olarak yazılır. `server/services` bu kuralları transaction içinde çağırır. Stored procedure ve trigger yalnızca istatistik gibi türetilmiş veriler için kullanılır.

## ADR-011 — Dil
Kabul · 2026-11-13
Kod ve veritabanı isimleri İngilizce. Arayüz metinleri ve dokümanlar Türkçe ("sen" diliyle).

## ADR-012 — Otomatik mesajlar kural tabanlı, LLM yok
Kabul · 2026-11-13
Brief gereği. İleride LLM eklenirse literatür ve benchmark ile gerekçelendirilmesi gerekiyor.

## ADR-013 — Görsel kimlik Claude Design handoff'undan alınır
Kabul · 2026-11-14
Brief 3.2'deki görsel kimlik önerisinin yerine `docs/handoff/` geçer. Brief'te lacivert, turuncu, yeşil ve Inter vardı. Handoff'ta durum şöyle:
- Gri tonlu bir sistem arayüzü kullanılıyor.
- Her kullanıcının bir kişi rengi var (kobalt, safran, yosun, erik, deniz).
- Nar kırmızısı sadece aciliyet için kullanılıyor.
- Birincil buton siyah.
- Font Schibsted Grotesk; yerelde yükleniyor, Google Fonts'a bağımlılık yok.

Gerekçe: Bu yapıda renk bir insanı temsil ediyor, sistem nötr kalıyor. "İnsan cevabı + güven" vaadini daha iyi taşıyor.

## ADR-014 — Handoff HTML'leri referanstır, kopyalanmaz
Kabul · 2026-11-14
`docs/handoff/screens/*.html` dosyalarında stiller inline yazılmış ve bileşen yapısı yok. Ölçü, renk ve metin için doğruluk kaynağı bu dosyalar, kod yapısı için `structure.md`. `data/seed.json` ise `src/data/mock/seed.ts` dosyasına sözleşme tiplerine çevrilerek aktarılır: ID ve enum değerleri İngilizce, zamanlar epoch ms.

## ADR-015 — Tek süre modeli: `T`
Kabul · 2026-11-14
Handoff README'sindeki 1 numaralı açık karar için. Ayrı bir "kabul süresi" ve "cevap süresi" yok, tek bir `T` (`reassignAfterMinutes`) var. Gerçek ortamda 30 dk, demoda 1 dk.
Turiste gösterilen "~20 dk" değeri `T` değil, lokalin geçmişteki medyan yanıt süresi. Bu yüzden demoda ikisinin farklı görünmesi tutarlı.
