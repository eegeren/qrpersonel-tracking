import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  position: z.string().optional(),
  storeId: z.string().min(1),
  active: z.boolean().default(true)
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwner();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Bilgileri kontrol edin." }, { status: 400 });

  const employee = await prisma.employee.findFirst({ where: { id: params.id, store: { ownerId: owner.id } } });
  const store = await prisma.store.findFirst({ where: { id: parsed.data.storeId, ownerId: owner.id } });
  if (!employee || !store) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });

  const updated = await prisma.employee.update({
    where: { id: params.id },
    data: { ...parsed.data, email: parsed.data.email.toLowerCase() }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwner();
  const employee = await prisma.employee.findFirst({ where: { id: params.id, store: { ownerId: owner.id } } });
  if (!employee) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });

  await prisma.employee.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
