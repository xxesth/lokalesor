# Mimari

## Yığın
| Katman | Seçim |
|---|---|
| Ön yüz + API | Next.js (App Router), TypeScript (strict), Tailwind CSS |
| İstemci cache | TanStack Query |
| Veritabanı | PostgreSQL (yerelde `docker-compose` ile) |
| ORM | Drizzle |
| Auth | Better Auth (Postgres'e yazar) |
| Realtime | SSE (Server-Sent Events) + Postgres `LISTEN/NOTIFY`. Çok instance'a geçilince Redis pub/sub. |
| Zamanlayıcı | `instrumentation.ts` içinde her 15 sn'de bir `expireAssignments()` çalışır |
| Test | Vitest (domain) |
| Demo (1. faz) | **MockAdapter**: tarayıcı içinde çalışır, sekmeler `BroadcastChannel` ile senkron olur |

## Katmanlar
```
app/ (sayfalar, ince)        → sadece feature bileşenlerini yerleştirir
features/*/components        → gösterim
features/*/hooks             → TanStack Query + kanal aboneliği
data/repository.ts           → İSTEMCİ SÖZLEŞMESİ
  ├─ data/mock/              → 1. faz: tarayıcı içi sahte arka uç
  └─ data/http/              → 2. faz: fetch + EventSource ile /api'ye bağlanır
app/api/*                    → ince route handler: girdiyi doğrular, service'i çağırır
server/services/*            → transaction + domain fonksiyonları
server/db, server/realtime   → Drizzle, LISTEN/NOTIFY → SSE
domain/                      → saf TS: tipler, kurallar, eşleştirme, mesajlar, istatistik
```
Bağımlılıklar her zaman aşağı doğru akar. `domain/` hiçbir katmana bağımlı değildir. MockAdapter ve `server/services` **aynı domain fonksiyonlarını** çağırır.

## Akış: soru sorma
1. UI `repo.askQuestion(input)` çağırır.
2. Service tek bir transaction içinde: soruyu yazar → adayları `FOR UPDATE SKIP LOCKED` ile kilitler → `rankCandidates()` ile sıralar → Assignment oluşturur → `messages.assigned()` ile otomatik mesajı yazar → Notification oluşturur.
3. Commit'ten sonra `NOTIFY` gönderilir. Realtime broker bu sinyali ilgili SSE kanallarına iletir (`question:{id}`, `inbox:{localId}`, `notifications:{localId}`).
4. İstemci olayı alınca ilgili query'yi geçersiz kılar ve veriyi yeniden çeker.

**Olaylar veri taşımaz, sadece sinyal taşır.** Yayınlanan mesaj küçük kalır, yetki kontrolü normal okuma yolunda bir kez yapılır.

## Akış: yeniden atama
`expireAssignments(now)` şunları yapar:
- `status='pending' AND deadline < now` koşulunu sağlayan atamaları `SKIP LOCKED` ile alır.
- Atamayı `expired` olarak işaretler.
- `planNextStep()` çağırır: sıradaki lokal varsa yeni atama + "yeniden atandı" mesajı oluşturur. Deneme sınırı aşıldıysa soru `open_pool` durumuna geçer ve havuz mesajı yazılır.

Birden fazla instance aynı anda çalışsa da aynı atama iki kez işlenmez.

## Ölçek ve performans
| Konu | Yaklaşım |
|---|---|
| Kritik yazmalar | Tek transaction ile atomik. İstemciye güvenilmez, aktör her zaman oturumdan alınır. |
| Kapasite yarışı | `SELECT … FOR UPDATE SKIP LOCKED` |
| Süresi dolan atamalar | Kısmi index: `assignments(deadline) WHERE status='pending'` |
| Eşleştirme | Index'ler: `users(home_city)`, `interests` üzerinde GIN; günlük sayaç ayrı kolonda tutulur |
| İstatistik | `local_stats` materialized view, 5 dk'da bir yenilenir. Local Score değerlendirme anında artımlı güncellenir. |
| Benzer cevap arama | Postgres full-text search (`tsvector` + GIN, Türkçe sözlük) |
| Listeler | Cursor tabanlı sayfalama |
| Realtime | Filtrelenmiş kanallar. Sunucu stateless kalır. Çok instance'ta `NOTIFY` yerine Redis pub/sub kullanılır. |
| Ön yüz | Route bazlı code splitting. Sayfalar server component olur, `"use client"` sadece yaprak bileşenlerde kullanılır. |
| Test edilebilirlik | Zaman (`now`) enjekte edilir. `/dev` panelinde "zamanı ileri sar" özelliği bulunur. |

**İleride (raporda anlatılacak):** okuma replikası, şehre göre sharding (sorular şehir dışına çıkmadığı için doğal bölme anahtarı şehir), eşleştirme işinin kuyruk + worker yapısına taşınması.

## Parametreler (`src/domain/config.ts`)
| Ad | Varsayılan | Demo | Not |
|---|---|---|---|
| `reassignAfterMinutes` (T) | 30 | 1 | EM simülasyonla güncelleyecek |
| `maxAttempts` | 3 | 3 | Aşılırsa soru açık havuza düşer |
| `defaultDailyLimit` | 2 | 2 | Lokal 1-5 arası ayarlayabilir |
| `statsWindowDays` | 30 | 30 | Medyan süre ve yanıt oranı penceresi |
| `responseRateWindowHours` | 24 | 24 | Airbnb tanımı |
| `matchWeights` | topic 3 · district 2 · speed 1 | — | EM'den gelecek |
| `fallbackEtaText` | "genelde 1 saat içinde" | — | Veri yoksa gösterilir |
