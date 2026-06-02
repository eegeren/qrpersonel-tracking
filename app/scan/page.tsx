import Link from "next/link";
import { QrCode } from "lucide-react";
import { QRScanner } from "@/components/QRScanner";

export default async function ScanPage({ searchParams }: { searchParams?: { store?: string } }) {
  return (
    <main className="min-h-screen bg-cloud px-4 py-5 text-ink">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white">
            <QrCode size={18} aria-hidden />
          </span>
          QR Personel
        </Link>
        <Link href="/login" className="text-sm font-semibold text-ink/60">Sorumlu</Link>
      </div>
      <div className="mx-auto mt-6 max-w-2xl text-center">
        <p className="mx-auto mb-3 w-fit rounded-lg bg-mint/10 px-3 py-1 text-sm font-semibold text-mint">Personel ekranı</p>
        <h1 className="text-3xl font-semibold">QR ile giriş çıkış</h1>
        <p className="mt-2 text-ink/60">Personel kodu cihazda kalır. QR okunduktan sonra kayıt butonu aktif olur.</p>
      </div>
      <div className="mt-6">
        <QRScanner initialQrSecret={searchParams?.store ?? ""} />
      </div>
    </main>
  );
}
