# Kurulum

## Gereksinimler
| Araç | Sürüm | Not |
|---|---|---|
| Node.js | 22 veya üstü | `node -v` |
| pnpm | 12 | Arch: `sudo pacman -S pnpm` · diğer: `curl -fsSL https://get.pnpm.io/install.sh \| sh -` |
| Git | — | |
| Docker | — | Sadece Faz 2'de lazım (Postgres + Redis) |

## İlk kurulum
```bash
git clone https://github.com/xxesth/lokalesor.git
cd lokalesor
pnpm install
cp .env.example apps/web/.env.local   # isteğe bağlı; varsayılan zaten mock
pnpm dev                              # http://localhost:3000
```

## Arka uç (Faz 2)
```bash
cp .env.example .env
docker compose up -d                  # Postgres + Redis (+ test veritabanı lokale_test)
pnpm --filter @lokale/db migrate      # tabloları oluşturur
```
- Makinende 5432 ya da 6379 doluysa: `POSTGRES_PORT=55432 REDIS_PORT=56379 docker compose up -d`. Sonra `.env` içindeki `DATABASE_URL`, `TEST_DATABASE_URL` ve `REDIS_URL` portlarını da değiştir.
- `@lokale/core` testleri `TEST_DATABASE_URL`'deki veritabanını her çalıştırmada sıfırlar. Postgres açık değilse bu testler atlanır, yani docker'sız da `pnpm test` çalışır.
- Şemayı değiştirdiysen: `pnpm --filter @lokale/db generate` (yeni migration) → `migrate`.

## Komutlar
| Komut | Ne yapar |
|---|---|
| `pnpm dev` | Bütün servisleri geliştirme modunda başlatır (Faz 1'de sadece web) |
| `pnpm build` | Production build |
| `pnpm test` | Bütün paketlerin testleri (domain birim testleri + mock senaryo testi) |
| `pnpm lint` | ESLint (bağımlılık yönü kuralları dahil) |
| `pnpm typecheck` | TypeScript kontrolü |
| `pnpm --filter @lokale/web dev` | Tek bir paketi çalıştırır |

Bir PR'ı birleştirmeden önce `pnpm lint && pnpm typecheck && pnpm test` geçmeli.

## Sık karşılaşılan sorunlar
| Sorun | Çözüm |
|---|---|
| Cloudflare tunnel'da sayfa yüklenmiyor | `next.config.ts` → `allowedDevOrigins` içinde `*.trycloudflare.com` olmalı; dev sunucusunu yeniden başlat. Paylaşım için `pnpm build && pnpm --filter @lokale/web start` daha sağlam. |
| `PageProps` tip hatası | `pnpm typecheck` önce `next typegen` çalıştırır; tsc'yi doğrudan çalıştırma |
