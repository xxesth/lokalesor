# Klasör yapısı — hangi kod nereye yazılır

Yeni bir dosya ya da klasör açtığında bu dosyayı güncelle. Dosya isimleri kebab-case olur (bkz. `conventions.md`).
`(F2)` işareti, o parçanın Faz 2'de ekleneceğini gösterir.

```
/
├─ CLAUDE.md · README.md · LICENSE · .gitignore
├─ package.json                 # kök: sadece script'ler + devDependencies
├─ pnpm-workspace.yaml          # apps/*, packages/*
├─ turbo.json                   # dev, build, test, lint, typecheck pipeline'ları
├─ tsconfig.base.json           # ortak strict ayarlar
├─ .env.example                 # tüm servislerin ortam değişkenleri
├─ docker-compose.yml           # (F2) Postgres + Redis
├─ Caddyfile                    # (F2) production proxy
├─ claude-design-prompts.md
├─ docs/setup.md                # kurulum ve komutlar
├─ docs/demo.md                 # sunumda demo adımları
├─ docs/
│  ├─ brief.md                  # ürün brief'i (EM). Görsel kimlik bölümü geçersiz → handoff
│  ├─ memory/                   # ekip hafızası
│  └─ handoff/                  # Claude Design teslimi (salt okunur referans)
│     ├─ README.md · design/ (tokens.css, fonts) · data/seed.json · screens/*.html · screenshots/*.png
├─ apps/
│  ├─ web/                      # @lokale/web       — Next.js arayüz
│  ├─ api/                      # @lokale/api       — (F2) Fastify REST + auth
│  ├─ realtime/                 # @lokale/realtime  — (F2) SSE gateway
│  └─ worker/                   # @lokale/worker    — (F2) BullMQ işleri
└─ packages/
   ├─ contracts/                # @lokale/contracts — tipler, zod şemaları, kanallar, hata kodları
   ├─ domain/                   # @lokale/domain    — saf iş kuralları
   ├─ db/                       # @lokale/db        — (F2) Drizzle şeması + client + migration'lar
   ├─ core/                     # @lokale/core      — (F2) sunucu use-case'leri (api + worker ortak)
   └─ config/                   # @lokale/config    — ortak tsconfig / eslint / vitest ayarları
```

---

## `packages/contracts/src/`: SÖZLEŞME (bağımlılığı yok)
| Dosya | İçerik |
|---|---|
| `entities.ts` | Tüm varlık ve görünüm modeli tipleri (`User`, `Question`, `QuestionThread`, `InboxView`…) |
| `enums.ts` | `TOPICS`, `BUDGETS`, `PERSON_COLORS`, durum enum'ları |
| `api.ts` | İstek/cevap zod şemaları + `ROUTES` tablosu (yöntem, yol, şema). api doğrulamada, web `HttpAdapter`'da kullanır. |
| `channels.ts` | `Channel` tipi, `channel.question(id)` gibi üreticiler, `ChannelEvent` |
| `errors.ts` | `RepoErrorCode`, `RepoError`, HTTP durum kodu eşlemesi |
| `index.ts` | Dışa aktarım |

## `packages/domain/src/`: saf TS, testli (sadece `contracts`'a bağımlı)
| Dosya | İçerik |
|---|---|
| `config.ts` | İş kuralı parametreleri (`T`, deneme sınırı, ağırlıklar) |
| `labels.ts` | `TOPIC_LABELS`, `BUDGET_LABELS`, şehir/semt adları (Türkçe görünen isimler) |
| `countdown.ts` | `remaining()`, `isUrgent()` |
| `role.ts` | `resolveRole(user, currentCity, override?)` |
| `matching.ts` | `filterEligible()`, `rankCandidates()`, `pickNextLocal()` |
| `reassignment.ts` | `isExpired()`, `planNextStep()` → `reassign` / `open_pool` (süre dolması ve decline için ortak) |
| `messages.ts` | Otomatik mesaj ve bildirim metinleri |
| `answer-templates.ts` | Lokal için hazır cevap şablonları |
| `stats.ts` | `computeLocalStats()`: medyan süre, yanıt oranı, Local Score; `formatEta()` |
| `similarity.ts` | Benzer soru bulma (mock için kelime eşleşmesi) |
| `*.test.ts` | Her dosyanın yanında birim testi |

