# Yapılacaklar

İşaretleme: `[ ]` yapılacak · `[~]` devam ediyor · `[x]` bitti. Her madde bitince `progress.md` dosyasına bir satır ekle.
Ekip: **Mali** (mimari ve çekirdek), **Fatih** (arka uç), **Ökkeş** (ön yüz).

---

## Faz 1 — Demo (1 gün · Mali)
Hedef: brief'in 5. bölümündeki senaryo iki pencerede baştan sona çalışsın. Her şey MockAdapter üzerinde.
Sıra kritik yola göre belirlendi: vakit yetmezse sondaki 🟡 maddeler atlanır.

### 1.1 Kurulum
- [ ] Next.js (App Router) + TS strict + Tailwind v4 iskeleti, `@/` alias'ı
- [ ] `src/styles/tokens.css` (handoff'tan) + `globals.css` içinde `@theme` eşlemesi
- [ ] Schibsted Grotesk'i `next/font/local` ile yükle (`src/app/fonts/`, OFL.txt dahil)
- [ ] Vitest, ESLint ve `typecheck` script'i
- [ ] `.env.example` dosyasına `NEXT_PUBLIC_DATA_SOURCE=mock` ekle

### 1.2 Sözleşmeler
- [ ] `src/domain/types.ts`
- [ ] `src/data/repository.ts`: `Repository`, `AuthPort`, `DemoControls`
- [ ] `src/data/errors.ts`
- [ ] `src/domain/config.ts`, `src/domain/labels.ts`

### 1.3 Domain (testleriyle)
- [ ] `role.ts`, `countdown.ts`
- [ ] `messages.ts`: tüm otomatik mesaj ve bildirim metinleri
- [ ] `matching.ts`: `filterEligible`, `rankCandidates`, `pickNextLocal`
- [ ] `reassignment.ts`: süre dolması ve decline durumları, deneme sınırı → açık havuz
- [ ] `stats.ts`: medyan süre, yanıt oranı, Local Score, `formatEta`
- [ ] `answer-templates.ts`
- [ ] 🟡 `similarity.ts`

### 1.4 MockAdapter
- [ ] `mock/clock.ts`: ileri sarılabilen saat
- [ ] `mock/store.ts`: bellek + localStorage
- [ ] `mock/sync.ts`: BroadcastChannel
- [ ] `mock/seed.ts`: `seed.json` sözleşme tiplerine çevrilecek. Senaryoda eşleştirme **Mert'i 1., Zeynep'i 2.** sıraya koymalı. Çiya metni düzeltilecek.
- [ ] `mock/mock-auth.ts`: hazır kullanıcıyla giriş, oturum sessionStorage'da
- [ ] `mock/mock-repository.ts`: tüm `Repository` fonksiyonları, aktör oturumdan alınır
- [ ] `mock/scheduler.ts`: 5 sn'de bir süresi dolan atamaları işler
- [ ] `data/index.ts` (`getRepository`), `query-keys.ts`, `use-channel.ts`, `useNow()`
- [ ] Providers: TanStack Query + Session

### 1.5 UI kit + layout
- [ ] `icons.tsx`: durum glifleri ve mühür SVG'leri (handoff HTML'lerinden)
- [ ] `Avatar`, `Button`, `Chip`, `TopicChips`, `BudgetSegment`
- [ ] `StatusGlyph`, `StatusLabel`, `Countdown`, `ProgressLine`, `VerifiedSeal`, `VerifiedBadge`, `Sheet`
- [ ] `AppHeader`, `TabBar`, `DesktopTabs`, `RoleToggle`, `CitySelector`, `NotificationBell`, `FlowHeader`, `TwoColumn`
- [ ] `(app)/layout.tsx`: oturum yoksa `/giris`'e yönlendir

### 1.6 Ekranlar (senaryo sırasıyla)
- [ ] Giriş: `DemoUserPicker` (1-giris)
- [ ] Turist ana sayfası: `AskBox`, `ActiveQuestions`, `PopularQuestions` (2-ana)
- [ ] Soru sor: form + aranıyor/iletildi ara durumları (3-sor)
- [ ] Soru detay: `QuestionCard`, `QuestionJourney`, `AutoMessage`, `HumanAnswerCard`, geri sayım (4-detay)
- [ ] Değerlendirme: `RatingBox` + teşekkür durumu (4-detay-tesekkur)
- [ ] Gelen kutusu: `CapacityMeter`, liste, bugün cevapladıkların, boş durum (5-gelen)
- [ ] Cevapla: `AnswerTemplates`, arşive ekle seçeneği, "Bilmiyorum, sıradakine geçsin" (5-cevapla)
- [ ] Profil: `LocalProfileCard` full / compact / sheet (6-profil)
- [ ] Bildirimler: panel + okundu işaretleme (7-bildirim)
- [ ] Sorularım listesi

