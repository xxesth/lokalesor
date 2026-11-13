# Lokale Sor – Web Demo Brief (BM ekibi için)

> Kaynak: IND 496 Ara Rapor (14 Kasım 2026), 56 kişilik anket ve Kalite Evleri.
> Bu doküman, demo için gereken ürün bilgisini tek yerde toplar. **Demo, responsive bir web sitesi olarak geliştirilecek** (mobil uygulama ileri bir aşama). Teknik tercihler (framework, veri tabanı) BM ekibinin kararıdır; buradaki öneriler bağlayıcı değildir.

---

## 1. Uygulamanın genel fikri

**Lokale Sor**, seyahat eden birinin gittiği şehirde yaşayan insanlara doğrudan soru sorabildiği, insan odaklı ve güvene dayalı bir seyahat platformudur.

- **Problem:** Google Maps, sosyal medya ve forumlar mekânı gösteriyor ama kişiye özel bir soruya ("Öğrenci bütçesiyle akşam nereye gidebilirim?") o şehirde yaşayan birinin **hızlı ve güvenilir** cevap vermesini sağlamıyor.
- **Çözüm:** Turist soru sorar, sistem soruyu uygun bir lokale yönlendirir, lokal cevaplar, turist cevabı değerlendirir.
- **Temel fark – tek hesap, iki rol:** Kullanıcılar kalıcı olarak "turist" veya "lokal" diye ayrılmaz. Herkesin tek hesabı vardır:
  - Başka bir şehirdeyken **turist** rolündedir → soru sorar.
  - Kendi şehrindeyken **lokal** rolündedir → soru cevaplar.
- **Vaat:** İnsan cevabı + hız + güven. Cevaplar yapay zekâ ile üretilmez; otomatik mesajlar yalnızca **kural tabanlıdır** (LLM yok).

### Anketten tasarıma gelen 5 kritik bulgu

| Bulgu (n = 56) | Tasarıma etkisi |
|---|---|
| %77 yerel birine soru sormak istiyor, ama yalnızca %50 tavsiye vermek istiyor | Darboğaz **lokal tarafı**: lokalin işini kolaylaştırmak öncelik |
| %57 cevabı 2 saat içinde, %39 30 dk içinde istiyor | **Yanıt süresi** ana performans göstergesi |
| %63 "cevap gelmezse soru başka lokale gitsin" diyor (en çok seçilen özellik) | **Otomatik yeniden atama** çekirdek özellik |
| Lokalleri en çok vazgeçiren: zaman alması (%61), aynı soruların tekrarı (%50) | **Hazır cevap şablonları** + **soru arşivi** |
| %70 lokal günde en fazla 1-2 soruya cevap verebilir | **Günlük soru limiti** ve yük dengeleme |

Düşük öncelikliler: seviye/puan sistemi (%14 olmazsa olmaz), Local Partner indirimleri (%9). Bunlar demo için gerekli değil.

---

## 2. Çalışma mantığı

### 2.1 Soru yaşam döngüsü (ana akış)

```
Turist soru sorar (şehir + konu etiketi + bütçe etiketi)
        │
        ▼
Arşivde benzer, lokal onaylı cevap var mı? ──evet──► Arşiv cevabı gösterilir ──"yeterli"──► Değerlendirme
        │ hayır                                              │ "yetmedi"
        ▼                                                    ▼
Eşleştirme: aynı şehir, konu uyumu, semt, günlük kapasite ◄──┘
        │
        ▼
OTOMATİK MESAJ → turiste: "Sorun Ayşe'ye iletildi, genelde ~25 dk içinde yanıt veriyor"
        │
        ▼
Lokale bildirim (+ hazır cevap şablonları)
        │
        ▼
T dakika içinde cevap geldi mi?
   │ evet                         │ hayır
   ▼                              ▼
Turist değerlendirir         YENİDEN ATAMA → sıradaki uygun lokal
(faydalı / güncel /               │
 güvenilir)                       ├─ deneme sınırı aşılmadıysa → tekrar "OTOMATİK MESAJ" adımına
   │                              └─ sınır aşıldıysa → turist bilgilendirilir, soru "açık havuza" düşer
   ▼
Lokalin yanıt süresi, yanıt oranı, Local Score güncellenir
   │
   ▼
Soru-cevap arşive eklenir (lokal onayıyla)

Her adımda: Şikâyet / engelleme → moderasyon kuyruğu (hedef ≤ 24 saat)
```

