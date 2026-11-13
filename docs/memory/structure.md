# Klasör yapısı — hangi kod nereye yazılır

Yeni bir dosya açtığında bu dosyayı güncelle. Dosya isimleri kebab-case olur (bkz. `conventions.md`).

```
/
├─ CLAUDE.md
├─ claude-design-prompts.md
├─ docs/brief.md                # ürün brief'i (EM). Görsel kimlik bölümü geçersiz → handoff
├─ docs/memory/                 # ekip hafızası
├─ docs/handoff/                # Claude Design teslimi (salt okunur referans)
│  ├─ README.md                 #   tasarım ilkeleri, bileşen envanteri, davranışlar
│  ├─ design/                   #   tokens.css, fonts.css, fonts/*.woff2
│  ├─ data/seed.json            #   demo verisi (mock/seed.ts'e çevrilir)
│  ├─ screens/*.html            #   statik ekran referansları
│  └─ screenshots/*.png         #   karşılaştırma görüntüleri
├─ docker-compose.yml           # (2. faz) Postgres
├─ drizzle.config.ts            # (2. faz)
├─ drizzle/                     # (2. faz) migration dosyaları, elle düzenlenmez
└─ src/
   ├─ app/
   ├─ domain/
   ├─ data/
   ├─ server/                   # (2. faz)
   ├─ features/
   ├─ components/
   ├─ lib/
   └─ styles/
```

## `src/app/`: sadece route'lar
Sayfalar ince tutulur: feature bileşenini import edip yerleştirir. İçlerinde veri mantığı olmaz.

| Dosya | Adres | Yerleştirdiği bileşen |
|---|---|---|
| `layout.tsx` | — | Font (`next/font/local`, `src/app/fonts/`), `tokens.css`, `Providers` (Query + Session + Repository) |
| `fonts/*.woff2` | — | Schibsted Grotesk, `docs/handoff/design/fonts/` klasöründen kopyalanır (lisans dosyası OFL.txt ile birlikte) |
| `(public)/page.tsx` | `/` | `features/landing` |
| `(public)/giris/page.tsx` | `/giris` | `features/session/components/demo-user-picker` |
| `(app)/layout.tsx` | — | `TopBar`, `BottomNav`, oturum yoksa `/giris`'e yönlendirme |
| `(app)/ana-sayfa/page.tsx` | `/ana-sayfa` | `features/home` |
| `(app)/sor/page.tsx` | `/sor` | `features/ask` |
| `(app)/sorularim/page.tsx` | `/sorularim` | `features/question/components/my-questions` |
| `(app)/soru/[id]/page.tsx` | `/soru/:id` | `features/question` + `features/rating` |
| `(app)/lokal/gelen-kutusu/page.tsx` | `/lokal/gelen-kutusu` | `features/inbox` + `features/answer` |
| `(app)/lokal/arsiv/page.tsx` | `/lokal/arsiv` | `features/archive` |
| `(app)/profil/[id]/page.tsx` | `/profil/:id` | `features/profile` |
| `(app)/ayarlar/page.tsx` | `/ayarlar` | `features/settings` |
| `(app)/bildirimler/page.tsx` | `/bildirimler` | `features/notifications` (telefon görünümü) |
| `dev/page.tsx` | `/dev` | `features/dev-panel` (sadece geliştirme ortamında) |
| `api/**/route.ts` | `/api/...` | (2. faz) İnce handler: zod ile doğrula → service çağır → JSON döndür |
| `api/events/route.ts` | `/api/events` | (2. faz) SSE uç noktası |

