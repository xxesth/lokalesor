# Lokale Sor — tasarım teslim paketi

Bu klasör, "Lokale Sor" demo web uygulamasının onaylanmış tasarımını içerir. Amaç: bu tasarımı responsive bir web uygulaması olarak birebir uygulamak. Tüm arayüz metinleri Türkçe ve tasarımlarda yazdığı gibi kalmalı.

## Klasör yapısı

```
README.md                 ← bu belge (önce bunu oku)
design/tokens.css         ← renk, yazı, boşluk, köşe değişkenleri (tek kaynak)
design/fonts.css          ← Schibsted Grotesk @font-face (yerel woff2, Türkçe destekli)
design/fonts/             ← font dosyaları + OFL lisansı
data/seed.json            ← demo kullanıcıları, sorular, arşiv, şablonlar
screens/index.html        ← tüm ekranların listesi
screens/*.html            ← her ekranın statik HTML referansı (tarayıcıda açılır)
screenshots/*.png         ← her ekranın görüntüsü
```

`screens/*.html` dosyaları **referanstır, üretim kodu değildir**: stiller satır içi (inline) yazıldı, bileşen yapısı yok. Ölçü, renk ve metin için gerçeğin kaynağı bunlardır; kod yapısı için değil. Uygulamada değerleri `design/tokens.css` değişkenlerinden al, tekrar eden parçaları bileşene çevir.

## Ürün özeti

Seyahat eden kullanıcı (turist), gittiği şehirde yaşayan birine (lokal) soru sorar. Sistem soruyu uygun lokale yönlendirir; lokal süresi içinde cevap vermezse soru otomatik olarak sıradaki lokale geçer. Sıra biterse soru "Açık havuz"a düşer. Turist cevabı Faydalı / Güncel / Güvenilir ölçütleriyle değerlendirir; bu değerlendirmeler lokalin Local Score'unu oluşturur.

Tek hesap, iki rol: üst menüdeki Turist/Lokal anahtarıyla geçilir. Cevaplar yapay zekâ ile üretilmez; ürünün vaadi "insan cevabı + hız + güven".

Bu bir demo: gerçek kayıt yok, Giriş ekranında hazır kullanıcı seçilir. İki tarayıcı penceresinde farklı kullanıcılar seçilerek akış uçtan uca gösterilebilmeli (Elif sorar, Zeynep cevaplar).

## Tasarım ilkeleri (uygularken bozulmaması gerekenler)

1. **Sistem gri, insan renkli.** Arayüzün kendisi siyah/beyaz/gri. Her kullanıcının bir kişi rengi var (`seed.json → users[].color`). Renk yalnızca o kişiyi temsil ettiği yerde görünür:
   - avatar dolgusu,
   - soru durum çubuğunda o kişinin elinde kalan süre segmenti,
   - geri sayım ilerleme çubuğu (soruyu o an tutan lokalin renginde),
   - profil sayfasının üst bandı,
   - Lokal modundayken kullanıcının kendi vurgusu (rol anahtarındaki nokta, aktif sekme çizgisi, kapasite çubuğu).

   **Mesaj zeminlerinde kişi rengi kullanılmaz** (bu bilinçli bir karar). Renk asla tek başına bilgi taşımaz; yanında her zaman isim ya da avatar olur.
2. **Otomatik mesaj ile insan cevabı biçimle ayrılır.** Otomatik mesaj: kutusuz, gri metin, küçük kare sistem ikonu, "Otomatik mesaj · saat" etiketi. İnsan cevabı: beyaz kart, 1px kenarlık, avatar + ad + doğrulanmış mührü + "semt · saat". Robot ikonu kullanma; "yapay zekâ cevabı" çağrışımı yapar.
3. **Nar kırmızısı (`--nar`) yalnızca:** son dakikaya giren geri sayım (sayı, nokta ve çubuk), "Yeniden atandı" işareti, okunmamış noktası, bildirim sayısı rozeti, logo noktası. Birincil buton siyahtır, turuncu/kırmızı değildir.
4. **Hız görünür.** Geri sayım rozet değil, büyük ve `font-variant-numeric: tabular-nums` rakamdır ("12:30 kaldı"). Biçim dk:sn.
5. **Tek font ailesi:** Schibsted Grotesk. Başlıklar 800, negatif harf aralığı; gövde 400–500.
6. **Hap biçimi yok.** Butonlar, çipler, girdiler 8px köşeli. Tam yuvarlak yalnızca avatar ve noktalar. Gölge yok; ayrım ince çizgilerle. Gölge yalnızca açılır katmanlarda (bildirim paneli).
7. **Durumlar şekille anlatılır:** İletildi = boş daire, Lokalde = yarım dolu daire, Cevaplandı = dolu daire, Yeniden atandı = nar halka, Açık havuz = kesikli daire. İkonların SVG'leri ekran HTML'lerinde var.
8. **Erişilebilirlik:** dokunma alanı ≥44px; gerçek `<button>`, `<a>`, `<label>`; ikon butonlarda `aria-label`; durum çubuğunda `role="img"` + açıklayıcı `aria-label`; kontrast AA. Telefonda girdiler ≥16px.

