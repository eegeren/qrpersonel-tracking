import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { startOfToday, getLateStatus } from "@/lib/dates";
import { distanceMeters } from "@/lib/geo";

const schema = z.object({
  employeeId: z.string().optional(),
  employeeCode: z.string().optional(),
  qrSecret: z.string().min(1),
  action: z.enum(["checkin", "checkout"]).default("checkin"),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "QR veya personel bilgisi eksik." }, { status: 400 });

  if (!parsed.data.employeeId && !parsed.data.employeeCode) {
    return NextResponse.json({ error: "Personel kodu eksik." }, { status: 400 });
  }

  const store = await prisma.store.findUnique({ where: { qrSecret: parsed.data.qrSecret } });
  const employee = parsed.data.employeeId
    ? await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } })
    : await prisma.employee.findUnique({ where: { checkCode: parsed.data.employeeCode } });
  if (!store || !employee || employee.storeId !== store.id || !employee.active) {
    return NextResponse.json({ error: "Personel bu mağaza için yetkili değil." }, { status: 403 });
  }

  if (store.latitude && store.longitude && parsed.data.latitude && parsed.data.longitude) {
    const distance = distanceMeters(
      { latitude: store.latitude, longitude: store.longitude },
      { latitude: parsed.data.latitude, longitude: parsed.data.longitude }
    );
    if (distance > store.locationRadius) {
      return NextResponse.json({ error: "Konum mağaza sınırları dışında." }, { status: 403 });
    }
  }

  const today = startOfToday();
  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_storeId_date: { employeeId: employee.id, storeId: store.id, date: today } }
  });

  if (parsed.data.action === "checkin") {
    if (existing?.checkInTime) {
      return NextResponse.json({ error: "Bugün için giriş zaten kaydedildi." }, { status: 409 });
    }

    const now = new Date();
    const status = getLateStatus(now);
    await prisma.attendanceRecord.upsert({
      where: { employeeId_storeId_date: { employeeId: employee.id, storeId: store.id, date: today } },
      create: {
        employeeId: employee.id,
        storeId: store.id,
        date: today,
        checkInTime: now,
        status,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude
      },
      update: {
        checkInTime: now,
        status,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude
      }
    });
    return NextResponse.json({ message: status === "LATE" ? "Geç giriş kaydedildi." : "Giriş kaydedildi." });
  }

  if (!existing?.checkInTime) {
    return NextResponse.json({ error: "Çıkış için önce giriş kaydı olmalı." }, { status: 409 });
  }

  if (!existing.checkOutTime) {
    await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: { checkOutTime: new Date(), status: "CHECKED_OUT" }
    });
    return NextResponse.json({ message: "Çıkış kaydedildi." });
  }

  return NextResponse.json({ error: "Bugün için çıkış zaten kaydedildi." }, { status: 409 });
}
