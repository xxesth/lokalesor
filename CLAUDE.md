# Lokale Sor — Ekip Kuralları

Bu dosyayı Claude Code her oturumda okur. Ekipteki herkes için geçerlidir.

Turistin gittiği şehirde yaşayan lokale soru sorduğu, insan odaklı bir seyahat platformu. Ürünle ilgili her şey `docs/brief.md` dosyasında. Görsel kimlik bölümü (3.2) geçersiz, onun yerine `docs/handoff/` kullanılır (bkz. ADR-013).
Hocanın beklentisi: **ölçeklenebilir ve performans odaklı bir mimari.**
Ekip: **Mali** (mimari ve çekirdek), **Fatih** (arka uç), **Ökkeş** (ön yüz).

## Önce bunları oku
| Dosya | İçerik |
|---|---|
| `docs/setup.md` | Kurulum ve komutlar |
| `docs/demo.md` | Sunumda demo adımları |
| `docs/memory/architecture.md` | Servisler, paket bağımlılıkları, akışlar, realtime protokolü, ölçek planı |
| `docs/memory/decisions.md` | Alınmış kararlar (ADR). Kapanmış bir kararı tekrar tartışmaya açma. |
| `docs/memory/structure.md` | Monorepo yapısı, hangi kodun hangi dosyaya yazılacağı, ortam değişkenleri |
| `docs/memory/contracts.md` | Tipler, zod şemaları, REST uç noktaları, Repository arayüzü |
| `docs/memory/conventions.md` | Kod, isimlendirme, stil ve git kuralları |
| `docs/memory/todo.md` | Faz faz, kişi bazlı görevler |
| `docs/memory/progress.md` | Ne bitti, ne yarım kaldı, neler blokluyor, sözleşme talepleri |
| `docs/handoff/README.md` | **Onaylı tasarım.** UI yazmadan önce oku. |
| `docs/handoff/screenshots/` | Her ekranın 390 px ve 1440 px görüntüsü. Bitirdiğin ekranı bunlarla karşılaştır. |

## Mimari özet
Monorepo (pnpm + Turborepo) içinde ayrık servisler:
- `apps/web`: Next.js
- `apps/api`: Fastify
- `apps/realtime`: SSE
- `apps/worker`: BullMQ

Ortak paketler: `@lokale/contracts`, `@lokale/domain`, `@lokale/db`, `@lokale/core`.
Servisler birbirini çağırmaz, Postgres ve Redis üzerinden haberleşir.

## Altın kurallar
1. **UI iş kuralı içermez.** Eşleştirme, süre hesabı, otomatik mesaj metni ve istatistik `@lokale/domain` içinde yazılır. Bileşen sadece gösterir.
2. **Web veriye sadece Repository üzerinden erişir** (`getRepository()`). `apps/web/src/data/` dışından adapter import edilmez.
3. **Bağımlılık yönü sabittir:** `contracts ← domain ← core ← api/worker`.
   - `web`, `@lokale/db` ve `@lokale/core` paketlerini import edemez.
   - Paketler `apps/*` klasörlerinden import edemez.
   - Servisler birbirinin kodunu import edemez.
4. **`@lokale/domain` saf TypeScript'tir.** İçinde React, Node API'leri, veritabanı ya da `Date.now()` olmaz. Zaman `now` parametresiyle verilir.
5. **Sözleşme** (`packages/contracts/`, `apps/web/src/data/repository.ts`) sadece Mali'nin onayıyla değişir. Bir değişiklik gerekiyorsa `progress.md` dosyasındaki "Sözleşme talepleri" bölümüne yaz.
6. **Route'lar ve job'lar incedir.** api handler'ı ve worker job'ı sadece doğrulama yapıp `@lokale/core` çağırır. Transaction, Redis yayını ve iş kuyruğu kodu `core` içinde yazılır.
7. **Redis yayını ve kuyruğa iş ekleme sadece commit'ten sonra yapılır** (`withTx`).
8. **Renk, yazı tipi, boşluk ve köşe sadece token'larla verilir** (`apps/web/src/styles/tokens.css`). Bileşenlerde hex kod kullanılmaz.
9. **Sistem gri, insan renkli.** Kişi rengi sadece o kişiyi temsil ettiği yerde kullanılır. Nar kırmızısı (`nar`) sadece aciliyet için kullanılır. Birincil buton siyahtır.
10. **Otomatik mesaj ile insan cevabı her zaman biçimle ayrılır** (`AutoMessage` / `HumanAnswerCard`). Robot ikonu kullanılmaz. LLM yok, otomatik mesajlar kural tabanlı şablonlardır.
11. **`docs/handoff/screens/*.html` sadece referanstır.** Koda kopyalanmaz.
12. **Kişisel bilgi gösterilmez.** Telefon ve e-posta hiçbir ekranda ve hiçbir API cevabında yer almaz. Konum sadece şehir/semt düzeyinde tutulur.
13. **Dil:** kod ve veritabanı isimleri İngilizce, arayüz metinleri ve dokümanlar Türkçe ("sen" diliyle).

## Her iş bittiğinde
- `docs/memory/progress.md` dosyasına 1-3 satır ekle: tarih, kim, ne yapıldı, ne kaldı.
- `docs/memory/todo.md` dosyasında maddeni işaretle.
- Yeni bir mimari karar aldıysan `decisions.md` dosyasına bir ADR ekle. Yeni bir dosya açtıysan `structure.md` dosyasını güncelle.

## Komutlar
```
pnpm install
pnpm dev                       # tüm servisler (Faz 1'de sadece web: http://localhost:3000)
pnpm --filter @lokale/web dev  # tek servis
pnpm test | pnpm lint | pnpm typecheck
docker compose up -d           # (Faz 2) Postgres + Redis
pnpm --filter @lokale/db migrate
```
Demo (mock) için iki **normal** tarayıcı penceresi açılır (gizli pencere olmaz, çünkü localStorage'ı paylaşmaz). `/giris` sayfasında birinde Elif, diğerinde Zeynep seçilir. Geliştirici paneli `/dev` adresinde.
