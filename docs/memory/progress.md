# İlerleme

Format: `YYYY-MM-DD · kişi · ne yapıldı · ne kaldı`. En yeni kayıt en üstte olur.

## Durum
- **Faz 1** tamamlandı (demo mock üzerinde çalışıyor).
- **Çalışan:** `pnpm dev` → web; senaryo testleri yeşil
- **Faz:** 2 başladı. Bloklayan işler bitti; Fatih api/core use-case'lerine, Ökkeş havuz/engelleme/ayarlar ekranlarına başlayabilir.
- **Sıradaki (Mali):** worker, realtime, event-source, turbo dev + rewrite'lar, CI.

## Günlük
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

- [ ] 2026-11-23 · Ökkeş · `SettingsPatch` + `updateSettings`: `name` ve `color` alanları. Profil düzenlemede ad ve kişi rengi değiştirilemiyor. Rengin kayıtta seçilmesi Faz 3'te (Açık konular), ama demo kullanıcıları için de gerekebilir.
- [ ] 2026-11-23 · Ökkeş · `SettingsPatch.avatarUrl` + fotoğraf yükleme (yeni, örn. `uploadAvatar(file): Promise<{ avatarUrl }>`): profil fotoğrafı. `User.avatarUrl` alanı var ama değiştirmenin yolu yok. Gerçek arka uçta dosya depolaması (disk/S3) ve boyut/tür sınırı gerekir; mock'ta data URL yeter. Kişisel bilgi kuralı (madde 12) için yüz fotoğrafı zorunlu değil, isteğe bağlı olmalı.
- [ ] 2026-11-23 · Ökkeş · `setAnswerText(answerId, text)` (yeni): lokalin arşivdeki cevabını düzenlemesi için.

## Tasarımla ilgili açık konular
- Demo isimleri tasarımdan farklı: tasarımdaki Elif / Mert / Zeynep yerine Efe Genç / Mert Özçelik / Nevin Arslan. Ekran görüntüleriyle karşılaştırırken isim farkı normal.
- Örnek cevaptaki "Moda'da Çiya'nın arka sokağı" yanlış, çünkü Çiya Kadıköy Çarşı'da. Seed'e aktarırken düzeltilecek.
- Kişi rengi demoda sabit. Gerçek kullanımda lokal rengini kayıt sırasında kendisi seçecek (2. faz).
- AskBox'taki "müsait lokaller" avatarları çevrimiçi durumunu değil, **bugün kapasitesi olan** lokalleri gösteriyor. Gerçek bir presence özelliği yok.
- Ayarlar ve lokalin arşivi sayfaları için tasarım yok. Stil rehberine göre yapılacak (🟡).

## Açık sorular (EM ekibine)
- `T`, deneme sınırı ve eşleştirme ağırlıkları için kesin değerler hangi tarihte gelecek? Şu an `config.ts` içindeki varsayılanlar kullanılıyor.
