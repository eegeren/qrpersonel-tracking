import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  latitude: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.number().optional()),
  longitude: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.number().optional()),
  locationRadius: z.coerce.number().int().min(25).max(1000).default(150)
});

export async function GET() {
  const owner = await requireOwner();
  const stores = await prisma.store.findMany({
    where: { ownerId: owner.id },
    include: { _count: { select: { employees: true, attendances: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(stores);
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Mağaza bilgilerini kontrol edin." }, { status: 400 });

  const store = await prisma.store.create({ data: { ...parsed.data, ownerId: owner.id } });
  return NextResponse.json(store, { status: 201 });
}
