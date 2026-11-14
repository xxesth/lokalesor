# Demo

Kurulum için: [setup.md](setup.md)

## Hazırlık
1. `pnpm dev` ile uygulamayı başlat. Tarayıcıda `http://localhost:3000/dev` adresini aç ve **Demoyu sıfırla**'ya bas.
2. Aynı tarayıcıda **iki normal pencere** aç. Gizli pencere kullanma, çünkü veri `localStorage` + `BroadcastChannel` ile paylaşılıyor.
3. Sol pencerede `/giris` → **Elif** (Ankara'dan gelen turist). Sağ pencerede `/giris` → **Zeynep** (Moda'da lokal).

## Senaryo
1. Elif: *Soru sor* → "Kadıköy'de öğrenci bütçesine uygun, turistik olmayan bir akşam yemeği yeri?" → konu **Yerel yemek**, semt **Kadıköy** → *Lokale gönder*. Soru **Mert**'e gider.
2. 1 dakika bekle (T = 1 dk). İstersen `/dev` → **+1 dk** ile zamanı ileri sar. Soru **Zeynep**'e yeniden atanır, Elif'in ekranında "Yeniden atandı" görünür.
3. Zeynep: zil ve gelen kutusu güncellenir (Bugün 1/2) → şablona dokun → boşlukları doldur → *Gönder*.
4. Elif'in ekranı yenilenmeden cevabı gösterir → Faydalı / Güncel / Güvenilir → *Gönder*. Zeynep'in profilindeki istatistikler güncellenir.
5. (İsteğe bağlı) Elif yine benzer bir soru yazmaya başlayınca Zeynep'in arşive eklenen cevabı "Benzer sorular cevaplanmış" panelinde çıkar.

## Sorun olursa
| Sorun | Çözüm |
|---|---|
| İki pencere senkron değil | İkisi de aynı tarayıcıda ve normal pencerede mi? Gizli pencere veriyi paylaşmaz. |
| Demo verisi karıştı | `/dev` → **Demoyu sıfırla** |
| Süre çok uzun | `/dev` → T'yi 1 dk yap (yeni atamalara uygulanır) |