## Düzen

- **Telefon (390px, mobil öncelikli):** iki satırlı üst menü (1. satır: logo, zil, avatar; 2. satır: "Şu an: İstanbul ▾" şehir seçici + Turist/Lokal anahtarı) ve alt sekme çubuğu: Ana sayfa · Soru sor · Sorularım · Gelen kutusu · Profil. Aktif sekme: üstte 3px çizgi (turistte siyah, lokalde kişinin rengi).
- **Masaüstü (≥1024px):** alt çubuk yok. Üst menü tek satır (logo · şehir seçici · anahtar, zil, avatar) + altında metin sekmeleri (aktif olan 2px alt çizgili). İçerik en fazla 1200px, iki sütun: ana sütun `flex: 999 1 560px`, yan sütun `flex: 1 1 340–360px`, `flex-wrap: wrap` (dar ekranda alt alta düşer).
- Akış ekranlarında (soru detayı, cevapla, bildirimler) telefonda üst menü yerine geri oku + başlık kullanılır.

## Ekranlar

`screens/index.html` hepsini listeler. Her prompt için telefon ve masaüstü var.

| # | Ekran | Dosyalar | Notlar |
|---|---|---|---|
| 0 | Stil rehberi | `0-stil-rehberi` | Renk, sayaç, durum, buton, lokal satırı örnekleri |
| 1 | Giriş (hazır kullanıcı seçimi) | `1-giris-telefon`, `1-giris-masaustu` | Kart tıklanınca o kullanıcı olarak giriş. Lokallerde doğrulanmış mührü |
| 2 | Ana sayfa (turist) | `2-ana-telefon`, `2-ana-masaustu` | Lokale Sor kutusu + çevrimiçi lokal avatarları, aktif sorular (kişi renginde ilerleme), popüler sorular + konu filtresi |
| 3 | Soru sor | `3-sor-telefon`, `3-sor-masaustu`, `3-sor-araniyor-telefon`, `3-sor-iletildi-telefon` | Yazarken "Benzer sorular cevaplanmış" paneli (Bu yeterli / Yine de sor). Gönderim sonrası iki ara durum |
| 4 | Soru detay (en önemli ekran) | `4-detay-telefon`, `4-detay-masaustu`, `4-detay-bekliyor-telefon`, `4-detay-tesekkur-telefon`, `4-detay-lokal-panel-telefon` | Durum çubuğu (kişi renkli segmentler), otomatik mesajlar, insan cevabı, değerlendirme (3 ölçüt × evet/hayır), Şikâyet et. Masaüstünde sağda lokal kartı + dikey "Sorunun yolculuğu". Telefonda lokal kartı alttan açılan panel |
| 5 | Lokal gelen kutusu + cevapla | `5-gelen-telefon`, `5-cevapla-telefon`, `5-gelen-bos-telefon`, `5-gelen-masaustu` | Kapasite "Bugün 1/2 soru". Süresi azalan öğe nar kenarlıklı. Hazır şablonlar tek dokunuşla metne eklenir. "Arşive eklensin" varsayılan işaretli. "Bilmiyorum, sıradakine geçsin". Masaüstü e-posta istemcisi düzeni |
| 6 | Lokal profil | `6-profil-telefon`, `6-profil-masaustu`, `6-profil-kompakt-kart` | Kişi renginde üst bant, 3 büyük istatistik, konular, son cevaplar. İletişim bilgisi YOK |
| 7 | Bildirimler | `7-bildirim-turist-telefon`, `7-bildirim-lokal-telefon`, `7-bildirim-masaustu` | Telefonda tam sayfa, masaüstünde zilin altında açılır kutu. Okunmamış: sis zemin + nar nokta. İnsan kaynaklı bildirim avatarla, sistem bildirimi gri kare ikonla |
| 8 | Tanıtım (landing) | `8-tanitim-telefon`, `8-tanitim-masaustu` | Hero, ürün örneği (gerçek bileşenlerle), Nasıl çalışır 01–03, siyah güven şeridi |

## Bileşen envanteri (önerilen)

Ekranlarda tekrar eden parçalar; her biri tek bileşen olmalı:

