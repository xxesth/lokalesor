import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { LockIcon, SealIcon, SystemSquareIcon, UserIcon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/features/shell";

const STEPS = [
  { n: "01", title: "Sor", text: "Şehri ve konuyu seç, sorunu bir cümleyle yaz." },
  { n: "02", title: "Lokale gider", text: "Sorun o semtte yaşayan birine ulaşır. Cevap gelmezse otomatik olarak sıradakine geçer." },
  { n: "03", title: "Hızlı cevap", text: "Cevabı değerlendir. Her değerlendirme lokalin güven puanını oluşturur." },
];

const TRUST = [
  { icon: <UserIcon />, text: "Yapay zekâ değil, gerçek insanlar" },
  { icon: <SealIcon size={22} inverse />, text: "Doğrulanmış lokaller" },
  { icon: <LockIcon />, text: "Kişisel bilgin paylaşılmaz" },
];

const WRAP = "mx-auto w-full max-w-[1200px] px-4 lg:px-6";

/** Tanıtım sayfası (8-tanitim). Ürün örneği gerçek bileşenlerle; ölçüler referans HTML'den. */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className={`${WRAP} flex items-center justify-between py-4 lg:py-5`}>
        <Logo />
        <nav aria-label="Tanıtım" className="flex items-center gap-4 text-[15px] lg:gap-6">
          <Link href="#nasil" className="inline-flex min-h-11 items-center hover:text-ink">
            Nasıl çalışır?
          </Link>
          <ButtonLink href="/giris" variant="secondary" size="md" className="px-[18px]">
            Giriş
          </ButtonLink>
        </nav>
      </header>
      <main id="icerik" tabIndex={-1} className="focus:outline-none">
        <section className={`${WRAP} flex flex-wrap items-center gap-x-14 gap-y-10 pb-16 pt-8 lg:pb-24 lg:pt-[72px]`}>
          <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-7">
            <h1 className="text-[46px] font-extrabold leading-[46px] tracking-[-0.05em] lg:text-[88px] lg:leading-[84px]">Gittiğin şehrin yerlisine sor.</h1>
            <p className="text-lg text-ink-2 lg:text-[22px] lg:leading-8">Gerçek insanlardan, dakikalar içinde cevap.</p>
            <div className="flex flex-wrap items-center gap-5">
              <ButtonLink href="/giris" className="h-[58px] px-8 text-lg!">
                Demoyu başlat
              </ButtonLink>
              <span className="inline-flex items-center gap-2.5">
                <span className="flex -space-x-2">
                  <Avatar name="Mert Özçelik" color="kobalt" size={32} ring />
                  <Avatar name="Nevin Arslan" color="safran" size={32} ring />
                  <Avatar name="Merve Güler" color="deniz" size={32} ring />
                </span>
                <span className="text-[15px] text-ink-2">Kadıköy, Moda ve Beşiktaş&apos;tan lokaller</span>
              </span>
            </div>
          </div>
          <div
            className="flex min-w-0 max-w-[460px] flex-[1_1_380px] flex-col gap-3.5 rounded-[22px] bg-mist p-6"
            role="img"
            aria-label="Örnek soru akışı: soru, otomatik mesaj, lokalin cevabı"
          >
            <div className="max-w-[320px] self-end rounded-[14px_14px_4px_14px] bg-paper px-3.5 py-3 text-base leading-[23px]">
              Kadıköy&apos;de öğrenci bütçesine uygun, turistik olmayan bir akşam yemeği yeri?
            </div>
            <div className="flex items-start gap-2 px-0.5">
              <SystemSquareIcon className="mt-1 shrink-0" />
              <span className="text-sm leading-5 text-ink-2">Otomatik mesaj · Mert müsait değil, sorun Nevin&apos;e geçti.</span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-[4px_14px_14px_14px] border border-line bg-paper p-3.5">
              <span className="flex items-center gap-2.5">
                <Avatar name="Nevin Arslan" color="safran" size={34} />
                <span className="flex flex-col">
                  <span className="text-[15px] font-bold">Nevin Arslan</span>
                  <span className="text-[13px] text-gray">Moda · 18 dk sonra</span>
                </span>
              </span>
              <span className="text-base leading-[23px]">Çarşı&apos;nın arka sokaklarındaki esnaf lokantalarına bak. Kişi başı uygun, turist yok denecek kadar az.</span>
            </div>
            {/* Yolculuk çizgisi: iki lokal, arada yeniden atama halkası (renk yanında ad var) */}
            <div className="flex items-center gap-[3px] px-0.5 pt-1" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-ink" />
              <span className="h-1 flex-[30] rounded-sm bg-[var(--person-kobalt)]" />
              <span className="h-3 w-3 rounded-full border-[2.5px] border-nar" />
              <span className="h-1 flex-[18] rounded-sm bg-[var(--person-safran)]" />
              <span className="h-2 w-2 rounded-full bg-ink" />
            </div>
          </div>
        </section>
        <section id="nasil" className={`${WRAP} flex flex-col gap-8 pb-16 lg:pb-24`}>
          <h2 className="text-[32px] font-extrabold leading-9 tracking-[-0.04em] lg:text-5xl lg:leading-[52px]">Nasıl çalışır?</h2>
          <ol className="grid gap-x-10 border-t border-ink md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col gap-2.5 py-7">
                <span className="tabular text-[56px] font-extrabold leading-[56px] tracking-[-0.04em] text-gray-soft">{s.n}</span>
                <span className="text-2xl font-bold">{s.title}</span>
                <span className="text-[17px] leading-[26px] text-ink-2">{s.text}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="bg-ink text-paper">
          <ul className={`${WRAP} grid gap-x-10 gap-y-6 py-12 md:grid-cols-3`}>
            {TRUST.map((t) => (
              <li key={t.text} className="flex items-start gap-3.5">
                <span className="shrink-0 pt-0.5">{t.icon}</span>
                <span className="text-xl font-bold leading-7 lg:text-[22px]">{t.text}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className={`${WRAP} flex flex-wrap items-end justify-between gap-6 py-16 lg:py-24`}>
          <p className="min-w-0 flex-[1_1_480px] text-[34px] font-extrabold leading-10 tracking-[-0.04em] lg:text-[52px] lg:leading-[54px]">İlk sorunu sor, birkaç dakikada gör.</p>
          <ButtonLink href="/giris" className="h-[58px] px-8 text-lg!">
            Demoyu başlat
          </ButtonLink>
        </section>
      </main>
      <footer className="mt-auto border-t border-line">
        <div className={`${WRAP} flex items-center justify-between py-6 text-sm text-gray`}>
          <span className="inline-flex items-baseline gap-0.5 text-base font-extrabold tracking-[-0.02em] text-ink">
            Lokale Sor
            <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-nar" />
          </span>
          <span>Demo sürümü</span>
        </div>
      </footer>
    </div>
  );
}
