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
  workStartTime: string;
  workEndTime: string;
  lateToleranceMinutes: number;
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

  async function updateStore(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    await fetch(`/api/stores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
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
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-ink/55">Genel giriş</span>
              <input name="workStartTime" type="time" defaultValue="09:00" className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink/55">Genel çıkış</span>
              <input name="workEndTime" type="time" defaultValue="10:00" className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3" />
            </label>
          </div>
          <input name="lateToleranceMinutes" type="number" min="0" max="120" defaultValue="0" placeholder="Geç toleransı dakika" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mint font-semibold text-white">
            <Plus size={18} aria-hidden />
            QR oluştur
          </button>
        </div>
      </form>
      <div className="grid gap-4">
        {stores.map((store) => (
          <form key={store.id} onSubmit={(event) => updateStore(event, store.id)} className="grid gap-5 rounded-lg border border-ink/10 bg-white p-5 shadow-soft md:grid-cols-[1fr_260px]">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{store.name}</h2>
                  <p className="mt-1 text-sm text-ink/60">{store.address || "Adres eklenmedi"}</p>
                </div>
                <button type="button" onClick={() => removeStore(store.id)} className="grid h-10 w-10 place-items-center rounded-lg border border-ink/10 text-coral" title="Sil">
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
              <div className="mt-5 rounded-lg border border-ink/10 p-4">
                <h3 className="font-semibold">Mağaza ayarı</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold text-ink/55">Mağaza adı</span>
                    <input name="name" required defaultValue={store.name} className="mt-1 h-10 w-full rounded-lg border border-ink/15 px-3" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink/55">Adres</span>
                    <input name="address" defaultValue={store.address ?? ""} className="mt-1 h-10 w-full rounded-lg border border-ink/15 px-3" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink/55">Genel giriş</span>
                    <input name="workStartTime" type="time" defaultValue={store.workStartTime} className="mt-1 h-10 w-full rounded-lg border border-ink/15 px-3" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink/55">Genel çıkış</span>
                    <input name="workEndTime" type="time" defaultValue={store.workEndTime} className="mt-1 h-10 w-full rounded-lg border border-ink/15 px-3" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink/55">Konum yarıçapı</span>
                    <input name="locationRadius" type="number" min="25" max="1000" defaultValue={store.locationRadius} className="mt-1 h-10 w-full rounded-lg border border-ink/15 px-3" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-ink/55">Geç toleransı dakika</span>
                    <input name="lateToleranceMinutes" type="number" min="0" max="120" defaultValue={store.lateToleranceMinutes} className="mt-1 h-10 w-full rounded-lg border border-ink/15 px-3" />
                  </label>
                </div>
                <button className="mt-3 h-10 w-full rounded-lg bg-ink text-sm font-semibold text-white">Ayarları kaydet</button>
              </div>
            </div>
            <div className="rounded-lg border border-mint/20 bg-mint/5 p-3">
              <StoreQr
                value={`${appUrl}/scan?store=${store.qrSecret}`}
                fileName={`${store.name.toLowerCase().replaceAll(" ", "-")}-qr`}
                title="Mağaza QR"
              />
              <p className="mt-2 text-center text-xs text-ink/55">İlk okutma giriş, ikinci okutma çıkış kaydı oluşturur.</p>
            </div>
          </form>
        ))}
        {stores.length === 0 && <div className="rounded-lg border border-dashed border-ink/20 bg-white p-8 text-center text-ink/60">Henüz mağaza yok.</div>}
      </div>
    </div>
  );
}
