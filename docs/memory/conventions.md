# Kod kuralları

## TypeScript
- `strict: true`. `any` kullanılmaz; gerekiyorsa `unknown` + daraltma kullanılır.
- Uygulama içi import'lar `@/` alias'ı ile yapılır (`@/features/inbox`). Paketler arası import'lar paket adıyla yapılır (`@lokale/contracts`). `../../..` şeklinde göreli import kullanılmaz.
- Varlık tipleri sadece `@lokale/contracts`'tan alınır, başka bir yerde yeniden tanımlanmaz.
- İstek girdileri zod şemasıyla tanımlanır (`@lokale/contracts/api`), tip `z.infer` ile türetilir.
- Bağımlılık kuralları ESLint ile denetlenir: `web`, `db`/`core` paketlerini import edemez; paketler `apps/*`'tan import edemez.
- Her paketin `package.json` dosyasında açık bir `exports` alanı bulunur. Paketin iç dosyalarına doğrudan import yapılmaz.

## Sunucu (api, worker, core)
- Route ve job handler'ları ince tutulur: doğrula → `core` → cevap dön.
- Transaction'lar `withTx()` ile açılır. Redis yayını ve kuyruğa iş ekleme commit'ten sonra yapılır.
- `RepoError` fırlatılır. api bu hatayı `HTTP_STATUS` tablosuna göre `{ code, message }` gövdesiyle döndürür.
- Log için pino kullanılır, `console.log` yazılmaz. Her log satırında `requestId` ya da `jobId` bulunur.
- Job'lar idempotent yazılır: aynı iş iki kez çalışsa da sonuç değişmez.

## İsimlendirme
| Ne | Kural | Örnek |
|---|---|---|
| Dosya | kebab-case | `status-bar.tsx`, `use-thread.ts` |
| Bileşen | PascalCase, named export | `export function StatusBar()` |
| Hook | `use` öneki | `useQuestionThread` |
| Fonksiyon/değişken | camelCase | `rankCandidates` |
| Sabit | UPPER_SNAKE | `TOPICS` |
| DB tablo/kolon | snake_case, çoğul tablo | `assignments.assigned_at` |
| Route | Türkçe, kebab-case | `/lokal/gelen-kutusu` |

`default export` sadece Next.js'in zorunlu kıldığı dosyalarda kullanılır (`page.tsx`, `layout.tsx`).

## React / Next.js
- Sayfalar (`page.tsx`) server component'tir ve ince tutulur.
- `"use client"` sadece etkileşim veya hook kullanan yaprak bileşenlerde olur.
- Veri her zaman feature hook'ları üzerinden alınır (`useQuestionThread(id)`). Bileşen içinde doğrudan `getRepository()` çağrılmaz.
- Query anahtarları sadece `@/data/query-keys` içinde tanımlanır.
- Realtime için `useChannel(channel, keys)` kullanılır. Olay geldiğinde veri yeniden çekilir, cache elle yamanmaz.
- Her veri ekranında yükleniyor, hata ve boş durum tasarlanır.
- Geri sayım gibi zamanlayıcılar için `useNow()` kullanılır (tek bir interval, saniyede bir günceller).

## Stil (kaynak: `docs/handoff/README.md`)
- Tailwind sınıfları kullanılır. Renkler sadece token isimleriyle verilir (`bg-ink`, `text-gray`, `border-line`, `text-nar`). Hex kod yazılmaz.
- Kişi rengi `personStyle(color)` + `bg-person` ile verilir. Bu renk mesaj zemininde ve sistem öğelerinde kullanılmaz.
- `nar` sadece şunlarda kullanılır: son dakika sayacı, "Yeniden atandı", okunmamış noktası, bildirim sayısı, logo noktası.
- Hap biçimi yok: buton, çip ve girdi köşeleri `rounded-control` (8 px). Tam yuvarlak sadece avatar ve noktalar için. Gölge yok, ayrım ince çizgilerle yapılır. `shadow-pop` sadece açılır katmanlarda kullanılır.
- Geri sayım `tabular-nums`, dk:sn biçiminde gösterilir. Durumlar şekille anlatılır (`StatusGlyph`), sadece renkle anlatılmaz.
- Mobil öncelikli yazılır: önce telefon (390 px), sonra `lg:` (≥1024 px). Masaüstünde içerik en fazla 1200 px genişliğinde, iki sütunlu (`TwoColumn`).
- Otomatik mesaj her zaman `AutoMessage` ile gösterilir, insan cevabı her zaman `HumanAnswerCard` ile. Başka yerde benzer bir öğe yazılmaz.
- Erişilebilirlik: dokunma alanı ≥ 44 px; gerçek `<button>`, `<a>`, `<label>` kullanılır; ikon butonlarda `aria-label` bulunur; telefonda girdilerin yazı boyutu ≥ 16 px olur.
- Bitirdiğin ekranı `docs/handoff/screenshots/` içindeki görüntüyle 390 px ve 1440 px genişlikte karşılaştır.

## Metinler
- Arayüz metinleri Türkçe ve "sen" diliyle yazılır. Kısa cümleler kullanılır.
- Otomatik mesaj metinleri **sadece** `@lokale/domain` içindeki `messages.ts` dosyasında yazılır.
- Etiketlerin Türkçe karşılıkları `domain` içinde tek bir yerde tutulur (`TOPIC_LABELS`, `BUDGET_LABELS`).

## Test
- `@lokale/domain` içindeki her fonksiyonun bir `*.test.ts` dosyası olur. `@lokale/core` testleri gerçek bir test veritabanında çalışır (Faz 2). Özellikle eşleştirme, yeniden atama ve istatistik fonksiyonlarının testi zorunludur.
- Testlerde zaman sabit bir `now` ile verilir.

## Git
- `main` her zaman çalışır durumda tutulur. Doğrudan push yapılmaz, PR açılır.
- Branch ismi: `feat/<konu>`, `fix/<konu>`, `docs/<konu>`.
- Commit: Conventional Commits, İngilizce. Örnekler: `feat(inbox): add capacity meter`, `fix(matching): exclude previous locals`.
- PR'lar küçük tutulur ve tek bir konu içerir. Birleştirmeden önce `lint`, `typecheck` ve `test` geçmelidir.
- Sözleşme dosyalarına dokunan PR'ın başlığında `[contract]` etiketi olur.
