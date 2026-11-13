# Kod kuralları

## TypeScript
- `strict: true`. `any` kullanılmaz; gerekiyorsa `unknown` + daraltma kullanılır.
- Import'lar `@/` alias'ı ile yapılır (`@/domain/types`). `../../..` şeklinde göreli import kullanılmaz.
- Domain tipleri `@/domain/types`'tan alınır, başka bir yerde yeniden tanımlanmaz.
- Sunucuya gelen girdiler (2. faz) route handler'da **zod** ile doğrulanır.

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
- Otomatik mesaj metinleri **sadece** `domain/messages.ts` içinde yazılır.
- Etiketlerin Türkçe karşılıkları `domain` içinde tek bir yerde tutulur (`TOPIC_LABELS`, `BUDGET_LABELS`).

## Test
- `domain/` içindeki her fonksiyonun bir `*.test.ts` dosyası olur. Özellikle eşleştirme, yeniden atama ve istatistik fonksiyonlarının testi zorunludur.
- Testlerde zaman sabit bir `now` ile verilir.

## Git
- `main` her zaman çalışır durumda tutulur. Doğrudan push yapılmaz, PR açılır.
- Branch ismi: `feat/<konu>`, `fix/<konu>`, `docs/<konu>`.
- Commit: Conventional Commits, İngilizce. Örnekler: `feat(inbox): add capacity meter`, `fix(matching): exclude previous locals`.
- PR'lar küçük tutulur ve tek bir konu içerir. Birleştirmeden önce `lint`, `typecheck` ve `test` geçmelidir.
- Sözleşme dosyalarına dokunan PR'ın başlığında `[contract]` etiketi olur.
