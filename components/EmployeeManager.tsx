"use client";

import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";

type StoreOption = { id: string; name: string };
type EmployeeItem = {
  id: string;
  fullName: string;
  nationalIdMasked: string;
  active: boolean;
  workStartTime: string | null;
  workEndTime: string | null;
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

  async function updateEmployee(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, active: data.active === "on" })
    });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={createEmployee} className="h-fit rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Personel ekle</h2>
        <div className="mt-4 space-y-3">
          <input name="fullName" required placeholder="Ad soyad" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <input name="nationalId" required inputMode="numeric" maxLength={11} pattern="\d{11}" placeholder="T.C. kimlik numarası" className="h-11 w-full rounded-lg border border-ink/15 px-3" />
          <select name="storeId" required className="h-11 w-full rounded-lg border border-ink/15 px-3">
            <option value="">Mağaza seçin</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-ink/55">Özel giriş</span>
              <input name="workStartTime" type="time" className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink/55">Özel çıkış</span>
              <input name="workEndTime" type="time" className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3" />
            </label>
          </div>
          <button disabled={stores.length === 0} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mint font-semibold text-white disabled:opacity-50">
            <Plus size={18} aria-hidden />
            Personel oluştur
          </button>
        </div>
      </form>
      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Personel</th>
                <th className="px-4 py-3 font-semibold">Mağaza</th>
                <th className="px-4 py-3 font-semibold">T.C. kimlik</th>
                <th className="px-4 py-3 font-semibold">Özel saat</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t border-ink/10">
                  <td className="px-4 py-3">
                    <form id={`employee-${employee.id}`} onSubmit={(event) => updateEmployee(event, employee.id)} />
                    <input form={`employee-${employee.id}`} name="fullName" required defaultValue={employee.fullName} className="h-10 w-full min-w-[180px] rounded-lg border border-ink/15 px-3 font-semibold" />
                  </td>
                  <td className="px-4 py-3">
                    <select form={`employee-${employee.id}`} name="storeId" defaultValue={employee.store.id} className="h-10 w-full min-w-[150px] rounded-lg border border-ink/15 px-3">
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-cloud px-2 py-1 font-semibold tracking-normal">{employee.nationalIdMasked}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[190px] gap-2">
                      <input form={`employee-${employee.id}`} name="workStartTime" type="time" defaultValue={employee.workStartTime ?? ""} className="h-10 w-full rounded-lg border border-ink/15 px-2" />
                      <input form={`employee-${employee.id}`} name="workEndTime" type="time" defaultValue={employee.workEndTime ?? ""} className="h-10 w-full rounded-lg border border-ink/15 px-2" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2 rounded-lg bg-mint/10 px-2 py-1 text-xs font-semibold text-mint">
                      <input form={`employee-${employee.id}`} name="active" type="checkbox" defaultChecked={employee.active} className="h-4 w-4 accent-mint" />
                      Aktif
                    </label>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                    <button form={`employee-${employee.id}`} className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 text-mint" title="Kaydet">
                      <Save size={17} aria-hidden />
                    </button>
                    <button type="button" onClick={() => removeEmployee(employee.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 text-coral" title="Sil">
                      <Trash2 size={17} aria-hidden />
                    </button>
                    </div>
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
