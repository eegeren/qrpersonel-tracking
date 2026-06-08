import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import { hashNationalId, isValidNationalId, maskNationalId, nationalIdLast4, normalizeNationalId } from "@/lib/nationalId";

const schema = z.object({
  fullName: z.string().min(2),
  nationalId: z.string().min(1),
  storeId: z.string().min(1),
  workStartTime: z.preprocess((value) => (value === "" ? null : value), z.string().regex(/^\d{2}:\d{2}$/).nullable().optional()),
  workEndTime: z.preprocess((value) => (value === "" ? null : value), z.string().regex(/^\d{2}:\d{2}$/).nullable().optional())
});

export async function GET() {
  const owner = await requireOwner();
  const employees = await prisma.employee.findMany({
    where: { store: { ownerId: owner.id } },
    include: { store: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(employees);
}

export async function POST(request: Request) {
  const owner = await requireOwner();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Personel bilgilerini kontrol edin." }, { status: 400 });

  const store = await prisma.store.findFirst({ where: { id: parsed.data.storeId, ownerId: owner.id } });
  if (!store) return NextResponse.json({ error: "Mağaza bulunamadı." }, { status: 404 });

  const nationalId = normalizeNationalId(parsed.data.nationalId);
  if (!isValidNationalId(nationalId)) {
    return NextResponse.json({ error: "T.C. kimlik numarası 11 haneli olmalı." }, { status: 400 });
  }

  const employee = await prisma.employee.create({
    data: {
      fullName: parsed.data.fullName,
      nationalIdHash: hashNationalId(nationalId),
      nationalIdLast4: nationalIdLast4(nationalId),
      nationalIdMasked: maskNationalId(nationalId),
      workStartTime: parsed.data.workStartTime,
      workEndTime: parsed.data.workEndTime,
      storeId: parsed.data.storeId
    }
  });
  return NextResponse.json(employee, { status: 201 });
}