- `AppHeader` (telefon iki satır / masaüstü tek satır + sekmeler; `role: turist|lokal`, `user`)
- `TabBar` (telefon), `DesktopTabs`
- `RoleToggle` (Turist/Lokal; lokal aktifken kişi rengi noktası)
- `CitySelector`
- `NotificationBell` (sayı rozeti, 9+ taşması)
- `Avatar` (kişi rengi dolgu + baş harf; sonra fotoğraf; boyutlar 20/22/24/28/36/40/44/48/56/64/72/88/120)
- `VerifiedSeal` (ikon) ve `VerifiedBadge` (ikon + "Doğrulanmış", kenarlıklı)
- `StatusGlyph` + `StatusLabel` (İletildi, Lokalde, Yeniden atandı, Cevaplandı, Açık havuz)
- `Countdown` (dk:sn, tabular; `urgent` olduğunda nar + nokta) + `ProgressLine` (kişi renginde)
- `QuestionJourney` (yatay telefon / dikey masaüstü; `assignments[]` süreleriyle orantılı segmentler, aralarda nar halka)
- `SystemMessage` (gri, kutusuz, kare ikon, "Otomatik mesaj · saat")
- `HumanAnswerCard`
- `QuestionCard` (sis zemin, etiketler) ve `ActiveQuestionCard`
- `ArchiveItem` (konu, soru, alıntı, avatar + ad + tarih, faydalı sayısı)
- `TopicChips` (filtre: çoklu; soru formu: tek seçim), `BudgetSegment` (₺/₺₺/₺₺₺)
- `RatingBox` (3 ölçüt × evet/hayır başparmak butonları, Gönder, Şikâyet et)
- `CapacityMeter` ("Bugün n/2 soru", kişi rengi segmentler)
- `AnswerTemplates` (dokununca metin alanına ekler)
- `LocalProfileCard` (tam / kompakt / alttan panel)
- `NotificationItem`, `NotificationPanel`

## Davranış ve durumlar

- **Yönlendirme:** soru, şehir + semt + konuya göre bir lokale atanır. Süre dolarsa `outcome: timeout` ile kapanır ve sıradaki lokale yeni `assignment` açılır; sohbet akışına "Yeniden atandı" sistem mesajı eklenir. Lokal "Bilmiyorum, sıradakine geçsin" derse aynı akış hemen çalışır. Sıra biterse durum "Açık havuz".
- **Geri sayım:** soruyu tutan lokalin kalan süresi. Son 1 dakikada `urgent` (nar). Turistte aktif soru kartında ve detay ekranında, lokalde gelen kutusu öğesinde ve cevapla ekranının başlığında görünür.
- **Kapasite:** lokalin günlük soru limiti (demo: 2). Gelen kutusunda gösterilir; dolunca yeni soru atanmaz.
- **Değerlendirme:** üç ölçüt bağımsız (her biri evet/hayır, boş bırakılabilir). Gönderilince teşekkür durumu ve lokalin güncel Local Score'u gösterilir.
- **Arşiv:** "Arşive eklensin" işaretli cevaplar popüler sorular ve "Benzer sorular" panelinde görünür ("Lokal onaylı" etiketiyle).
- **Bildirimler:** turist → "X soruna cevap verdi", "Sorun X'e yönlendirildi", "Sorun X'e iletildi"; lokal → "Yeni bir soru var: Konu – Semt. Cevaplamak için N dk'n var." (Cevapla butonlu), "Soru bir sonraki lokale yönlendirildi.", "X cevabını faydalı buldu". "Tümünü okundu yap".
- **Demo modu:** iki pencere aynı veriyi görmeli (ör. localStorage + `storage` olayı ya da basit bir sunucu). Elif'in sorusu Zeynep'in gelen kutusuna düşmeli, Zeynep'in cevabı Elif'in detay ekranına gelmeli.

## Açık kararlar (uygulamadan önce netleştir)

1. **Lokalin cevap süresi.** Prompt'larda hem "~20–25 dk" hem de lokal bildiriminde "Cevaplamak için 1 dk'n var" geçiyor. Tasarımda turist tarafı ~20–25 dk, lokal tarafı 0:48 gibi kısa süre gösteriyor. Tek bir süre modeli seçilmeli (ör. kabul için kısa süre + cevap için uzun süre).
2. **Kişi rengi ataması.** Demo'da sabit. Gerçekte lokalin kayıt sırasında rengini kendisinin seçmesi önerildi.
3. **Zeynep'in örnek cevabı** "Moda'da Çiya'nın arka sokağı" diyor; Çiya Kadıköy Çarşı'da. Demo metni olarak bırakıldı, düzeltilebilir.
4. **Prompt'tan bilinçli sapmalar:** turuncu butonlar → siyah birincil buton (turuncunun rolünü nar kırmızısı yalnızca aciliyet için üstlendi); yeşil "Doğrulanmış" → siyah mühür (yeşil bir kişi rengiyle çakışıyordu); 👋 ve 👍/👎 emojileri → çizgi ikonlar.

## Teknik not

Teknoloji serbest. Kurulum sırasında: fontu `design/fonts/` içinden yerel yükle (Google Fonts'a bağımlı olma), `design/tokens.css`'i global olarak içe aktar, `data/seed.json`'u demo verisi olarak kullan. Her ekranı tamamladığında `screenshots/` içindeki görüntüyle 390px ve 1440px genişlikte karşılaştır.
