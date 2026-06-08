import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { hashNationalId, isValidNationalId, maskNationalId, nationalIdLast4, normalizeNationalId } from "@/lib/nationalId";

const schema = z.object({
  fullName: z.string().min(2),
  nationalId: z.string().optional(),
  storeId: z.string().min(1),
  active: z.boolean().default(true),
  workStartTime: z.preprocess((value) => (value === "" ? null : value), z.string().regex(/^\d{2}:\d{2}$/).nullable().optional()),
  workEndTime: z.preprocess((value) => (value === "" ? null : value), z.string().regex(/^\d{2}:\d{2}$/).nullable().optional())
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwner();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Bilgileri kontrol edin." }, { status: 400 });

  const employee = await prisma.employee.findFirst({ where: { id: params.id, store: { ownerId: owner.id } } });
  const store = await prisma.store.findFirst({ where: { id: parsed.data.storeId, ownerId: owner.id } });
  if (!employee || !store) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });

  const nationalId = parsed.data.nationalId ? normalizeNationalId(parsed.data.nationalId) : null;
  if (nationalId && !isValidNationalId(nationalId)) {
    return NextResponse.json({ error: "T.C. kimlik numarası 11 haneli olmalı." }, { status: 400 });
  }

  const updated = await prisma.employee.update({
    where: { id: params.id },
    data: {
      fullName: parsed.data.fullName,
      storeId: parsed.data.storeId,
      active: parsed.data.active,
      workStartTime: parsed.data.workStartTime,
      workEndTime: parsed.data.workEndTime,
      ...(nationalId
        ? {
            nationalIdHash: hashNationalId(nationalId),
            nationalIdLast4: nationalIdLast4(nationalId),
            nationalIdMasked: maskNationalId(nationalId)
          }
        : {})
    }
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
