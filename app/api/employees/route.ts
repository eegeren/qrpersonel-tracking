import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  position: z.string().optional(),
  storeId: z.string().min(1)
});

async function createUniqueEmployeeCode() {
  for (let index = 0; index < 8; index += 1) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = await prisma.employee.findUnique({ where: { checkCode: code } });
    if (!existing) return code;
  }

  return crypto.randomUUID().slice(0, 8).toUpperCase();
}

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

  const email = parsed.data.email.toLowerCase();
  const employee = await prisma.employee.create({
    data: {
      fullName: parsed.data.fullName,
      email,
      checkCode: await createUniqueEmployeeCode(),
      phone: parsed.data.phone,
      position: parsed.data.position,
      storeId: parsed.data.storeId
    }
  });
  return NextResponse.json(employee, { status: 201 });
}