### 2.2 İş kuralları (demo için parametre olarak tutulsun)

| Kural | Başlangıç değeri | Not |
|---|---|---|
| Yeniden atama süresi `T` | 30 dk | EM simülasyonla güncelleyecek; demoda 1-2 dk'ya indirilebilir |
| Maksimum atama denemesi | 3 lokal | Sonra soru açık havuza düşer |
| Lokal günlük soru limiti | 2 (lokal ayarlardan 1-5 arası değiştirebilir) | Ankette %70 günde 1-2 soru diyor |
| Eşleştirme sırası | 1) aynı şehir 2) konu etiketi uyumu 3) semt uyumu 4) bugünkü kapasitesi dolmamış 5) en kısa ortalama yanıt süresi | Basit puanlama yeterli |
| Tahmini yanıt süresi | Atanan lokalin son 30 gündeki medyan yanıt süresi | Veri yoksa "genelde 1 saat içinde" |
| Yanıt oranı | Son 30 günde 24 saat içinde cevaplanan atanmış soru yüzdesi | Airbnb'deki tanımla aynı |
| Local Score | Cevap **sayısına** değil, "faydalı" oylarına bağlı | Örn. `faydalı oy sayısı / değerlendirilen cevap sayısı × 100` |
| Rol belirleme | Kullanıcının kayıtlı şehri = lokal olduğu şehir; diğer tüm şehirlerde turist | Demoda manuel rol/şehir değiştirme butonu yeterli |
| İletişim | Sadece site içi mesajlaşma; telefon/e-posta paylaşılmaz | KVKK + güvenlik |

### 2.3 Otomatik mesaj şablonları (kural tabanlı)

| Tetikleyici | Mesaj (turiste) |
|---|---|
| Soru atandı | "Sorun **{lokal_adı}**'na iletildi. Genelde **~{tahmini_süre}** içinde yanıt veriyor." |
| Yeniden atandı | "{önceki_lokal} şu an müsait değil. Sorunu **{yeni_lokal}**'na yönlendirdik, tahmini süre **~{tahmini_süre}**." |
| Deneme sınırı aşıldı | "Şu an müsait lokal bulamadık. Sorun açık havuzda; ilk cevap veren lokal sana dönecek." |
| Cevap geldi | "{lokal_adı} soruna cevap verdi. Cevabı değerlendirmeyi unutma." |

Lokale giden: "Yeni bir soru var: {konu} – {semt}. Cevaplamak için {T} dk'n var." ve süre dolunca "Soru bir sonraki lokale yönlendirildi."

> Arayüzde otomatik mesajlar ile insan cevapları **görsel olarak ayrılmalı** (ör. gri balon + "Otomatik mesaj" etiketi). Güven vaadi açısından önemli.

---

## 3. Tasarım ve arayüz

### 3.1 Tasarım ilkeleri

