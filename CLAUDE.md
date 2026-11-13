# Lokale Sor — Ekip Kuralları

Bu dosyayı Claude Code her oturumda okur. Ekipteki herkes için geçerlidir.

Turistin gittiği şehirde yaşayan lokale soru sorduğu, insan odaklı bir seyahat platformu. Ürünle ilgili her şey `Lokale Sor Demo Brief.md` dosyasında.
Hocanın beklentisi: **ölçeklenebilir ve performans odaklı bir mimari.**

## Önce bunları oku
| Dosya | İçerik |
|---|---|
| `docs/memory/architecture.md` | Katmanlar, veri akışı, ölçek planı |
| `docs/memory/decisions.md` | Alınmış kararlar (ADR). Kapanmış bir kararı tekrar tartışmaya açma. |
| `docs/memory/structure.md` | Klasör yapısı, hangi kodun hangi dosyaya yazılacağı |
| `docs/memory/contracts.md` | Tipler ve Repository arayüzü. Tek doğru kaynak bu. |
| `docs/memory/conventions.md` | Kod, isimlendirme ve git kuralları |
| `docs/memory/todo.md` | Faz faz, kişi bazlı görevler (Mali, Fatih, Ökkeş) |
| `docs/memory/progress.md` | Ne bitti, ne yarım kaldı, neler blokluyor, sözleşme talepleri |
| `docs/handoff/README.md` | **Onaylı tasarım.** Tasarım ilkeleri, bileşen envanteri, ekranlar. UI yazmadan önce oku. |
| `docs/handoff/screenshots/` | Her ekranın 390 px ve 1440 px görüntüsü. Bitirdiğin ekranı bunlarla karşılaştır. |

## Altın kurallar
1. **UI iş kuralı içermez.** Eşleştirme, süre hesabı, otomatik mesaj metni ve istatistik `src/domain/` içinde yazılır. Bileşen sadece gösterir.
2. **İstemci veriye sadece Repository üzerinden erişir.** `getRepository()` kullanılır. `src/data/` dışından hiçbir adapter import edilmez.
3. **`src/domain/` saf TypeScript'tir.** İçinde React, Next, fetch, veritabanı ya da `Date.now()` olmaz. Zaman `now` parametresiyle verilir.
4. **Sözleşme dosyaları** (`src/domain/types.ts`, `src/data/repository.ts`) sadece sözleşme sahibinin onayıyla değişir. Bir değişiklik gerekiyorsa `progress.md` dosyasındaki "Sözleşme talepleri" bölümüne yaz.
5. **Sunucu kodu (`src/server/`) istemciye sızmaz.** Bu klasördeki her dosyanın başında `import "server-only"` bulunur.
6. **Renk, yazı tipi, boşluk ve köşe sadece token'larla verilir** (`src/styles/tokens.css`, kaynağı `docs/handoff/design/tokens.css`). Bileşenlerde hex kod kullanılmaz.
7. **Sistem gri, insan renkli.** Kişi rengi sadece o kişiyi temsil ettiği yerde kullanılır: avatar, durum çubuğu segmenti, geri sayım çubuğu, profil bandı, lokal modundaki kişisel vurgu. Mesaj zemininde kişi rengi kullanılmaz. **Nar kırmızısı (`nar`) sadece aciliyet için kullanılır.** Birincil buton siyahtır.
8. **Otomatik mesaj ile insan cevabı her zaman biçimle ayrılır.** Otomatik mesaj kutusuz, gri metinli, kare sistem ikonlu ve "Otomatik mesaj · saat" etiketlidir. İnsan cevabı beyaz kartta avatar ve adla gösterilir. Robot ikonu kullanılmaz. LLM yok, otomatik mesajlar kural tabanlı şablonlardır.
9. **`docs/handoff/screens/*.html` sadece referanstır.** `src/` içine kopyalanmaz. Ölçü, renk ve metin oradan alınır, kod yapısı `structure.md`'den.
10. **Kişisel bilgi gösterilmez.** Telefon ve e-posta hiçbir ekranda ve hiçbir API cevabında yer almaz. Konum sadece şehir/semt düzeyinde tutulur.
11. **Dil:** kod ve veritabanı isimleri İngilizce, arayüz metinleri ve dokümanlar Türkçe ("sen" diliyle).

## Her iş bittiğinde
- `docs/memory/progress.md` dosyasına 1-3 satır ekle: tarih, kim, ne yapıldı, ne kaldı.
- Yeni bir mimari karar aldıysan `decisions.md` dosyasına bir ADR ekle.
- Yeni bir dosya ya da klasör açtıysan `structure.md` dosyasını güncelle.

## Komutlar (iskelet kurulunca geçerli olacak)
```
npm run dev          # http://localhost:3000
npm run test         # domain birim testleri (vitest)
npm run lint
npm run typecheck
docker compose up -d # Postgres (gerçek arka uç fazında)
```
Demo için iki **normal** tarayıcı penceresi açılır (gizli sekme olmaz, çünkü BroadcastChannel'ı paylaşmaz). `/giris` sayfasında birinde Elif, diğerinde Zeynep seçilir. Geliştirici paneli `/dev` adresinde.
