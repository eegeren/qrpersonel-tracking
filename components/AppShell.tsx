import Link from "next/link";
import { QrCode, LayoutDashboard, Store, Users } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Sorumlu paneli", icon: LayoutDashboard },
  { href: "/employees", label: "Personel kayıt", icon: Users },
  { href: "/qr", label: "Mağaza ayarı", icon: Store },
  { href: "/scan", label: "Personel QR", icon: QrCode }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cloud text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink/10 bg-white px-4 py-6 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">
            <QrCode size={19} aria-hidden />
          </span>
          QR Personel
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-cloud hover:text-ink"
            >
              <item.icon size={18} aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold">QR Personel</Link>
          <Link href="/scan" className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white" title="QR Tara">
            <QrCode size={19} aria-hidden />
          </Link>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg bg-cloud px-3 py-2 text-sm">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
