import { AppShell } from "@/components/AppShell";
import { StoreManager } from "@/components/StoreManager";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function QrPage() {
  const owner = await requireOwner();
  const stores = await prisma.store.findMany({
    where: { ownerId: owner.id },
    include: { _count: { select: { employees: true, attendances: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">Mağaza QR oluştur</h1>
      <p className="mt-1 text-ink/60">Her mağaza için tek QR yeterlidir. Personel sabah ve çıkışta aynı QR kodu okutur.</p>
      <div className="mt-6">
        <StoreManager stores={stores} appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"} />
      </div>
    </AppShell>
  );
}
