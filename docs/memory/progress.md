# İlerleme

Format: `YYYY-MM-DD · kişi · ne yapıldı · ne kaldı`. En yeni kayıt en üstte olur.

## Durum
- **Faz 1** tamamlandı (demo mock üzerinde çalışıyor).
- **Çalışan:** `pnpm dev` → web; senaryo testleri yeşil
- **Faz:** 2 başladı. Bloklayan işler bitti; Fatih api/core use-case'lerine, Ökkeş havuz/engelleme/ayarlar ekranlarına başlayabilir.
- **Sıradaki (Mali):** worker, realtime, event-source, turbo dev + rewrite'lar, CI.

## Günlük
- 2026-11-23 · Ökkeş (Claude ile) · Branch `feat/loading-error-empty-states`: hata ve yükleme durumları. `ErrorNote` artık nar değil siyah kenarlık kullanıyor (kural 9: nar sadece aciliyet) ve "Tekrar dene" düğmesi var (NOT_FOUND/FORBIDDEN'da gizli). Eksik olan ana sayfa, arşiv, bildirimler ve giriş ekranlarına hata kutusu eklendi, `Loading` `role="status"` oldu. `app/error.tsx` ve `app/not-found.tsx` eklendi. Node 22.23.5'e geçildi, `pnpm test` yeşil (domain 20, web 5; core'un 9 testi Postgres yok diye atlandı). · Kalan: gerçek bir ağ hatasında "Tekrar dene" akışı denenmedi (mock hata fırlatmıyor); erişilebilirlik turu, 390/1024/1440 karşılaştırması.
- 2026-11-23 · Ökkeş (Claude ile) · Branch `feat/open-pool-ui`: açık havuz arayüzü. Lokal gelen kutusunda `PoolSection` (canlı, yerinde cevap formu), lokal ana sayfada havuz özeti, turistin soru detayında havuz bilgilendirmesi. `AnswerForm` hem atamayı hem havuzu cevaplıyor. Metinler `@lokale/domain/messages.ts`'te. Sözleşme değişmedi. · Kalan: tarayıcıda deneme, havuz için testler (testler çalıştırılamıyor: Node 22.11, rolldown 22.12+ istiyor).
- 2026-11-23 · Ökkeş (Claude ile) · Branch `fix/role-aware-screens`:
  - Rol bazlı içerik: ana sayfa (lokalde kapasite ve bekleyenler), Sorularım (lokalde Cevaplarım), `RoleGate` (`/sor` sadece turistte, gelen kutusu sadece lokalde, geçiş butonuyla). Alt sekme etiketi tek satıra sabitlendi.
  - Engelleme: Ayarlar'da Engellenenler listesi, şikâyet formunda "lokali engelle" seçeneği. Profilde Ayarlar ve Soru arşivim bağlantıları (arşiv sayfasına hiçbir yerden link yoktu).
- 2026-11-17 · Mali (Claude ile) · Faz 2'nin bloklayan işleri bitti:
  - `docker-compose.yml` (Postgres 17 + Redis 7 + `lokale_test`), `.env.example`.
  - `@lokale/db`: şema + ilk migration. Şemayı Fatih yerine Mali yazdı, çünkü `assignNext` buna bağlıydı.
  - `@lokale/core`: `withTx` (commit sonrası yayın/kuyruk), Redis yayını, BullMQ kuyruğu, dev saat/T, realtime token, `assignNext` / `closeAndReassign` / `declineAssignment` / `sweepExpired`. 10 entegrasyon testi gerçek Postgres'te geçiyor (kapasite yarışı ve çift süre işi dahil). Testte bulunan hata: drizzle alt sorguda `users.id`'yi `"id"` yazıyor, bu yüzden kapasite hep 0 sayılıyordu; düzeltildi.
  - Sözleşme: açık havuz ve engelleme (ADR-027, ADR-028), mock'ta çalışıyor ve test edildi. `SEED_VERSION` = 3.
  - · Kalan: worker, realtime, event-source, turbo dev, CI.
- 2026-11-14 · Mali (Claude ile) · Düzeltme: turistin soru sayfası, lokal cevaplayınca yenilenmiyordu. Sebep: BroadcastChannel sinyali, ayrı pencerelerde localStorage'dan önce ulaşıyordu ve eski veri okunuyordu. Senkron `storage` olayına taşındı (olay yeni veriyi taşıyor), yazmalara `rev` sürüm numarası eklendi. Ek olarak soru beklerken 10 sn'de bir tazeleme var.
- 2026-11-14 · Mali (Claude ile) · Faz 1 bitti:
  - pnpm + Turborepo monorepo kuruldu.
  - `@lokale/contracts` (tipler, zod şemaları, ROUTES, kanallar, hatalar) ve `@lokale/domain` (eşleştirme, yeniden atama, mesajlar, istatistik, benzerlik, 20 test) yazıldı.
  - MockAdapter yazıldı: localStorage + Web Locks + `storage` olayı; zamanlayıcıyı lider sekme çalıştırıyor.
  - Bütün demo ekranları + 🟡 ekranlar (landing, benzer cevaplar, ayarlar, arşivim, şikâyet) ve `/dev` paneli yapıldı.
  - Senaryo testi ve headless tarayıcıda iki sekmeli uçtan uca prova geçti.
  - · Kalan: sunum için son ekran görüntüleri, Faz 2.
- 2026-11-14 · Mali · Mimari ayrık yapıya geçti: web + api + realtime + worker, pnpm + Turborepo monorepo (ADR-016…026). Rust değerlendirildi, TypeScript'te kalındı. Tüm memory dosyaları güncellendi. · Kalan: Faz 1'e başlamak.
- 2026-11-14 · BM · Claude Design teslimi `docs/handoff/` klasörüne eklendi. Görsel kimlik handoff'tan alındı (ADR-013), süre modeli netleşti (ADR-015). Sözleşmeye eklenenler: kişi rengi, `declineAssignment`, `getInbox` (tek çağrı), boş bırakılabilir değerlendirme, journey verisi, yeni bildirim türleri. · Kalan: görev dağılımı.
- 2026-11-13 · BM · Mimari kararlar alındı (ADR-001…012). Claude Design promptları hazırlandı (`claude-design-prompts.md`). Ekip hafızası oluşturuldu. · Kalan: görev dağılımı.

## Geçici çözümler (kaldırılacak)
- `apps/web/next.config.ts` → `allowedDevOrigins: ["*.trycloudflare.com"]`: demoyu Cloudflare tüneliyle paylaşmak için eklendi (2026-11-14). Faz 2'de kaldırılacak, `todo.md`'de Mali'nin listesinde.

## Bloklar
_Yok._

## Sözleşme talepleri
Format: `tarih · kim · hangi tip/fonksiyon · neden`. Sözleşme sahibi karara bağlayınca işaretlenir.

### Bekleyen talepler (Mali karar verir; onaylanınca Fatih tek seferde yazar)
Üçü de `PATCH /api/me/settings` ve `PATCH /api/answers/:id` üzerinde, yeni route gerektirmeden çözülebiliyor. Önerilen şekiller hazır; onaylanırsa ben mock'u ve ekranları yazarım.

- [ ] 2026-11-23 · Ökkeş · **Ad ve kişi rengi.** `settingsPatch`'e `name: z.string().trim().min(2).max(60).optional()` ve `color: z.enum(PERSON_COLORS).optional()`. Neden: profil düzenleme. Not: eski mesaj ve bildirim metinleri ad içeriyor ("X soruna cevap verdi"), geçmiş metinler eski adla kalır, bunu kabul ediyoruz.
- [ ] 2026-11-23 · Ökkeş · **Avatar fotoğrafı.** `uploadAvatar(file: File): Promise<{ avatarUrl: string }>` (`POST /api/me/avatar`, multipart, en çok 1 MB, sadece jpeg/png/webp) ve `removeAvatar(): Promise<void>` (`DELETE /api/me/avatar`). `User.avatarUrl` zaten var. Gerçek arka uçta dosya depolaması gerekir (yerelde disk, yayında S3 uyumlu; karar Mali'de). Mock'ta data URL yeter. Fotoğraf zorunlu değil, isteğe bağlı; yoksa baş harfli avatar kalır. Kişisel bilgi kuralı (madde 12): yüklenen dosyanın EXIF/konum verisi sunucuda silinmeli.
- [ ] 2026-11-23 · Ökkeş · **Cevap metni düzenleme.** `setArchived(answerId, archived)` yerine `updateAnswer(answerId, { archived?, text? })` (aynı `PATCH /api/answers/:id`, `text` isteğe bağlı eklenir). Sadece cevabı yazan lokal, `text` 5-2000 karakter. Düzenlenen cevapta "düzenlendi" işareti gerekirse `Answer.editedAt: Timestamp | null` eklenir (öneri: ekleyelim, turist cevabın sonradan değiştiğini görsün).

### Backend'in birebir uyması gereken davranışlar (sözleşmede yazmıyor)
Arayüz mock'un şu davranışlarına dayanıyor. Fatih `core`/`api` yazarken aynısını yapmalı; Mali isterse `contracts.md`'ye taşır.

1. **`listMyArchive` = lokalin *bütün* cevapları**, sadece arşivlenenler değil. `answer.archived` bayrağı döner. İki ekran buna bağlı: "Soru arşivim" (arşive ekle / kaldır) ve lokal modunda "Cevaplarım" sekmesi. Sadece `archived = true` dönerse arşivden kaldırılan cevap listeden kaybolur ve geri eklenemez. Sentetik geçmiş cevaplar ("(geçmiş cevap)") hariç tutulur.
2. **Şehir değişince `roleOverride` sıfırlanır.** `PATCH /api/me/session { currentCity }` tek başına gelirse `roleOverride = null` olur; ikisi birlikte gelirse gönderilen değer korunur. Rol istemcide `resolveRole` ile hesaplanır, sunucu rol yüzünden hiçbir ucu kapatmamalı (gelen kutusu ve havuz yetkisi rol değil `homeCity` ve atamaya bağlı).
3. **Şikâyet + engelle iki ayrı çağrı:** `POST /api/reports` sonra `POST /api/me/blocks`. İkisi de idempotent olmalı; ikincisi başarısız olursa şikâyet kalır, istemci hatayı gösterir.
4. **Havuz:** `GET /api/pool` sadece `homeCity` eşleşen, kendi sorun olmayan ve engel ilişkisi olmayan soruları döner. `POST /api/pool/:id/answer` başkası önce cevapladıysa `409 QUESTION_CLOSED`; istemci bu hatada listeyi yeniler. Havuz cevabı kapasiteyi artırmaz (ADR-027).
5. **`GET /api/inbox`:** `pending` sadece `status = pending` ve `deadline > now` olan atamalar, süreye göre artan sırada. `capacity.used` bugünkü atama sayısı (havuz cevapları sayılmaz). Lokal ana sayfa da aynı çağrıyı kullanır, ayrı uç yok.
6. **Hata kodları:** `NOT_FOUND` ve `FORBIDDEN` aldığında arayüz "Tekrar dene" göstermiyor. Bir soruyu başkası açarsa `FORBIDDEN`, olmayan id `NOT_FOUND` (404) dönmeli; `500` her şey için kullanılmamalı.

## Tasarımla ilgili açık konular
- Demo isimleri tasarımdan farklı: tasarımdaki Elif / Mert / Zeynep yerine Efe Genç / Mert Özçelik / Nevin Arslan. Ekran görüntüleriyle karşılaştırırken isim farkı normal.
- Örnek cevaptaki "Moda'da Çiya'nın arka sokağı" yanlış, çünkü Çiya Kadıköy Çarşı'da. Seed'e aktarırken düzeltilecek.
- Kişi rengi demoda sabit. Gerçek kullanımda lokal rengini kayıt sırasında kendisi seçecek (2. faz).
- AskBox'taki "müsait lokaller" avatarları çevrimiçi durumunu değil, **bugün kapasitesi olan** lokalleri gösteriyor. Gerçek bir presence özelliği yok.
- **Puan verdikten sonra şikâyet/engelleme yok** (2026-11-23, Ökkeş): `RatingBox` değerlendirme gönderilince "Teşekkürler" durumuna geçiyor ve "Şikâyet et" bağlantısı kayboluyor (handoff `4-detay-tesekkur`'da da yok). Lokali engellemenin tek yolu şikâyet formundaki onay kutusu olduğu için puan verdikten sonra engellenemiyor; Ayarlar'da sadece engeli kaldırma var. Brief #12 şikâyet/engellemeyi ayrı bir akış olarak tarif ediyor ama giriş noktasını belirtmiyor. Karar bekliyor: teşekkür durumuna "Şikâyet et / engelle" bağlantısı eklensin mi, yoksa lokal profilinde "Engelle" mi olsun?
- Ayarlar ve lokalin arşivi sayfaları için tasarım yok. Stil rehberine göre yapılacak (🟡).

## Açık sorular (EM ekibine)
- `T`, deneme sınırı ve eşleştirme ağırlıkları için kesin değerler hangi tarihte gelecek? Şu an `config.ts` içindeki varsayılanlar kullanılıyor.
