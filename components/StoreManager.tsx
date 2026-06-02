"use client";

import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { StoreQr } from "@/components/StoreQr";

type StoreItem = {
  id: string;
  name: string;
  address: string | null;
  qrSecret: string;
  locationRadius: number;
  _count: { employees: number };
};

export function StoreManager({ stores, appUrl }: { stores: StoreItem[]; appUrl: string }) {
  const router = useRouter();

  async function createStore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    form.reset();
    router.refresh();
  }

  async function removeStore(id: string) {
    await fetch(`/api/stores/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={createStore} className="h-fit rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold">QR oluştur</h2>
        <p className="mt-1 text-sm text-ink/60">Mağaza adını girin, personele okutulacak QR otomatik oluşur.</p>
        <div className="mt-4 space-y-3">
          <input name="name" required placeholder="Mağaza adı" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <input name="address" placeholder="Adres isteğe bağlı" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <input name="locationRadius" defaultValue="150" placeholder="Konum yarıçapı" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mint font-semibold text-white">
            <Plus size={18} aria-hidden />
            QR oluştur
          </button>
        </div>
      </form>
      <div className="grid gap-4">
        {stores.map((store) => (
          <article key={store.id} className="grid gap-5 rounded-lg border border-ink/10 bg-white p-5 shadow-soft md:grid-cols-[1fr_240px]">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{store.name}</h2>
                  <p className="mt-1 text-sm text-ink/60">{store.address || "Adres eklenmedi"}</p>
                </div>
                <button onClick={() => removeStore(store.id)} className="grid h-10 w-10 place-items-center rounded-lg border border-ink/10 text-coral" title="Sil">
                  <Trash2 size={18} aria-hidden />
                </button>
              </div>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-cloud p-3">
                  <dt className="text-xs text-ink/55">Personel</dt>
                  <dd className="mt-1 font-semibold">{store._count.employees}</dd>
                </div>
                <div className="rounded-lg bg-cloud p-3">
                  <dt className="text-xs text-ink/55">Konum yarıçapı</dt>
                  <dd className="mt-1 font-semibold">{store.locationRadius} m</dd>
                </div>
                <div className="rounded-lg bg-cloud p-3">
                  <dt className="text-xs text-ink/55">QR anahtarı</dt>
                  <dd className="mt-1 truncate font-semibold">{store.qrSecret}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StoreQr value={`${appUrl}/scan?store=${store.qrSecret}`} fileName={`${store.name.toLowerCase().replaceAll(" ", "-")}-qr`} />
              <p className="text-center text-xs text-ink/55">Personel bu QR kodu tarayarak giriş veya çıkış yapar.</p>
            </div>
          </article>
        ))}
        {stores.length === 0 && <div className="rounded-lg border border-dashed border-ink/20 bg-white p-8 text-center text-ink/60">Henüz mağaza yok.</div>}
      </div>
    </div>
  );
}