1. **Responsive web, mobil öncelikli.** Turistler siteyi çoğunlukla telefondan, seyahat sırasında kullanacak. Tasarım önce telefon genişliğinde (~390 px) yapılmalı, sonra masaüstüne genişlemeli. Sunumda masaüstünde gösterileceği için iki sütunlu masaüstü düzeni de düzgün görünmeli.
2. **Hız görünür olmalı.** Yanıt süresi ve tahmini süre her yerde net görünsün (lokal kartı, soru detay, profil).
3. **İnsan ve otomatik ayrımı.** Otomatik mesajlar farklı renk ve etiketle gösterilsin.
4. **Lokalin eforu minimum.** Cevaplama ekranı 1-2 dokunuşla şablon seçip gönderilebilir olmalı.
5. **Sponsorlu içerik açıkça etiketli.** Local Partner önerileri organik önerilerden ayrı rozetle gösterilsin (ileride).
6. **Az ama net seçenek.** Ankette %45 "çok seçenek var, karar vermek zor" diyor; listeleri uzun tutmayın, filtre/etiket kullanın.

### 3.2 Görsel kimlik önerisi (raporla tutarlı)

| Öğe | Öneri |
|---|---|
| Ana renk | Lacivert `#1F3864` (güven) |
| Vurgu / otomatik adımlar | Turuncu `#EB6834` |
| Açık zemin / kartlar | `#D9E2F3`, `#F7F6F3` |
| Başarı / doğrulama rozeti | Yeşil `#1BAF7A` |
| Yazı tipi | Sans-serif (ör. Inter, Roboto) |
| Ton | Samimi, kısa cümleler; "sen" diliyle |

### 3.3 Ekranlar

| # | Ekran | İçerik | Demo |
|---|---|---|---|
| 0 | **Tanıtım (landing) sayfası** | Tek cümlelik vaat, "nasıl çalışır" (3 adım: sor → lokale gider → hızlı cevap), "Demoyu başlat" butonu | 🟡 (sunumda fikri anlatmak için faydalı) |
| 1 | **Giriş / kayıt** | Demoda hazır kullanıcı kartlarından seçim (Elif, Mert, Zeynep…). Kayıt formu: ad, yaşadığı şehir, semt, ilgi alanı etiketleri, (lokal ise) günlük soru limiti | ✅ (hazır kullanıcı seçimi) |
| 2 | **Ana sayfa (turist modu)** | Bulunulan şehir, "Lokale Sor" butonu, popüler sorular/arşiv, aktif sorularım | ✅ |
| 3 | **Soru sor** | Şehir, soru metni, konu etiketi (gizli mekân, yemek, uygun fiyat, rota, gece hayatı, güvenli yerler), bütçe etiketi, (ops.) semt | ✅ |
| 4 | **Benzer cevaplar** | Göndermeden önce arşivde benzer soru-cevaplar; "Bu yeterli" / "Yine de sor" | 🟡 |
| 5 | **Soru detay / sohbet** | Durum çubuğu (İletildi → Lokalde → Cevaplandı / Yeniden atandı), otomatik mesajlar, lokal cevabı, geri sayım/tahmini süre | ✅ |
| 6 | **Değerlendirme** | Cevap için 3 ölçüt: Faydalı / Güncel / Güvenilir (her biri evet-hayır veya 1-5) + şikâyet butonu | ✅ |
| 7 | **Lokal profil kartı** | Ad, şehir/semt, doğrulama rozeti, ortalama yanıt süresi, yanıt oranı, Local Score, cevapladığı konu etiketleri | ✅ |
| 8 | **Gelen kutusu (lokal modu)** | Bana atanan sorular, kalan süre, bugünkü kapasite (ör. 1/2) | ✅ |
| 9 | **Cevapla** | Soru, hazır cevap şablonları, serbest metin, "Arşive eklensin" onayı | ✅ |
| 10 | **Soru arşivim (lokal)** | Lokalin geçmiş cevapları; düzenle / güncelle / arşivden kaldır | 🟡 |
| 11 | **Profil / ayarlar** | Rol/şehir, günlük limit, bildirimler, engellenenler, gizlilik | 🟡 |
| 12 | **Şikâyet / engelle** | Neden seçimi, açıklama | 🟡 |
| 13 | **Moderasyon paneli (admin)** | Şikâyet kuyruğu, açık havuzdaki sorular, KPI'lar | ⬜ |
| 14 | **Rotalar** | Lokallerin oluşturduğu kısa rotalar | ⬜ |
| 15 | **Local Partner** | Etiketli işletme önerileri, lokal indirimleri | ⬜ |

