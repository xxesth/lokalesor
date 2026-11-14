# Kararlar (ADR)

Format: `ADR-NNN — Başlık` · Durum (Kabul / Değişti → ADR-xxx / İptal) · Tarih · Gerekçe.
Kabul edilmiş bir kararı değiştirmek için yeni bir ADR açılır, eskisi silinmez, durumu güncellenir.

## ADR-001 — Next.js (App Router) + TypeScript + Tailwind
Kabul (kapsamı daraldı → ADR-016) · 2026-11-13
Next.js artık **sadece ön yüz** (`apps/web`) için kullanılıyor. API route'u yok.

## ADR-002 — Repository arayüzü + adapter deseni
Kabul · 2026-11-13
UI veri kaynağını tanımaz. Mock'tan gerçek arka uca geçerken UI değişmez. Ekip sözleşme üzerinden paralel çalışabilir.

## ADR-003 — İlk faz MockAdapter ile
Kabul · 2026-11-13
1 günde arka uç kurmadan, yeniden atama dahil tüm akışı göstermek için. Mock tarayıcı içinde çalışır ve sekmeleri localStorage `storage` olayıyla senkronlar (2026-11-14: BroadcastChannel'dan geçildi; ayrı pencerelerde sinyal veriden önce gelip eski veri okunuyordu). Mock hile yapmaz: her çağrı `async`'tir, ID ve zamanı mock üretir, hataları gerçek bir arka uçtaki gibi fırlatır.

## ADR-004 — Veritabanı: kendi Postgres'imiz
Kabul · 2026-11-13 (API kısmı değişti → ADR-016)
Yerelde `docker-compose` ile çalışır. Ücretsizdir, kontrol bizdedir, standart Postgres olduğu için taşınabilir.

## ADR-005 — Supabase kullanılmıyor
İptal edilen aday · 2026-11-13
Self-host sürümü ~10 container ve 2-4 GB RAM gerektiriyor. Ekip kontrolün kendisinde olmasını istiyor. Ölçeklenebilirlik açısından düz Postgres'ten bir farkı yok.

## ADR-006 — Realtime: SSE
Kabul (yeri değişti → ADR-019) · 2026-11-13
Bize sadece sunucudan istemciye sinyal gönderilmesi yetiyor. Yazma işlemleri HTTP POST ile yapılıyor. Tarayıcı kopan bağlantıyı kendisi yeniden kuruyor. Gecikme yerelde 10 ms'nin altında, internette 50-150 ms.

## ADR-007 — ORM: Drizzle
Kabul · 2026-11-13
Hafif ve SQL'e yakın. `FOR UPDATE SKIP LOCKED` ve kısmi index gibi ince ayarları doğrudan yazdırıyor.

## ADR-008 — Auth: Better Auth
Kabul · 2026-11-13
`apps/api` içinde çalışır ve Postgres'e yazar. Demoda hazır kullanıcılar seed ile oluşturulur.

## ADR-009 — Yeniden atama `instrumentation.ts` içinde
Değişti → ADR-020 · 2026-11-13

## ADR-010 — İş mantığı veritabanına gömülmez
Kabul · 2026-11-13
Kurallar `packages/domain` içinde saf TS olarak yazılır. `packages/core` bu kuralları transaction içinde çağırır. Stored procedure ve trigger yalnızca istatistik gibi türetilmiş veriler için kullanılır.

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
`docs/handoff/screens/*.html` dosyalarında stiller inline yazılmış ve bileşen yapısı yok. Ölçü, renk ve metin için doğruluk kaynağı bu dosyalar, kod yapısı için `structure.md`. `data/seed.json` ise sözleşme tiplerine çevrilerek aktarılır: ID ve enum değerleri İngilizce, zamanlar epoch ms.

## ADR-015 — Tek süre modeli: `T`
Kabul · 2026-11-14
Ayrı bir "kabul süresi" ve "cevap süresi" yok, tek bir `T` (`reassignAfterMinutes`) var. Gerçek ortamda 30 dk, demoda 3 dk (2026-11-14: 1 dk → 3 dk, sunumda konuşmaya zaman kalsın diye).
Turiste gösterilen "~20 dk" değeri `T` değil, lokalin geçmişteki medyan yanıt süresi. Bu yüzden demoda ikisinin farklı görünmesi tutarlı.

## ADR-016 — Ayrık yapı: web + api + realtime + worker
Kabul · 2026-11-14
Modüler monolitin yerine dört ayrı servis kullanılır:
- `apps/web`: Next.js, sadece arayüz.
- `apps/api`: Fastify, HTTP ve auth.
- `apps/realtime`: SSE bağlantıları.
- `apps/worker`: zamanlanmış işler.

Servisler birbirini doğrudan çağırmaz, Postgres ve Redis üzerinden haberleşir. Her servis kendi yüküne göre ölçeklenir, bir servisin çökmesi diğerlerini etkilemez.
Bedeli: ~1-2 günlük kurulum ve servisler arası hata ayıklama.

## ADR-017 — Monorepo: pnpm workspaces + Turborepo
Kabul · 2026-11-14
Tipler ve domain kodu paket olarak paylaşılır. Tüm servisler tek komutla çalışır (`pnpm dev`). Build cache sağlar.

## ADR-018 — API: Fastify + REST + zod + OpenAPI
Kabul · 2026-11-14
Fastify hızlı ve hafif. İstek/cevap şemaları `@lokale/contracts` içindeki zod tanımlarından gelir, OpenAPI dokümanı bunlardan otomatik üretilir (SDD raporunda kullanılır). tRPC ön yüze sıkı bağlandığı için, NestJS de ağır olduğu için seçilmedi.

## ADR-019 — Realtime: ayrı SSE servisi + Redis pub/sub + kısa ömürlü token
Kabul · 2026-11-14
- `apps/realtime` açık SSE bağlantılarını tutar.
- `core` (api ve worker) bir değişiklikten sonra Redis'e yayın yapar, realtime bu yayını ilgili bağlantılara iletir.
- Olaylar veri taşımaz, sadece sinyal taşır.
- Bağlanmak için api'den alınan **5 dk ömürlü imzalı token (JWT)** kullanılır. realtime bu token'ı veritabanına sormadan doğrular. `inbox:` ve `notifications:` kanalları sadece token'daki kullanıcıya açıktır.

## ADR-020 — Yeniden atama: BullMQ gecikmeli işler + yedek tarama
Kabul · 2026-11-14
- Atama oluşturulduğunda `deadline` anına bir BullMQ işi planlanır (`jobId = assignmentId`).
- `worker` bu işi alınca atamayı `FOR UPDATE SKIP LOCKED` ile kilitler. Atama hâlâ `pending` ise yeniden atama yapılır, değilse iş hiçbir şey yapmadan biter (idempotent).
- Gözden kaçan atamalar için dakikada bir tarama işi çalışır.

Sürekli tarama yapmak yerine iş tam zamanında çalışır. Redis zaten var olduğu için ek bir bağımlılık getirmez.

## ADR-021 — Reverse proxy: production'da Caddy, geliştirmede Next.js rewrite'ları
Kabul · 2026-11-14
Tarayıcı açısından tek adres olur (`/`, `/api`, `/events`), CORS ve cookie sorunu çıkmaz. Caddy SSL'i otomatik yönetir.

## ADR-022 — Yerel ortam: docker-compose ile Postgres + Redis
Kabul · 2026-11-14
Servisler Docker'da değil, `pnpm dev` ile yerelde çalışır. Hızlı yeniden başlatma, kolay hata ayıklama.

## ADR-023 — Faz 1 ilk günden monorepo yapısında
Kabul · 2026-11-14
Demo `apps/web` + `packages/contracts` + `packages/domain` olarak yazılır. Faz 2'de dosya taşımak gerekmez.

## ADR-024 — Log: pino · Test: Vitest
Kabul · 2026-11-14
JSON log formatı servisler arası iz sürmeyi kolaylaştırır. Vitest bütün paketlerde kullanılır.

## ADR-025 — Arka uç dili: TypeScript (Rust değerlendirildi)
Kabul · 2026-11-14
Rust daha yüksek performans sunuyor, ama:
- tipler ve domain kodu iki dilde tutulmak zorunda kalırdı,
- Better Auth gibi hepsi bir arada bir auth çözümü yok,
- ekibin öğrenme maliyeti yüksek.

Bu ölçekte darboğaz Postgres olduğu için performans farkı hissedilmez. Gerekirse ileride sadece realtime servisi Rust'a taşınabilir.

## ADR-026 — Sunucu use-case'leri `packages/core`'da
Kabul · 2026-11-14
api (ör. `declineAssignment`) ve worker (süre dolması) aynı yeniden atama mantığını kullanır. Bu yüzden transaction, Redis yayını ve iş kuyruğu kodu servislerde değil, ortak bir pakette (`packages/core`) yazılır. Servisler sadece giriş noktasıdır: route, job handler.
