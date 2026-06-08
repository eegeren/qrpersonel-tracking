import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  latitude: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.number().optional()),
  longitude: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.number().optional()),
  locationRadius: z.coerce.number().int().min(25).max(1000).default(150),
  workStartTime: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
  workEndTime: z.string().regex(/^\d{2}:\d{2}$/).default("10:00"),
  lateToleranceMinutes: z.coerce.number().int().min(0).max(120).default(0)
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwner();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Bilgileri kontrol edin." }, { status: 400 });

  const existing = await prisma.store.findFirst({ where: { id: params.id, ownerId: owner.id } });
  if (!existing) return NextResponse.json({ error: "Mağaza bulunamadı." }, { status: 404 });

  const store = await prisma.store.update({
    where: { id: params.id },
    data: parsed.data
  });
  return NextResponse.json(store);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwner();
  const existing = await prisma.store.findFirst({ where: { id: params.id, ownerId: owner.id } });
  if (!existing) return NextResponse.json({ error: "Mağaza bulunamadı." }, { status: 404 });

  await prisma.store.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