✅ demo için gerekli · 🟡 zaman kalırsa · ⬜ demoda yok

### 3.4 Web sitesi düzeni

**Üst menü (her sayfada)**
- Solda logo.
- Ortada şehir seçici: "Şu an: İstanbul ▾".
- Sağda **Turist / Lokal geçiş anahtarı**, bildirim zili (okunmamış sayısıyla) ve profil menüsü.

Şehir seçilince rol otomatik değişir: kullanıcının kendi şehrindeyse lokal, başka bir şehirdeyse turist. Demo için anahtarla elle değiştirme de olsun.

**Masaüstü (≥ 1024 px)**
- Ana sayfa: solda "Lokale Sor" kutusu ve aktif sorularım, sağda şehrin popüler soruları ve arşiv.
- Soru detay: solda sohbet akışı (otomatik mesajlar + cevap), sağda atanan lokalin profil kartı ve durum çubuğu.
- Lokal gelen kutusu: solda soru listesi, sağda seçili soru ve cevaplama alanı (e-posta istemcisi gibi).

**Telefon (< 768 px)**
- Tek sütun.
- Alt sekme çubuğu: Ana sayfa · Soru sor · Sorularım · Gelen kutusu (lokal) · Profil.
- Lokal kartı, soru detayında açılır panel olarak gösterilir.

**Sayfa adresleri (öneri)**

| Adres | Sayfa |
|---|---|
| `/` | Tanıtım / ana sayfa |
| `/giris` | Hazır kullanıcı seçimi / giriş |
| `/sor` | Soru sor (+ benzer arşiv cevapları) |
| `/sorularim` | Turistin soruları |
| `/soru/:id` | Soru detay / sohbet / değerlendirme |
| `/lokal/gelen-kutusu` | Lokale atanan sorular |
| `/lokal/arsiv` | Lokalin soru arşivi |
| `/profil/:id` | Lokal profil kartı |
| `/ayarlar` | Rol, şehir, günlük limit, engellenenler |
| `/admin` | Moderasyon paneli (demoda yok) |

### 3.5 Hazır cevap şablonları (lokal)

- "Bu saatte açık, şuraya git: …"
- "Şu semte bak: … (neden: …)"
- "Turistik ama değer: … / Turistik, gitme: …"
- "Bütçe dostu alternatif: …"
- "Tam emin değilim, ama şuna bak: …"
- "Bu soruyu daha önce cevaplamıştım: [arşiv bağlantısı]"

---

## 4. Tüm özellikler ve demo kapsamı

**Öncelik:** Kalite Evi sırası ve anket oranlarına göre.
**Demo sütunu:** ✅ demoda olmalı · 🟡 zaman kalırsa / basit versiyonu yeterli · ⬜ demoda yok (sadece raporda)

### 4.1 Hesap ve roller

| # | Özellik | Dayanak | Demo |
|---|---|---|---|
| 1 | Kayıt / giriş | – | ✅ (sahte giriş veya hazır kullanıcı seçimi yeterli) |
| 2 | Tek hesap, şehre göre turist/lokal rolü | Temel fikir | ✅ (manuel rol/şehir değiştirme butonu yeterli) |
| 3 | Profil: şehir, semt, ilgi etiketleri | Eşleştirme (F8) | ✅ |
| 4 | Lokal günlük soru limiti ayarı | %70 günde 1-2 soru (L9) | ✅ |
| 5 | Profil doğrulama (telefon/kimlik) ve "doğrulanmış" rozeti | Güven %34 (F7) | 🟡 rozet sabit veriyle gösterilsin |

### 4.2 Soru sorma ve eşleştirme (çekirdek)