## `src/domain/`: saf TS, testli
| Dosya | İçerik |
|---|---|
| `types.ts` | **Sözleşme.** Tüm varlık tipleri ve enum'lar |
| `config.ts` | İş kuralı parametreleri (`T`, deneme sınırı, ağırlıklar) |
| `labels.ts` | `TOPIC_LABELS`, `BUDGET_LABELS`, şehir/semt adları (Türkçe görünen isimler) |
| `countdown.ts` | `remaining()`, `isUrgent()` |
| `role.ts` | `resolveRole(user, currentCity, override?)` |
| `matching.ts` | `filterEligible()`, `rankCandidates()`, `pickNextLocal()` |
| `reassignment.ts` | `isExpired()`, `planNextStep()` → `reassign` / `open_pool` (hem süre dolmasında hem `decline` durumunda kullanılır) |
| `messages.ts` | Otomatik mesaj şablonları (turiste ve lokale gidenler) |
| `answer-templates.ts` | Lokal için hazır cevap şablonları |
| `stats.ts` | `computeLocalStats()`: medyan süre, yanıt oranı, Local Score; `formatEta()` |
| `similarity.ts` | Benzer soru bulma (1. fazda kelime eşleşmesi) |
| `*.test.ts` | Her dosyanın yanında birim testi |

