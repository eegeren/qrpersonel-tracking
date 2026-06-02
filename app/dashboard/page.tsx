import { AlertTriangle, Clock, LogOut, UserCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, startOfToday } from "@/lib/dates";

export default async function DashboardPage() {
  const owner = await requireOwner();
  const today = startOfToday();

  const [todayRecords, activeEmployees] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { store: { ownerId: owner.id }, date: today },
      include: { employee: true, store: true },
      orderBy: { checkInTime: "desc" }
    }),
    prisma.employee.findMany({
      where: { active: true, store: { ownerId: owner.id } },
      include: { store: true },
      orderBy: [{ store: { name: "asc" } }, { fullName: "asc" }]
    })
  ]);

  const lateCount = todayRecords.filter((record) => record.status === "LATE").length;
  const missingCheckout = todayRecords.filter((record) => record.checkInTime && !record.checkOutTime).length;
  const checkedOutCount = todayRecords.filter((record) => record.checkOutTime).length;
  const recordByEmployee = new Map(todayRecords.map((record) => [record.employeeId, record]));
  const rows = activeEmployees.map((employee) => {
    const record = recordByEmployee.get(employee.id);
    const status = !record
      ? "Henüz gelmedi"
      : record.status === "LATE"
        ? "Geç geldi"
        : record.checkOutTime
          ? "Çıkış yaptı"
          : "İş başında";

    return { employee, record, status };
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Mağaza sorumlusu paneli</h1>
          <p className="mt-1 text-ink/60">Bugün kim işe kaçta geldi, kaçta çıktı ve kim henüz gelmedi buradan görünür.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Bugünkü girişler" value={`${todayRecords.length}`} note="QR ile kaydedilen personel" icon={UserCheck} />
        <StatCard title="Aktif personel" value={`${activeEmployees.length}`} note="Sorumlu olduğunuz mağazalar" icon={Clock} />
        <StatCard title="Geç gelenler" value={`${lateCount}`} note="Tanımlı geç kalma saatinden sonra" icon={AlertTriangle} />
        <StatCard title="Çıkış yapanlar" value={`${checkedOutCount}`} note={`${missingCheckout} personel şu an iş başında`} icon={LogOut} />
      </div>
      <section className="mt-6 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <div className="border-b border-ink/10 px-5 py-4">
          <h2 className="text-lg font-semibold">Bugünkü personel giriş çıkışları</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Personel</th>
                <th className="px-4 py-3 font-semibold">T.C. kimlik</th>
                <th className="px-4 py-3 font-semibold">Mağaza</th>
                <th className="px-4 py-3 font-semibold">Giriş</th>
                <th className="px-4 py-3 font-semibold">Çıkış</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.employee.id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-semibold">{row.employee.fullName}</td>
                  <td className="px-4 py-3">{row.employee.nationalIdMasked}</td>
                  <td className="px-4 py-3">{row.employee.store.name}</td>
                  <td className="px-4 py-3">{formatDateTime(row.record?.checkInTime)}</td>
                  <td className="px-4 py-3">{formatDateTime(row.record?.checkOutTime)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-cloud px-2 py-1 text-xs font-semibold text-ink/70">{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="p-6 text-center text-ink/60">Aktif personel bulunamadı.</p>}
      </section>
    </AppShell>
  );
}