| # | Özellik | Dayanak | Demo |
|---|---|---|---|
| 6 | Soru sorma (şehir, metin, konu ve bütçe etiketi) | Temel fikir | ✅ |
| 7 | Kural tabanlı soru–lokal eşleştirme | En yüksek öncelik (F8) | ✅ |
| 8 | Otomatik "iletildi + tahmini süre" mesajı | %43 olmazsa olmaz (F4) | ✅ |
| 9 | Süre dolunca otomatik yeniden atama + deneme sınırı | %63 olmazsa olmaz (F3) | ✅ **demo'nun yıldız özelliği** |
| 10 | Soru durum çubuğu (iletildi / lokalde / yeniden atandı / cevaplandı) | Hız görünürlüğü | ✅ |
| 11 | Açık havuz (sınır aşılınca) | Akış | 🟡 |
| 12 | Göndermeden önce benzer arşiv cevapları | Tekrar eden sorular (F10) | 🟡 basit kelime eşleşmesi yeterli |

### 4.3 Cevaplama (lokal)

| # | Özellik | Dayanak | Demo |
|---|---|---|---|
| 13 | Gelen kutusu + kalan süre + bugünkü kapasite | Lokal eforu (F12) | ✅ |
| 14 | Hazır cevap şablonları | Zaman en büyük vazgeçirici %61 (F12) | ✅ |
| 15 | Bildirim (yeni soru, süre doluyor) | F4 | ✅ site içi bildirim zili + sayaç yeterli; tarayıcı/push bildirimi gerekmez |
| 16 | Lokal yönetimli soru arşivi (cevabı arşive ekle, düzenle, kaldır) | Açık uçlu anket önerisi, F10 | 🟡 |

### 4.4 Güven ve geri bildirim

| # | Özellik | Dayanak | Demo |
|---|---|---|---|
| 17 | Çok ölçütlü değerlendirme (faydalı / güncel / güvenilir) | %57 olmazsa olmaz (F6) | ✅ |
| 18 | Profilde ortalama yanıt süresi ve yanıt oranı | %45 olmazsa olmaz (F5) | ✅ |
| 19 | Local Score (faydalı oylarına dayalı) | F15 | 🟡 sadece sayı olarak göster |
| 20 | Şikâyet ve engelleme | %27 olmazsa olmaz (F11) | 🟡 buton + basit form |
| 21 | Otomatik mesaj / insan cevabı görsel ayrımı | Güven vaadi | ✅ |
| 22 | Site içi iletişim, kişisel bilgi paylaşımı yok | KVKK, %38 kişisel bilgi kaygısı (F14) | ✅ (tasarım gereği) |
| 23 | Moderasyon paneli (şikâyet kuyruğu, ≤ 24 saat hedefi) | F11 | ⬜ |

### 4.5 İçerik ve keşif

| # | Özellik | Dayanak | Demo |
|---|---|---|---|
| 24 | Etiketli ve filtrelenebilir öneriler (bütçe, süre, gizli/yerel) | Karar zorluğu %45 (F13) | 🟡 konu ve bütçe filtresi yeterli |
| 25 | Popüler sorular / şehir arşivi | Keşif | 🟡 |
| 26 | Lokal rotaları (kısa sürede şehri gezme) | %62 rota istiyor (F16) | ⬜ |
| 27 | İçerik güncelliği (cevap tarihi, "hâlâ geçerli mi?" onayı) | %32 güncel değil (F9) | 🟡 cevap tarihini göstermek yeterli |

### 4.6 İkinci plan / gelecek