## `packages/db/src/` (F2)
| Dosya | İçerik |
|---|---|
| `schema.ts` | Tablolar, kısmi index, GIN index'leri, `local_stats` materialized view |
| `client.ts` | `pg` havuzu + Drizzle |
| `seed.ts` | Demo verisi (mock seed ile aynı) |
| `../drizzle/` | Migration dosyaları (elle düzenlenmez) |

## `packages/core/src/` (F2): sadece sunucu, web import edemez
| Dosya | İçerik |
|---|---|
| `questions.ts` | `askQuestion`, `getThread`, `listMine`, `findSimilar` (full-text) |
| `assignments.ts` | `assignNext(tx, questionId)`, `closeAndReassign(assignmentId, reason)`, `sweepExpired()` |
| `answers.ts` | `submitAnswer`, `rateAnswer`, `setArchived` |
| `inbox.ts` | `getInbox` |
| `profiles.ts` | `getLocalProfile`, `listAvailableLocals`, `refreshStats` |
| `notifications.ts` | Bildirim oluşturma, listeleme, okundu işaretleme |
| `infra/redis.ts` | Redis bağlantısı |
| `infra/publish.ts` | `publish(channels[])`: sadece commit'ten sonra çağrılır |
| `infra/queue.ts` | BullMQ kuyrukları: `scheduleDeadline(assignment)`, sweeper |
| `tx.ts` | `withTx(fn)`: transaction + commit sonrası yayın ve kuyruk işlerini sıraya koyma |

---

## `apps/web/` — Next.js
```
apps/web/
├─ next.config.ts        # geliştirmede /api → :4000, /events → :4001 rewrite'ları
└─ src/
   ├─ app/ · data/ · features/ · components/ · lib/ · styles/
```

