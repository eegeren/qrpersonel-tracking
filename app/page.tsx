import Link from "next/link";
import { ArrowRight, Clock, QrCode, ShieldCheck, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-cloud text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">
            <QrCode size={19} aria-hidden />
          </span>
          QR Personel Takip
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-white">Giriş</Link>
          <Link href="/register" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white">Başla</Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-16">
        <div className="flex flex-col justify-center">
          <p className="mb-4 w-fit rounded-lg bg-mint/10 px-3 py-1 text-sm font-semibold text-mint">QR giriş çıkış takibi</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
            Personel QR okutur, mağaza sorumlusu giriş çıkışları anlık görür.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/65">
            Uygulama iki temel ekrana odaklanır: personelin mobil QR okutma ekranı ve sorumlunun kim kaçta geldi, kaçta çıktı bilgisini gördüğü takip paneli.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/scan" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-mint px-5 font-semibold text-white">
              Personel QR okutsun <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-lg border border-ink/15 bg-white px-5 font-semibold">
              Sorumlu girişi
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
          <div className="rounded-lg bg-ink p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Bugünkü durum</p>
                <p className="mt-1 text-2xl font-semibold">Merkez Şube</p>
              </div>
              <QrCode size={34} aria-hidden />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Gelen", "18"],
                ["İş başında", "12"],
                ["Çıkış yaptı", "6"],
                ["Gelmedi", "4"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/10 p-4">
                  <p className="text-sm text-white/60">{label}</p>
                  <p className="mt-2 text-3xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "Yetkili panel" },
              { icon: Clock, label: "Giriş çıkış saati" },
              { icon: Users, label: "Personel listesi" }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg bg-cloud p-3 text-sm font-medium">
                <item.icon size={18} className="text-mint" aria-hidden />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