## `src/data/`: istemcinin veri katmanı
| Dosya | İçerik |
|---|---|
| `repository.ts` | **Sözleşme.** `Repository`, `AuthPort`, `DemoControls` arayüzleri |
| `index.ts` | `getRepository()`: `NEXT_PUBLIC_DATA_SOURCE=mock|http` değerine göre adapter seçer |
| `errors.ts` | `RepoError` ve hata kodları |
| `query-keys.ts` | TanStack Query anahtarlarının hepsi burada tanımlanır |
| `use-channel.ts` | `useChannel(channel, keysToInvalidate)`: abonelik + invalidate |
| `mock/store.ts` | Bellek içi durum + localStorage kalıcılığı |
| `mock/sync.ts` | `BroadcastChannel` ile sekmeler arası olaylar |
| `mock/mock-repository.ts` | `Repository` arayüzünün mock uygulaması (domain fonksiyonlarını çağırır) |
| `mock/mock-auth.ts` | Hazır kullanıcıyla giriş, oturum `sessionStorage`'da tutulur |
| `mock/scheduler.ts` | Her 5 sn'de bir `expireAssignments(now)` çalıştırır |
| `mock/clock.ts` | Ayarlanabilir saat (dev panelden zamanı ileri sarmak için) |
| `mock/seed.ts` | Demo verisi: `docs/handoff/data/seed.json` dosyasından sözleşme tiplerine çevrilir (İngilizce ID ve enum'lar, epoch ms). Kullanıcılar, arşiv, geçmiş atamalar. |
| `http/http-repository.ts` | (2. faz) fetch + `EventSource` |
| `http/http-auth.ts` | (2. faz) Better Auth istemcisi |

## `src/server/`: (2. faz) sadece sunucu, her dosyada `import "server-only"`
| Dosya | İçerik |
|---|---|
| `db/client.ts` | Drizzle + `pg` havuzu |
| `db/schema.ts` | Tablolar, index'ler |
| `services/questions.ts` | `askQuestion`, `getThread`, `listMine` |
| `services/answers.ts` | `submitAnswer`, `rateAnswer` |
| `services/assignments.ts` | `expireAssignments` (SKIP LOCKED) |
| `services/profiles.ts` | Profil ve istatistik okuma |
| `services/notifications.ts` | Bildirim oluşturma ve listeleme |
| `realtime/broker.ts` | `LISTEN/NOTIFY` → SSE abonelerine dağıtım |
| `realtime/publish.ts` | `publish(channel, event)` (commit'ten sonra çağrılır) |
| `auth.ts` | Better Auth yapılandırması |
| `session.ts` | `requireUser()`: aktörü oturumdan alır |
| `jobs/reassign.ts` | `instrumentation.ts` tarafından çalıştırılan zamanlayıcı |

## `src/features/`: ekran bazlı özellikler
Her feature'ın içinde `components/` ve `hooks/` bulunur. Gerekirse bir `index.ts` ile dışa aktarım yapılır. Bir feature başka bir feature'ın **iç dosyasını** import etmez, sadece `index.ts`'inden import eder.

Bileşen isimleri handoff README'sindeki "Bileşen envanteri" ile aynıdır. Referans ekranlar parantez içinde verilmiştir.

| Klasör | Bileşenler |
|---|---|
| `session/` | `SessionProvider`, `useSession()` (kullanıcı, şu anki şehir, rol), `DemoUserPicker` (1-giris) |
| `landing/` | `LandingPage` (8-tanitim) |
| `home/` | `AskBox` (müsait lokal avatarlarıyla), `ActiveQuestions`, `PopularQuestions` (2-ana) |
| `ask/` | `AskForm`, `SimilarAnswersPanel`, `AskProgress` (aranıyor → iletildi) (3-sor-*) |
| `question/` | `QuestionCard`, `ActiveQuestionCard`, `QuestionJourney` (yatay/dikey), `AutoMessage`, `HumanAnswerCard`, `ThreadView`, `MyQuestions` (4-detay-*) |
| `rating/` | `RatingBox` (3 ölçüt × evet/hayır, Gönder, Şikâyet et), `RatingThanks` (4-detay-tesekkur) |
| `inbox/` | `InboxList`, `InboxItem`, `CapacityMeter`, `AnsweredToday`, `InboxEmpty` (5-gelen-*) |
| `answer/` | `AnswerForm`, `AnswerTemplates`, "Bilmiyorum, sıradakine geçsin" (5-cevapla) |
| `profile/` | `LocalProfileCard` (`variant: full | compact | sheet`), `LocalStatsRow` (6-profil-*) |
| `archive/` | `ArchiveItem` (ana sayfa, benzer cevaplar ve profil ortak kullanır), lokalin arşiv sayfası |
| `notifications/` | `NotificationPanel`, `NotificationItem` (7-bildirim-*) |
| `settings/` | Rol/şehir, günlük limit (tasarımı yok, stil rehberine göre yapılır) |
| `dev-panel/` | `T` ayarı, zamanı ileri sar, demoyu sıfırla, atamaları görüntüle |

## `src/components/`: ortak, iş mantığından bağımsız
| Klasör | Bileşenler |
|---|---|
| `ui/` | `Button` (birincil siyah / ikincil / metin), `Chip`, `TopicChips` (tekli/çoklu seçim), `BudgetSegment`, `Avatar` (kişi rengi + baş harf; boyutlar handoff'ta), `VerifiedSeal`, `VerifiedBadge`, `StatusGlyph`, `StatusLabel`, `Countdown` (dk:sn, tabular-nums, `urgent`), `ProgressLine`, `Sheet` (alttan açılan panel), `EmptyState`, `Textarea`, `Select` |
| `layout/` | `AppHeader` (telefonda 2 satır, masaüstünde 1 satır), `TabBar` (telefon), `DesktopTabs`, `RoleToggle`, `CitySelector`, `NotificationBell` (9+ taşması), `FlowHeader` (geri oku + başlık), `TwoColumn` |

Referans: `0-stil-rehberi` ekranı. SVG ikonları (durum glifleri, mühür) ekran HTML'lerinden alınıp `src/components/ui/icons.tsx` dosyasında toplanır.

## `src/lib/`
| Dosya | İçerik |
|---|---|
| `cn.ts` | className birleştirme |
| `format.ts` | Süre ve tarih biçimlendirme (Türkçe) |
| `ids.ts` | ID üretimi |
| `person-color.ts` | `personStyle(color)`: kişi rengi CSS değişkenlerini döndürür |

## `src/styles/`
| Dosya | İçerik |
|---|---|
| `tokens.css` | `docs/handoff/design/tokens.css` dosyasının kopyası. CSS değişkenlerinin tek kaynağı bu dosya. Handoff güncellenirse buraya da yansıtılır. |
| `globals.css` | `@import "tailwindcss"` + `tokens.css` + `@theme inline` eşlemesi |

`@theme` eşlemesi şöyle olur: renkler `ink`, `ink-2`, `gray`, `gray-soft`, `line-strong`, `line`, `mist`, `paper`, `nar`; kişi renkleri `person-kobalt` … `person-deniz`; köşeler `chip`, `control`, `card`, `panel`, `panel-l`, `sheet`; gölge `pop`.

**Kişi rengi:** Bileşen kökünde `style={{ "--person": "var(--person-kobalt)", "--person-on": "var(--person-kobalt-on)" }}` verilir, içeride `bg-person` / `text-person-on` sınıfları kullanılır. Bunu `lib/person-color.ts` içindeki `personStyle(color)` fonksiyonu üretir.
