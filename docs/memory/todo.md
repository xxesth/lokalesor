# Yapılacaklar

İşaretleme: `[ ]` yapılacak · `[~]` devam ediyor · `[x]` bitti. Her madde bitince `progress.md` dosyasına bir satır ekle.
Ekip: **Mali** (mimari ve çekirdek), **Fatih** (arka uç), **Ökkeş** (ön yüz).

---

## Faz 1 — Demo (1 gün · Mali)
Hedef: brief'in 5. bölümündeki senaryo iki pencerede baştan sona çalışsın. Her şey MockAdapter üzerinde.
Monorepo ilk günden kurulur, ama sadece `apps/web`, `packages/contracts`, `packages/domain` ve `packages/config` (ADR-023).
Sıra kritik yola göre belirlendi: vakit yetmezse sondaki 🟡 maddeler atlanır.

### 1.1 Kurulum
- [x] pnpm workspace + Turborepo: `pnpm-workspace.yaml`, `turbo.json`, kök `package.json` script'leri
- [x] `packages/config`: `tsconfig.base.json` (strict), ESLint (bağımlılık kuralları dahil), Vitest ayarları
- [x] `apps/web`: Next.js (App Router) + Tailwind v4, `@/` alias'ı
- [x] `tokens.css` (handoff'tan) + `globals.css` içinde `@theme` eşlemesi
- [x] Schibsted Grotesk'i `next/font/local` ile yükle (OFL.txt dahil)
- [x] `.env.example`

### 1.2 Sözleşmeler
- [x] `packages/contracts`: `entities.ts`, `enums.ts`, `api.ts` (zod şemaları + `ROUTES`), `channels.ts`, `errors.ts`
- [x] `apps/web/src/data/repository.ts`: `Repository`, `AuthPort`, `DemoControls`

### 1.3 Domain (`packages/domain`, testleriyle)
- [x] `config.ts`, `labels.ts`, `role.ts`, `countdown.ts`
- [x] `messages.ts`: tüm otomatik mesaj ve bildirim metinleri
- [x] `matching.ts`: `filterEligible`, `rankCandidates`, `pickNextLocal`
- [x] `reassignment.ts`: süre dolması ve decline durumları, deneme sınırı → açık havuz
- [x] `stats.ts`: medyan süre, yanıt oranı, Local Score, `formatEta`
- [x] `answer-templates.ts`
- [x] 🟡 `similarity.ts`

### 1.4 MockAdapter (`apps/web/src/data/mock`)
- [x] `clock.ts`, `store.ts` (bellek + localStorage + `storage` olayıyla sekme senkronu)
- [x] `seed.ts`: `seed.json` sözleşme tiplerine çevrilecek. Senaryoda eşleştirme **Mert Özçelik'i 1., Nevin Arslan'ı 2.** sıraya koymalı. Çiya metni düzeltilecek.
  - Demo kullanıcıları sadece ekibin verdiği isimler (2026-11-14): Efe Genç (senaryo turisti), Mert Özçelik, Nevin Arslan (senaryo lokalleri), Merve Güler, Çağlar Fidan, Gündüz Serkan Dağaşan, Yağmur Arpa, Melike Kaplan (İstanbul), Uzay Çetin (İzmir), Gülçin Büyüközkan Feyzioğlu (Paris), Fatih Furkan Altınkaya (Berlin), Ökkeş Donbaloğlu (Tokyo), Taylan Poyraz Kalfalar (New York), Muhammed Ali Karslı (Barselona). Eski not: Çoğu İstanbul'da farklı semtlerde lokal olacak, bir kısmı başka şehirlerden gelen turistler. Arşiv cevaplarında ve popüler sorularda da kullanılacaklar. Bu kullanıcılar senaryoda Mert'in ve Zeynep'in önüne geçmemeli.
- [x] `mock-auth.ts`: hazır kullanıcıyla giriş, oturum sessionStorage'da
- [x] `mock-repository.ts`: tüm `Repository` fonksiyonları, aktör oturumdan alınır
- [x] `scheduler.ts`: 5 sn'de bir süresi dolan atamaları işler
- [x] `data/index.ts` (`getRepository`), `query-keys.ts`, `use-channel.ts`, `use-now.ts`
- [x] Providers: TanStack Query + Session

### 1.5 UI kit + layout
- [x] `icons.tsx`: durum glifleri ve mühür SVG'leri (handoff HTML'lerinden)
- [x] `Avatar`, `Button`, `Chip`, `TopicChips`, `BudgetSegment`
- [x] `StatusGlyph`, `StatusLabel`, `Countdown`, `ProgressLine`, `VerifiedSeal`, `VerifiedBadge`, `Sheet`
- [x] `AppHeader`, `TabBar`, `DesktopTabs`, `RoleToggle`, `CitySelector`, `NotificationBell`, `FlowHeader`, `TwoColumn`
- [x] `(app)/layout.tsx`: oturum yoksa `/giris`'e yönlendir

