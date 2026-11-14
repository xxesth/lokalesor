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
| `PageProps` tip hatası | `pnpm typecheck` önce `next typegen` çalıştırır; tsc'yi doğrudan çalıştırma |