| # | Özellik | Dayanak | Demo |
|---|---|---|---|
| 28 | Seviye sistemi (New Local → Local Legend), rozetler | Düşük öncelik (%14) | ⬜ |
| 29 | Local Partner işletmeleri, "Sponsorlu" etiketli öneriler, lokal indirimleri | Düşük öncelik (%9), gelir modeli | ⬜ |
| 30 | Çeviri / çok dilli destek | İleride, LLM değerlendirmesi gerekir | ⬜ |
| 31 | KPI paneli (medyan yanıt süresi, 24 saat yanıt oranı, yeniden atama sayısı) | Rapor KPI'ları | ⬜ (demoda sunum slaytıyla gösterilebilir) |
| 32 | Çoklu şehir lansmanı | Pilot tek şehir | ⬜ |

### 4.7 Demo için minimum set (özet)

Demo şu 11 maddeyle "çalışan fikir" olarak gösterilebilir:

1. Hazır kullanıcılardan seçerek giriş + üst menüde Turist/Lokal geçiş anahtarı
2. Soru sorma (konu ve bütçe etiketiyle)
3. Kural tabanlı eşleştirme
4. "İletildi, tahmini süre ~X dk" otomatik mesajı
5. Süre dolunca otomatik yeniden atama (demoda `T` = 1-2 dk)
6. Soru durum çubuğu
7. Lokal gelen kutusu + hazır cevap şablonları + günlük kapasite göstergesi
8. Cevap değerlendirme (faydalı / güncel / güvenilir)
9. Lokal profil kartı: yanıt süresi, yanıt oranı, doğrulama rozeti, Local Score
10. Otomatik mesaj ile insan cevabının görsel ayrımı
11. Site içi bildirim zili ve **gerçek zamanlı güncelleme** (lokal cevaplayınca turistin sayfası yenilemeden güncellenir)

---

## 5. Demo senaryosu (sunumda canlı gösterim önerisi)

**Ortam:** Pilot şehir İstanbul. Hazır veri: 6-8 lokal, 10-15 arşivlenmiş soru-cevap.

**Gösterim:** İki tarayıcı penceresi yan yana açılır: solda turist (Elif), sağda lokal (Zeynep). Birinde yapılan işlem diğerinde canlı görünür. Yeniden atama süresi `T` demo için 1 dakikaya ayarlanır. Bir pencere gizli sekmede açılırsa iki kullanıcı aynı anda oturum açabilir.