### 1.6 Ekranlar (senaryo sırasıyla)
- [x] Giriş: `DemoUserPicker` (1-giris)
- [x] Turist ana sayfası: `AskBox`, `ActiveQuestions`, `PopularQuestions` (2-ana)
- [x] Soru sor: form + aranıyor/iletildi ara durumları (3-sor)
- [x] Soru detay: `QuestionCard`, `QuestionJourney`, `AutoMessage`, `HumanAnswerCard`, geri sayım (4-detay)
- [x] Değerlendirme: `RatingBox` + teşekkür durumu (4-detay-tesekkur)
- [x] Gelen kutusu: `CapacityMeter`, liste, bugün cevapladıkların, boş durum (5-gelen)
- [x] Cevapla: `AnswerTemplates`, arşive ekle seçeneği, "Bilmiyorum, sıradakine geçsin" (5-cevapla)
- [x] Profil: `LocalProfileCard` full / compact / sheet (6-profil)
- [x] Bildirimler: panel + okundu işaretleme (7-bildirim)
- [x] Sorularım listesi

### 1.7 Demo araçları
- [x] `/dev`: `T` ayarı, zamanı ileri sar, scheduler'ı hemen çalıştır, demoyu sıfırla, atama tablosu

### 1.8 Prova
- Otomatik prova: `apps/web/src/data/mock/scenario.test.ts` (senaryo 1-8) + headless tarayıcıda iki sekmeyle uçtan uca çalıştırıldı.
- [x] Senaryonun 1-7 adımları iki normal pencerede, `T` = 3 dk ile
- [~] Her ekranı 390 px ve 1440 px'te handoff görüntüleriyle karşılaştır (ana ekranlar kontrol edildi; ince piksel ayarı Ökkeş'in Faz 2 işinde)
- [x] Rapor ve sunum için ekran görüntüleri al

### 1.9 🟡 Vakit kalırsa
- [x] Landing sayfası (8-tanitim)
- [x] Benzer cevaplar paneli (`SimilarAnswersPanel`, senaryonun 8. adımı)

---