### 1.7 Demo araçları
- [ ] `/dev`: `T` ayarı, zamanı ileri sar, scheduler'ı hemen çalıştır, demoyu sıfırla, atama tablosu

### 1.8 Prova
- [ ] Senaryonun 1-7 adımları iki normal pencerede, `T` = 1 dk ile
- [ ] Her ekranı 390 px ve 1440 px'te handoff görüntüleriyle karşılaştır
- [ ] Rapor ve sunum için ekran görüntüleri al

### 1.9 🟡 Vakit kalırsa
- [ ] Landing sayfası (8-tanitim)
- [ ] Benzer cevaplar paneli (`SimilarAnswersPanel`, senaryonun 8. adımı)

---

## Faz 2 — Gerçek arka uç ve tamamlama (üç kişi paralel)
Bağımlılıklar: Fatih sözleşmenin sunucu tarafını yazar. Ökkeş mock üzerinde çalışır, arka ucu beklemez. Mali iki tarafı birleştirir.

### Mali — mimari ve çekirdek
- [ ] Sözleşme sahipliği: `progress.md` dosyasındaki talepleri karara bağlamak
- [ ] GitHub Actions: her PR'da lint, typecheck ve test çalışsın
- [ ] `server/realtime/`: `LISTEN/NOTIFY` broker → SSE, `api/events/route.ts`
- [ ] `server/jobs/reassign.ts` + `instrumentation.ts` (15 sn'de bir çalışan zamanlayıcı)
- [ ] `similarity.ts` yerine Postgres full-text search (Fatih ile birlikte)
- [ ] Entegrasyon: `NEXT_PUBLIC_DATA_SOURCE=http` ile uçtan uca senaryo
- [ ] Yük testi: k6 ya da autocannon ile eşzamanlı soru sorma ve kapasite yarışı (rapordaki ölçek iddiası için)
- [ ] Code review
- [ ] Rapor: SDD mimari bölümü

### Fatih — arka uç
- [ ] `docker-compose.yml` (Postgres), `.env`, `drizzle.config.ts`
- [ ] `server/db/schema.ts`: tablolar, kısmi index (`assignments(deadline) WHERE status='pending'`), `home_city` index'i, `interests` üzerinde GIN
- [ ] Migration'lar + seed script'i (mock seed ile aynı veri)
- [ ] Better Auth kurulumu + demo kullanıcıları, `server/session.ts` (`requireUser`)
- [ ] `services/questions.ts`: `askQuestion` tek transaction'da, `SKIP LOCKED` ile
- [ ] `services/answers.ts`: `submitAnswer`, `declineAssignment`, `rateAnswer`
- [ ] `services/assignments.ts`: `expireAssignments`
- [ ] `services/profiles.ts`: `local_stats` materialized view'ı ve yenilenmesi
- [ ] `services/notifications.ts`
- [ ] `app/api/**`: zod ile doğrulama, ince route handler'lar
- [ ] `data/http/`: `HttpAdapter` + `http-auth` (fetch + EventSource)
- [ ] Servis testleri: test veritabanı üzerinde transaction ve yarış durumu testleri
- [ ] Rapor: SDD veri tasarımı bölümü (ER diyagramı, index'ler)

### Ökkeş — ön yüzü tamamlama
- [ ] Faz 1'de kalan 🟡 ekranlar: landing, benzer cevaplar
- [ ] Ayarlar: rol/şehir, günlük limit (1-5), engellenenler
- [ ] Lokalin arşivi: listele, düzenle, arşivden kaldır
- [ ] Şikâyet / engelle formu
- [ ] Açık havuz arayüzü: turist bilgilendirmesi, lokallerin havuzdan soru alması
- [ ] Tüm ekranlarda yükleniyor, hata ve boş durumları
- [ ] Erişilebilirlik turu: klavye, `aria-label`, kontrast, dokunma alanı
- [ ] Bütün ekranlar için 390 / 1024 / 1440 px karşılaştırması
- [ ] Rapor: SDD arayüz bölümü (ekran akışı, bileşen envanteri)

### Ortak
- [ ] Ara rapor güncellemesi (brief 7. bölüm): araçlar tablosunda "React / responsive web" ifadesi ve kapsamda "ilk sürüm web" notu
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
- [ ] Ölçek: Redis pub/sub (çok instance), okuma replikası, şehre göre sharding planı
- [ ] Yayın: kendi sunucumuzda Docker ile (`next start` + Postgres)
