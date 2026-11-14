# Mimari

## Yığın
| Katman | Seçim |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Ön yüz | Next.js (App Router), TypeScript strict, Tailwind v4, TanStack Query |
| API | Fastify + zod (şemalar `@lokale/contracts`'tan) + OpenAPI (otomatik) |
| Auth | Better Auth (`apps/api` içinde, Postgres'e yazar) |
| Realtime | Ayrı SSE servisi (Fastify) + Redis pub/sub + kısa ömürlü JWT (`jose`) |
| Zamanlanmış işler | BullMQ (Redis) gecikmeli işler + dakikada bir yedek tarama |
| Veritabanı | PostgreSQL + Drizzle |
| Proxy | Production'da Caddy, geliştirmede Next.js rewrite'ları |
| Log / test | pino / Vitest |
| Demo (Faz 1) | MockAdapter: tarayıcı içinde çalışır, sekmeler localStorage `storage` olayıyla senkron olur |

## Servisler
```
                 ┌──────────── Caddy (tek adres) ────────────┐
Tarayıcı ───────►│  /        /api            /events         │
                 └───┬─────────┬────────────────┬────────────┘
                     ▼         ▼                ▼
                   web        api           realtime
                 (Next.js)  (Fastify)       (Fastify, SSE)
                               │                  ▲
                               ▼                  │ abone
                           Postgres ◄── worker    │
                                          │       │
                api, worker ──► Redis (pub/sub + BullMQ)
```

| Servis | Görevi | Port (geliştirme) | Ölçek |
|---|---|---|---|
| `web` | Sadece arayüz. Veriye `HttpAdapter` üzerinden ulaşır. | 3000 | CDN veya kopya sayısı |
| `api` | Doğrulama → `core` use-case'i → JSON. Auth ve realtime token'ı da burada. | 4000 | Yatay (state tutmaz) |
| `realtime` | SSE bağlantılarını tutar, Redis'ten gelen sinyali ilgili bağlantılara iletir. | 4001 | Yatay (her kopya Redis'e abone) |
| `worker` | BullMQ işleri: atama süresi, yedek tarama, ileride istatistik yenileme. | — | Genelde 1, gerekirse daha fazla (`SKIP LOCKED`) |
| Postgres | Tek doğru kaynak | 5432 | Dikey + okuma replikası, ileride şehre göre sharding |
| Redis | Pub/sub + iş kuyruğu | 6379 | Tek instance |

**Kurallar**
- Tarayıcı sadece `api`'ye ve `realtime`'a bağlanır.
- Servisler birbirini çağırmaz, haberleşme Postgres ve Redis üzerinden olur.
- `web`, `@lokale/db` ve `@lokale/core` paketlerini import edemez.

## Paket bağımlılıkları
```
contracts  ←  domain  ←  core  ←  api, worker
    ↑            ↑         ↑
    │            │         db
   realtime     web (mock + UI), contracts
```
- `contracts`: tipler, zod şemaları, kanal isimleri, hata kodları. Hiçbir pakete bağımlı değil.
- `domain`: saf kurallar. Sadece `contracts`'a bağımlı.
- `db`: Drizzle şeması ve client.
- `core`: transaction'lar, use-case'ler, Redis yayını ve iş kuyruğu (`domain` + `db` kullanır).

## Akış: soru sorma
1. `web` → `POST /api/questions`.
2. `api` girdiyi zod ile doğrular, aktörü oturumdan alır ve `core.askQuestion()` çağırır.
3. Tek bir transaction içinde: soru yazılır → adaylar `FOR UPDATE SKIP LOCKED` ile kilitlenir → `domain.rankCandidates()` → Assignment + otomatik mesaj + Notification oluşturulur.
4. Commit'ten sonra:
   - BullMQ'ya `deadline` anı için bir iş eklenir (`jobId = assignmentId`).
   - Redis'e `question:{id}`, `inbox:{localId}` ve `notifications:{localId}` sinyalleri yayınlanır.
5. `realtime` sinyalleri ilgili SSE bağlantılarına iletir. İstemci ilgili query'yi geçersiz kılar ve `api`'den veriyi yeniden çeker.

## Akış: yeniden atama
Tetikleyiciler: BullMQ işinin zamanı gelir (`worker`), lokal "Bilmiyorum, sıradakine geçsin" der (`api`) ya da yedek tarama gözden kaçan bir atama bulur (`worker`). Üçü de aynı fonksiyonu çağırır: `core.closeAndReassign(assignmentId, reason)`.
1. Atama `FOR UPDATE SKIP LOCKED` ile kilitlenir. Hâlâ `pending` değilse fonksiyon hiçbir şey yapmadan çıkar (idempotent).
2. Atama `expired` ya da `declined` olarak işaretlenir.
3. `domain.planNextStep()` çağrılır: sıradaki lokal varsa yeni atama + "yeniden atandı" mesajı + yeni iş oluşturulur. Deneme sınırı aşıldıysa soru `open_pool` durumuna geçer ve havuz mesajı yazılır.
4. Commit → Redis'e yayın.

## Realtime protokolü
1. `web` → `POST /api/realtime/token` → `{ token, expiresAt }` (JWT, 5 dk, içinde `sub = userId`).
2. `web` → `GET /events?token=…&channels=question:42,inbox:u1` (`EventSource` header gönderemediği için token query string'de).
3. `realtime` token'ı imzasından doğrular, veritabanına gitmez. Kanal yetkisi: `inbox:{x}` ve `notifications:{x}` için `x = sub` olmalı. `question:*` kanalı giriş yapmış herkese açık, çünkü olay veri taşımıyor ve veri api'den yetki kontrolüyle okunuyor.
4. Olay formatı: `event: changed`, `data: {"channel":"question:42","at":1731600000000}`.
5. Bağlantı koparsa istemci yeni bir token alıp yeniden bağlanır. 25 sn'de bir heartbeat gönderilir.

## Ölçek ve performans
| Konu | Yaklaşım |
|---|---|
| Kritik yazmalar | Tek transaction ile atomik. Aktör her zaman oturumdan alınır. |
| Kapasite yarışı | `SELECT … FOR UPDATE SKIP LOCKED` |
| Süre takibi | BullMQ ile tam zamanında. Yedek tarama kısmi index kullanır: `assignments(deadline) WHERE status='pending'` |
| Eşleştirme | Index'ler: `users(home_city)`, `interests` üzerinde GIN; günlük sayaç ayrı kolonda |
| İstatistik | `local_stats` materialized view; `worker` 5 dk'da bir yeniler. Local Score değerlendirme anında artımlı güncellenir. |
| Benzer cevap arama | Postgres full-text search (`tsvector` + GIN, Türkçe sözlük) |
| Listeler | Cursor tabanlı sayfalama |
| Realtime | Sadece sinyal yayını; token doğrulaması DB'ye gitmez; kanallar filtreli |
| Ön yüz | Route bazlı code splitting. Sayfalar server component, `"use client"` sadece yaprak bileşenlerde. |
| Gözlemlenebilirlik | pino JSON log + her istekte `requestId` |
| Test edilebilirlik | Zaman (`now`) enjekte edilir. Mock'ta "zamanı ileri sar" özelliği var. |

**İleride (raporda anlatılacak):** okuma replikası, şehre göre sharding (sorular şehir dışına çıkmadığı için doğal bölme anahtarı şehir), realtime servisini Rust'a taşıma seçeneği.

## Parametreler (`packages/domain/src/config.ts`)
| Ad | Varsayılan | Demo | Not |
|---|---|---|---|
| `reassignAfterMinutes` (T) | 30 | 3 | EM simülasyonla güncelleyecek |
| `maxAttempts` | 3 | 3 | Aşılırsa soru açık havuza düşer |
| `defaultDailyLimit` | 2 | 2 | Lokal 1-5 arası ayarlayabilir |
| `statsWindowDays` | 30 | 30 | Medyan süre ve yanıt oranı penceresi |
| `responseRateWindowHours` | 24 | 24 | Airbnb tanımı |
| `urgentThresholdMs` | 60 000 | 60 000 | Son 1 dk → nar |
| `matchWeights` | topic 3 · district 2 · speed 1 | — | EM'den gelecek |
| `fallbackEtaText` | "genelde 1 saat içinde" | — | Veri yoksa gösterilir |
