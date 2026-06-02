import { AppShell } from "@/components/AppShell";
import { EmployeeManager } from "@/components/EmployeeManager";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  const owner = await requireOwner();
  const [employees, stores] = await Promise.all([
    prisma.employee.findMany({
      where: { store: { ownerId: owner.id } },
      include: { store: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.store.findMany({ where: { ownerId: owner.id }, orderBy: { name: "asc" } })
  ]);

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">Personel</h1>
      <p className="mt-1 text-ink/60">Personeli mağazalara bağlayın ve aktiflik durumlarını izleyin.</p>
      <div className="mt-6">
        <EmployeeManager employees={employees} stores={stores} />
      </div>
    </AppShell>
  );
}