## Faz 2 — Ayrık arka uç ve tamamlama (üç kişi paralel)
Bağımlılıklar:
- Fatih `contracts`'taki şemalara göre api'yi yazar.
- Ökkeş mock üzerinde çalışır, arka ucu beklemez.
- Mali altyapıyı, realtime'ı, worker'ı ve `core/assignments.ts`'i yazar.
- ✅ Bloklayan işler teslim edildi (2026-11-17): şema + migration, `withTx`, yayın/kuyruk, `assignNext` / `closeAndReassign` / `declineAssignment` / `sweepExpired`, havuz ve engelleme sözleşmesi (mock'ta çalışıyor). Fatih'in `askQuestion`'ı `withTx` içinde soruyu ekleyip `assignNext(tx, id, null)` çağırır. Örnek: `packages/core/src/assignments.test.ts` → `ask()`.

### Mali — altyapı, realtime, worker
- [ ] ⚠️ `apps/web/next.config.ts` → `allowedDevOrigins: ["*.trycloudflare.com"]` satırını kaldır. Sadece demoyu tünelle paylaşmak için geçici olarak eklendi; herhangi bir trycloudflare adresinin dev sunucusuna erişmesine izin veriyor.
- [x] `docker-compose.yml` (Postgres + Redis + `lokale_test`), `.env.example` güncellemesi
- [ ] `turbo dev` ile 4 servisi birlikte çalıştırma; `apps/web` içinde `/api` ve `/events` rewrite'ları
- [ ] GitHub Actions: her PR'da lint, typecheck ve test
- [x] `packages/db`: `schema.ts` (tablolar, enum'lar, kısmi index'ler, GIN, Türkçe `search_vector`), `client.ts`, `migrate.ts`, ilk migration
- [x] `packages/core`: `tx.ts` (`withTx`), `context.ts`, `create-core.ts`, `runtime.ts` (dev saat/T), `infra/redis.ts`, `infra/publish.ts`, `infra/queue.ts`, `realtime-token.ts`
- [x] `packages/core/assignments.ts`: `assignNext` (`SKIP LOCKED`), `closeAndReassign`, `declineAssignment`, `sweepExpired` + gerçek Postgres testleri (yarışlar dahil)
- [x] Sözleşme: açık havuz (ADR-027) ve engelleme (ADR-028) + mock uygulaması ve testleri
- [ ] `apps/worker`: `assignment-deadline`, `sweep-expired`, `refresh-stats` job'ları, düzgün kapanış
- [ ] `apps/realtime`: `GET /events`, JWT doğrulama (`jose`), kanal yetkisi, hub, Redis aboneliği, heartbeat
- [ ] `apps/web/src/data/http/event-source.ts`: token al → bağlan → yeniden bağlan
- [ ] Entegrasyon: `NEXT_PUBLIC_DATA_SOURCE=http` ile uçtan uca senaryo
- [ ] Yük testi (k6): eşzamanlı soru sorma, kapasite yarışı, 1000 SSE bağlantısı
- [ ] `Caddyfile` (production)
- [ ] Sözleşme taleplerini karara bağlamak, code review
- [ ] Rapor: SDD mimari bölümü

### Fatih — veritabanı, api, auth
- [ ] `packages/db`: `seed.ts` (mock seed'in aynısı), `auth-schema.ts` (Better Auth tabloları; `user` modeli `users` tablosuna eşlenir), `local-stats.ts` (materialized view). Şema Mali'de, değişiklik için `generate` ile yeni migration.
- [ ] `local_stats` gelince `core/assignments.ts` → `loadCandidates` medyanı oradan okusun
- [ ] `apps/api`: Fastify kurulumu, pino, zod type provider, OpenAPI (`/api/docs`), hata plugin'i
- [ ] Better Auth + demo kullanıcıları, `plugins/session.ts`, `GET/PATCH /api/me/session`
- [ ] `packages/core`: `questions.ts`, `answers.ts`, `inbox.ts`, `profiles.ts`, `notifications.ts`, `pool.ts` (`listOpenPool`, `answerFromPool`), `blocks.ts` (transaction'lar `withTx` ile; mesaj/bildirim için `writes.ts`; kurallar mock'taki karşılığıyla aynı)
- [ ] `apps/api/routes/*` (⚠️ önce `progress.md` → "Backend'in birebir uyması gereken davranışlar" bölümünü oku): `contracts.md`'deki tüm REST uç noktaları + `POST /api/realtime/token`
- [ ] `apps/api/routes/dev.ts`: sıfırla, `T` ayarı, zamanı ileri sar (`core/runtime.ts` fonksiyonları + `sweepExpired`)
- [ ] `apps/web/src/data/http/`: `http-repository.ts` (`ROUTES` + fetch + `RepoError` dönüşümü), `http-auth.ts`
- [ ] `core` testleri: test veritabanı üzerinde transaction ve yarış durumları
- [ ] Postgres full-text search ile `findSimilar` (Türkçe sözlük)
- [ ] Rapor: SDD veri tasarımı bölümü (ER diyagramı, index'ler, OpenAPI)

### Ökkeş — ön yüzü tamamlama
- [x] Faz 1'de kalan 🟡 ekranlar: landing, benzer cevaplar (Faz 1'de yapıldı)
- [x] Ayarlar: günlük limit (1-5), semt, konular, engellenenler (`listBlocked`, `unblockUser`). Rol/şehir üst menüdeki anahtar ve seçicide.
- [~] Lokalin arşivi: listele ve arşivden kaldır/ekle var, profilden erişilebilir. Cevap metnini düzenleme yok (henüz karar yok: `setAnswerText` sözleşme talebi Mali'de bekliyor, reddedilmedi)
- [x] Şikâyet / engelle formu (`report` + `blockUser`)
- [x] Rol bazlı içerik: ana sayfa, Sorularım ve rol kapısı (`RoleGate`) iki rolde farklı
- [x] Profil: kendi profilinde Ayarlar ve Soru arşivim bağlantıları
- [ ] Profil düzenleme: ad, kişi rengi, avatar fotoğrafı (sözleşme talepleri `progress.md`'de; Mali onaylayınca ekran + mock uygulaması)
- [x] Açık havuz arayüzü: turist bilgilendirmesi, lokallerin havuzdan soru alması (`listOpenPool`, `answerFromPool`, kanal `pool:{city}`; seed'de İstanbul havuzunda 2 soru var)
- [x] Tüm ekranlarda yükleniyor, hata ve boş durumları (`ErrorNote` + "Tekrar dene", `app/error.tsx`, `app/not-found.tsx`)
- [x] Erişilebilirlik turu: klavye, `aria-label`, kontrast, dokunma alanı (kod tarafı bitti; ekran okuyucu denemesi ve token kontrast kararı açık, bkz. progress.md)
- [~] Bütün ekranlar için 390 / 1024 / 1440 px karşılaştırması: 1440'ta ana sayfa, soru detayı, gelen kutusu, profil, giriş, tanıtım, soru sor tasarımla karşılaştırıldı ve düzeltildi; 390'da sadece ana sayfa. 1024 için referans yok, yalnızca düzen kuralları denetlendi (alt çubuk yok, masaüstü menü, yatay taşma yok). Kalan: bildirimler, 390 px diğer ekranlar, soru sor ara durumları (aranıyor, iletildi)
- [x] Popüler sorulara bütçe filtresi (brief #24, sözleşmede `budget` zaten var)
- [x] Favicon ve Open Graph meta (`icon.svg`, `opengraph-image.png`, `NEXT_PUBLIC_SITE_URL`)
- [x] `docs/demo.md`: rol anahtarı, açık havuz ve engelleme adımları
- [x] Rapor ve sunum ekran görüntüleri yenilendi: tam senaryo, 1440 ve 390 px (23'er görüntü, repoda değil, yerel `.local-e2e/sunum/`)
- [ ] Gizlilik bilgilendirmesi (brief #11, #22 KVKK): Ayarlar'da statik "Gizlilik" bölümü (telefon ve e-posta gösterilmez, konum sadece şehir/semt, iletişim site içinden)
- [ ] Rapor: SDD arayüz bölümü (ekran akışı, bileşen envanteri)

### Ortak
- [ ] Ara rapor güncellemesi (brief 7. bölüm): araçlar tablosu ve "ilk sürüm web" notu
- [ ] EM'den `T`, deneme sınırı ve ağırlık değerlerini alıp `config.ts`'e işlemek

---

## Faz 3 — Sonra (brief'te ⬜ olanlar)
- [ ] Moderasyon paneli: şikâyet kuyruğu (≤ 24 saat hedefi), açık havuz görünümü
- [ ] KPI paneli: medyan yanıt süresi, 24 saatte yanıt oranı, yeniden atama sayısı
- [ ] Profil doğrulama akışı (telefon/kimlik)
- [ ] Lokallerin rotaları
- [ ] Seviye sistemi ve rozetler
- [ ] Local Partner ve sponsorlu öneriler ("Sponsorlu" etiketiyle)
- [ ] Kayıtta kişi rengi seçimi
- [ ] Ölçek: okuma replikası, şehre göre sharding planı, gerekirse realtime servisinin Rust'a taşınması
- [ ] Yayın: hedef seçimi (kendi sunucumuz ya da bulut), Docker imajları, Caddy
