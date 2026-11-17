# Demo

Kurulum için: [setup.md](setup.md)

## Hazırlık
1. `pnpm dev` ile uygulamayı başlat. Tarayıcıda `http://localhost:3000/dev` adresini aç ve **Demoyu sıfırla**'ya bas.
2. Aynı tarayıcıda **iki normal pencere** aç. Gizli pencere kullanma, çünkü veri tarayıcının `localStorage`'ında paylaşılıyor.
3. Sol pencerede `/giris` → **Efe Genç** (Ankara'dan gelen turist). Sağ pencerede `/giris` → **Nevin Arslan** (Moda'da lokal).

## Senaryo
1. Efe: *Soru sor* → "Kadıköy'de öğrenci bütçesine uygun, turistik olmayan bir akşam yemeği yeri?" → konu **Yerel yemek**, semt **Kadıköy** → *Lokale gönder*. Soru **Mert Özçelik**'e gider.
2. 3 dakika bekle (T = 3 dk). Beklemek istemezsen `/dev` → **+5 dk** ile zamanı ileri sar. Soru **Nevin Arslan**'a yeniden atanır, Efe'nin ekranında "Yeniden atandı" görünür.
3. Nevin: zil ve gelen kutusu güncellenir (Bugün 1/2) → şablona dokun → boşlukları doldur → *Gönder*.
4. Efe'nin ekranı yenilenmeden cevabı gösterir → Faydalı / Güncel / Güvenilir → *Gönder*. Nevin'in profilindeki istatistikler güncellenir.
5. (İsteğe bağlı) Efe yine benzer bir soru yazmaya başlayınca Nevin'in arşive eklenen cevabı "Benzer sorular cevaplanmış" panelinde çıkar.

## Sorun olursa
| Sorun | Çözüm |
|---|---|
| İki pencere senkron değil | İkisi de aynı tarayıcıda ve normal pencerede mi? Gizli pencere veriyi paylaşmaz. |
| Demo verisi karıştı | `/dev` → **Demoyu sıfırla** |
| Süre çok uzun ya da kısa | `/dev` → T'yi değiştir (yeni atamalara uygulanır) |
