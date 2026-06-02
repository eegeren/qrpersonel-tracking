"use client";

import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type StoreOption = { id: string; name: string };
type EmployeeItem = {
  id: string;
  fullName: string;
  email: string;
  checkCode: string;
  phone: string | null;
  position: string | null;
  active: boolean;
  store: StoreOption;
};

export function EmployeeManager({ employees, stores }: { employees: EmployeeItem[]; stores: StoreOption[] }) {
  const router = useRouter();

  async function createEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    form.reset();
    router.refresh();
  }

  async function removeEmployee(id: string) {
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={createEmployee} className="h-fit rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Personel ekle</h2>
        <div className="mt-4 space-y-3">
          <input name="fullName" required placeholder="Ad soyad" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <input name="email" type="email" required placeholder="E-posta" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <input name="phone" placeholder="Telefon" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <input name="position" placeholder="Pozisyon" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <select name="storeId" required className="h-11 w-full rounded-lg border border-ink/15 px-3">
            <option value="">Mağaza seçin</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <button disabled={stores.length === 0} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mint font-semibold text-white disabled:opacity-50">
            <Plus size={18} aria-hidden />
            Personel oluştur
          </button>
        </div>
      </form>
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Personel</th>
                <th className="px-4 py-3 font-semibold">Mağaza</th>
                <th className="px-4 py-3 font-semibold">Personel kodu</th>
                <th className="px-4 py-3 font-semibold">Pozisyon</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t border-ink/10">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{employee.fullName}</p>
                    <p className="text-ink/55">{employee.email}</p>
                  </td>
                  <td className="px-4 py-3">{employee.store.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-cloud px-2 py-1 font-semibold tracking-normal">{employee.checkCode}</span>
                  </td>
                  <td className="px-4 py-3">{employee.position || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-mint/10 px-2 py-1 text-xs font-semibold text-mint">{employee.active ? "Aktif" : "Pasif"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => removeEmployee(employee.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 text-coral" title="Sil">
                      <Trash2 size={17} aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {employees.length === 0 && <p className="p-6 text-center text-ink/60">Henüz personel yok.</p>}
      </div>
    </div>
  );
}
