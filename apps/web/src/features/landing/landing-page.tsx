import { ButtonLink } from "@/components/ui/button";
import { SealIcon, SystemSquareIcon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/features/shell";

const STEPS = [
  { n: "01", title: "Sor", text: "Şehri ve konuyu seç, sorunu yaz." },
  { n: "02", title: "Lokale gider", text: "O şehirde yaşayan uygun bir lokale iletilir. Cevap gelmezse otomatik olarak sıradakine." },
  { n: "03", title: "Hızlı cevap", text: "Cevabı değerlendir; güven puanı böyle oluşur." },
];

/** Tanıtım sayfası (8-tanitim). Ürün örneği gerçek bileşenlerle. */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-4 lg:px-6">
        <Logo />
        <ButtonLink href="/giris" variant="secondary" size="md">
          Giriş
        </ButtonLink>
      </header>
      <main id="icerik" tabIndex={-1} className="mx-auto flex w-full max-w-[1200px] flex-col gap-16 px-4 pb-16 pt-8 focus:outline-none lg:px-6 lg:pt-16">
        <section className="flex flex-wrap items-center gap-12">
          <div className="flex flex-[1_1_480px] flex-col gap-6">
            <h1 className="text-[46px] font-extrabold leading-[46px] tracking-[-0.04em] lg:text-[88px] lg:leading-[84px]">
              Gittiğin şehrin yerlisine sor.
            </h1>
            <p className="text-lg text-ink-2 lg:text-xl">Gerçek insanlardan, dakikalar içinde cevap.</p>
            <ButtonLink href="/giris" className="self-start">
              Demoyu başlat
            </ButtonLink>
          </div>
          <div className="flex flex-[1_1_360px] flex-col gap-3 rounded-panel-l border border-line p-5" aria-label="Örnek soru akışı">
            <div className="self-end rounded-[14px_14px_4px_14px] bg-mist px-3.5 py-3 text-[15px]">
              Kadıköy&apos;de öğrenci bütçesine uygun, turistik olmayan bir akşam yemeği yeri?
            </div>
            <div className="flex items-start gap-2.5 text-sm text-ink-2">
              <SystemSquareIcon className="mt-1 shrink-0" />
              <span>
                <span className="block text-xs font-semibold text-gray">Otomatik mesaj</span>
                Mert Özçelik şu an müsait değil. Sorunu Nevin Arslan&apos;a yönlendirdik, tahmini süre ~25 dk.
              </span>
            </div>
            <div className="flex flex-col gap-2 rounded-[4px_14px_14px_14px] border border-line p-4">
              <span className="flex items-center gap-2 font-bold">
                <Avatar name="Nevin Arslan" color="safran" size={32} /> Nevin Arslan <SealIcon />
              </span>
              <p className="text-[15px] leading-[22px]">Çarşı&apos;nın arka sokaklarındaki esnaf lokantalarına bak. Kişi başı uygun, turist az.</p>
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-6">
          <h2 className="border-b border-ink pb-3 text-2xl font-bold">Nasıl çalışır?</h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col gap-2">
                <span className="tabular text-[40px] font-bold text-gray-soft">{s.n}</span>
                <span className="text-xl font-bold">{s.title}</span>
                <span className="text-[15px] text-ink-2">{s.text}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <section className="bg-ink text-paper">
        <ul className="mx-auto grid max-w-[1200px] gap-4 px-4 py-8 text-[15px] font-semibold md:grid-cols-3 lg:px-6">
          <li>Yapay zekâ değil, gerçek insanlar</li>
          <li>Doğrulanmış lokaller</li>
          <li>Kişisel bilgin paylaşılmaz</li>
        </ul>
      </section>
    </div>
  );
}