### `src/app/`: sadece route'lar (sayfalar ince tutulur)
| Dosya | Adres | Yerleştirdiği bileşen |
|---|---|---|
| `layout.tsx` | — | Font (`next/font/local`), `tokens.css`, `Providers` |
| `fonts/*.woff2` | — | Schibsted Grotesk (handoff'tan, OFL.txt dahil) |
| `(public)/page.tsx` | `/` | `features/landing` |
| `(public)/giris/page.tsx` | `/giris` | `DemoUserPicker` |
| `(app)/layout.tsx` | — | `AppHeader`, `TabBar`, oturum yoksa `/giris`'e yönlendirme |
| `(app)/ana-sayfa/page.tsx` | `/ana-sayfa` | `features/home` |
| `(app)/sor/page.tsx` | `/sor` | `features/ask` |
| `(app)/sorularim/page.tsx` | `/sorularim` | `MyQuestions` |
| `(app)/soru/[id]/page.tsx` | `/soru/:id` | `features/question` + `features/rating` |
| `(app)/lokal/gelen-kutusu/page.tsx` | `/lokal/gelen-kutusu` | `features/inbox` + `features/answer` |
| `(app)/lokal/arsiv/page.tsx` | `/lokal/arsiv` | `features/archive` |
| `(app)/profil/[id]/page.tsx` | `/profil/:id` | `features/profile` |
| `(app)/ayarlar/page.tsx` | `/ayarlar` | `features/settings` |
| `(app)/bildirimler/page.tsx` | `/bildirimler` | `features/notifications` (telefon görünümü) |
| `dev/page.tsx` | `/dev` | `features/dev-panel` (sadece geliştirme ortamında) |

### `src/data/`: istemcinin veri katmanı
| Dosya | İçerik |
|---|---|
| `repository.ts` | **Sözleşme.** `Repository`, `AuthPort`, `DemoControls` arayüzleri |
| `index.ts` | `getRepository()`, `getAuth()`, `getDemoControls()`, `clock`, `onDataReset()`, `startBackgroundJobs()`: `NEXT_PUBLIC_DATA_SOURCE` değerine göre adapter seçer |
| `query-keys.ts` | TanStack Query anahtarlarının hepsi |
| `use-channel.ts` | `useChannel(channel, keysToInvalidate)` |
| `use-now.ts` | Tek bir interval ile saniyelik saat |
| `mock/clock.ts` | İleri sarılabilen saat |
| `mock/store.ts` | Bellek içi durum + localStorage |
| `mock/sync.ts` | BroadcastChannel |
| `mock/seed.ts` | `docs/handoff/data/seed.json` sözleşme tiplerine çevrilmiş hali |
| `mock/mock-auth.ts` | Hazır kullanıcıyla giriş, oturum sessionStorage'da |
| `mock/mock-repository.ts` | `Repository` arayüzünün mock uygulaması (`@lokale/domain` fonksiyonlarını çağırır) |
| `mock/scheduler.ts` | 2 sn'de bir süresi dolan atamaları işler; Web Locks ile sadece bir sekme (lider) çalıştırır |
| `mock/sync.ts` | BroadcastChannel ile sekmeler arası sinyal |
| `mock/scenario.test.ts` | Brief 5. bölüm senaryosu uçtan uca (vitest) |
| `http/http-repository.ts` | (F2) `ROUTES` + fetch |
| `http/http-auth.ts` | (F2) Better Auth istemcisi |
| `http/event-source.ts` | (F2) token al → `EventSource` → yeniden bağlanma |

### `src/features/`: ekran bazlı özellikler
Her feature'ın içinde `components/`, `hooks/` ve `index.ts` bulunur. Bir feature başka bir feature'ın sadece `index.ts`'inden import eder. Referans ekranlar parantez içinde verilmiştir.

| Klasör | Bileşenler |
|---|---|
| `session/` | `SessionProvider`, `useSession()`, `DemoUserPicker` (1-giris) |
| `landing/` | `LandingPage` (8-tanitim) |
| `home/` | `AskBox`, `ActiveQuestions`, `PopularQuestions` (2-ana) |
| `ask/` | `AskForm`, `SimilarAnswersPanel`, `AskProgress` (3-sor-*) |
| `question/` | `QuestionCard`, `ActiveQuestionCard`, `QuestionJourney`, `AutoMessage`, `HumanAnswerCard`, `ThreadView`, `MyQuestions` (4-detay-*) |
| `rating/` | `RatingBox` (teşekkür durumu dahil), `ReportForm` (şikâyet) (4-detay-tesekkur) |
| `inbox/` | `InboxList`, `InboxItem`, `CapacityMeter`, `AnsweredToday`, `InboxEmpty` (5-gelen-*) |
| `answer/` | `AnswerForm`, `AnswerTemplates`, "Bilmiyorum, sıradakine geçsin" (5-cevapla) |
| `profile/` | `LocalProfileCard` (`full | compact | sheet`), `LocalStatsRow` (6-profil-*) |
| `archive/` | `ArchiveItem`, `MyArchivePage` (lokalin arşivi) |
| `notifications/` | `NotificationBell` (masaüstünde açılır kutu, telefonda `/bildirimler`), `NotificationList`, `NotificationItem`, `useNotifications` (7-bildirim-*) |
| `settings/` | `SettingsPage`: günlük limit, semt, ilgi alanları, çıkış (tasarımı yok, stil rehberine göre) |
| `shell/` | `AppHeader`, `TabBar`, `Logo`, `nav.ts`: oturuma bağlı kabuk (bu yüzden `components/layout`'ta değil) |
| `dev-panel/` | `T` ayarı, zamanı ileri sar, sıfırla, atama tablosu |

### `src/components/`: ortak, iş mantığından bağımsız
| Klasör | Bileşenler |
|---|---|
| `ui/` | `Button`, `Chip`, `TopicChips`, `BudgetSegment`, `Avatar`, `VerifiedSeal`, `VerifiedBadge`, `StatusGlyph`, `StatusLabel`, `Countdown`, `ProgressLine`, `Sheet`, `EmptyState`, `Textarea`, `Select`, `icons.tsx` |
| `layout/` | `RoleToggle`, `CitySelector`, `FlowHeader` + `BackLink`, `Page` + `TwoColumn` (oturumdan bağımsız görünüm bileşenleri) |

Referans: `0-stil-rehberi`. SVG ikonları ekran HTML'lerinden alınıp `icons.tsx` dosyasında toplanır.

### `src/lib/` ve `src/styles/`
| Dosya | İçerik |
|---|---|
| `lib/cn.ts` | className birleştirme |
| `lib/format.ts` | Süre ve tarih biçimlendirme (Türkçe) |
| `lib/person-color.ts` | `personStyle(color)` → `--person` / `--person-on` CSS değişkenleri |
| `styles/tokens.css` | `docs/handoff/design/tokens.css` kopyası (CSS değişkenlerinin tek kaynağı) |
| `styles/globals.css` | `@import "tailwindcss"` + `tokens.css` + `@theme inline` eşlemesi |

`@theme` eşlemesi: renkler `ink`, `ink-2`, `gray`, `gray-soft`, `line-strong`, `line`, `mist`, `paper`, `nar`, `person` (+ `person-on`); köşeler `chip`, `control`, `card`, `panel`, `panel-l`, `sheet`; gölge `pop`.

---

## `apps/api/src/` (F2) — Fastify
| Dosya | İçerik |
|---|---|
| `server.ts` | Fastify kurulumu, pino, zod type provider, OpenAPI (`/api/docs`) |
| `auth.ts` | Better Auth (`/api/auth/*`) |
| `plugins/session.ts` | `request.user`: her korunan route'ta aktör |
| `plugins/errors.ts` | `RepoError` → HTTP durum kodu |
| `routes/questions.ts` · `answers.ts` · `inbox.ts` · `assignments.ts` · `locals.ts` · `archive.ts` · `notifications.ts` · `me.ts` · `reports.ts` | İnce handler: şema → `core` → cevap |
| `routes/realtime-token.ts` | `POST /api/realtime/token` |
| `routes/dev.ts` | Sadece geliştirmede: sıfırla, `T` ayarı |

## `apps/realtime/src/` (F2) — SSE gateway
| Dosya | İçerik |
|---|---|
| `server.ts` | Fastify + `GET /events` |
| `token.ts` | JWT doğrulama (`jose`), kanal yetkisi |
| `hub.ts` | Bellek içi kanal → bağlantı haritası, heartbeat |
| `redis-subscriber.ts` | `evt:*` aboneliği → `hub.dispatch()` |

## `apps/worker/src/` (F2) — BullMQ
| Dosya | İçerik |
|---|---|
| `index.ts` | Worker'ları başlatır, düzgün kapanış |
| `jobs/assignment-deadline.ts` | `core.closeAndReassign(id, "expired")` |
| `jobs/sweep-expired.ts` | Dakikada bir: `core.sweepExpired()` |
| `jobs/refresh-stats.ts` | 5 dk'da bir: `local_stats` yenileme |

---

## Ortam değişkenleri (`.env.example`)
| Ad | Kullanan | Örnek |
|---|---|---|
| `NEXT_PUBLIC_DATA_SOURCE` | web | `mock` / `http` |
| `DATABASE_URL` | api, worker, db | `postgres://lokale:lokale@localhost:5432/lokale` |
| `REDIS_URL` | api, worker, realtime | `redis://localhost:6379` |
| `BETTER_AUTH_SECRET` | api | — |
| `REALTIME_TOKEN_SECRET` | api, realtime | — |
| `API_PORT` / `REALTIME_PORT` | api / realtime | `4000` / `4001` |