1. **Elif (turist, Ankara'dan geliyor)** giriş yapar, şehir: İstanbul.
2. Soru: *"Kadıköy'de öğrenci bütçesine uygun, turistik olmayan bir akşam yemeği yeri?"* → etiketler: Yerel yemek, Uygun fiyat, semt: Kadıköy.
3. Sistem eşleştirir → **Mert**'e atar. Elif'e otomatik mesaj: *"Sorun Mert'e iletildi, genelde ~20 dk içinde yanıt veriyor."*
4. Mert cevap vermez → `T` dolar → soru **Zeynep**'e yeniden atanır, Elif'e bilgi mesajı gider. *(Demo'nun en önemli anı)*
5. **Zeynep (sağ pencere)** bildirim zilinde yeni soruyu, gelen kutusunda da soruyu görür (bugünkü kapasite 1/2), hazır şablonla 30 saniyede cevaplar, "arşive ekle"yi işaretler.
6. Elif'in penceresi yenilenmeden cevabı gösterir. Elif cevabı **faydalı / güncel / güvenilir** olarak değerlendirir.
7. Zeynep'in profil kartında yanıt süresi, yanıt oranı ve Local Score güncellenir.
8. (Opsiyonel) Başka bir kullanıcı benzer soru sormaya başlayınca arşivden Zeynep'in cevabı önerilir.

---

## 6. Veri modeli taslağı

| Varlık | Ana alanlar |
|---|---|
| **User** | id, ad, yaşadığı_şehir, semt, ilgi_etiketleri[], doğrulandı (bool), günlük_limit, local_score, ort_yanıt_süresi_dk, yanıt_oranı |
| **Question** | id, turist_id, şehir, semt, metin, konu_etiketi, bütçe_etiketi, durum (`yeni` / `atandı` / `cevaplandı` / `açık_havuz`), oluşturma_zamanı |
| **Assignment** | id, soru_id, lokal_id, deneme_no, atanma_zamanı, son_tarih (atanma + T), sonuç (`cevapladı` / `süre_doldu`) |
| **Answer** | id, soru_id, lokal_id, metin, şablon_id (ops.), cevap_zamanı, arşivde (bool) |
| **Rating** | id, cevap_id, turist_id, faydalı, güncel, güvenilir, zaman |
| **SystemMessage** | id, soru_id, tür (`atandı` / `yeniden_atandı` / `havuz` / `cevap_geldi`), metin, zaman |
| **Report** | id, şikâyet_eden_id, hedef_id, neden, açıklama, durum, zaman |
| *(sonra)* Route, Partner | – |

**Notlar**
- Bir sorunun birden fazla **Assignment** kaydı olabilir. Yanıt süresi ve yeniden atama analizleri bu tablodan çıkar.
- **KVKK:** Konum yalnızca şehir/semt düzeyinde tutulur. Telefon/e-posta diğer kullanıcılara gösterilmez.
- **Demo verisi:** Lokallerin yanıt süreleri ve kapasiteleri, anket dağılımlarından sentetik üretilebilir:
  - Yanıt beklentisi: %39 ≤ 30 dk, %18 ≤ 2 saat, %29 aynı gün, %14 ertesi gün.
  - Günlük kapasite: %70 1-2, %25 3-5, %5 6+.

---

## 7. Teknik notlar (web demosu için öneriler)

- **Ön yüz:** React (Vite veya Next.js) + bir CSS çatısı (Tailwind vb.). Responsive, mobil öncelikli.
- **Arka uç:** Firebase:
  - Firestore: veri tabanı. Gerçek zamanlı dinleyicilerle cevaplar sayfa yenilenmeden gelir.
  - Authentication: demoda e-posta/şifre ya da anonim giriş + hazır kullanıcılar.
  - Firebase Hosting (veya Vercel): yayın.

  Pilot ölçeğinde ücretsiz katman yeterli. Cloud Messaging (push) web demosunda gerekmiyor.
- **Yeniden atama:** İdealde zamanlanmış bir Cloud Function (her dakika süresi dolan atamaları kontrol eder). Bu, ücretli Blaze planı gerektirebilir. Demo için alternatif: atamanın `son_tarih` alanı tutulur, açık olan istemci her 10-15 saniyede kontrol edip süresi dolanı yeniden atar.
- **Raporda güncellenecek yer:** Ara raporun 6. bölümündeki araçlar tablosunda "Flutter veya React Native / mobil istemci" satırı "React / responsive web istemci (mobil uygulama ileri aşama)" olarak değiştirilmeli. Ayrıca 2.3 kapsam tablosuna "ilk sürüm web" notu eklenmeli.
- **Otomatik mesajlar:** Kural tabanlı şablonlar. **LLM kullanılmıyor.** Hoca, LLM eklenirse literatür ve benchmark ile gerekçelendirme istedi.
- **Final teslimi:** IEEE SDD şablonu (mimari, veri tasarımı, arayüz, kullanılan kütüphaneler) BM sorumluluğunda.
- **Prototip:** Figma ile ekran akışı → görüşmelerde test.

---

## 8. Açık sorular (BM ekibiyle netleştirilecek)

1. Kimlik doğrulama demoda gerçek mi (Firebase Auth), yoksa hazır kullanıcı seçimi mi?
2. Yeniden atama sunucu tarafında mı (Cloud Function), istemci tarafında mı simüle edilecek?
3. Site nerede yayınlanacak (Firebase Hosting / Vercel) ve sunumda canlı adres mi, yerel çalıştırma mı kullanılacak?
4. Eşleştirme puanlaması için EM'den beklenen parametreler (`T`, deneme sınırı, ağırlıklar) hangi tarihe kadar gerekli?
