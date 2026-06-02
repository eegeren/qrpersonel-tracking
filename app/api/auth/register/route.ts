import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const schema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(6),
  setupCode: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Veritabanı ayarı eksik. DATABASE_URL tanımlanmalı." }, { status: 500 });
    }
    if (!process.env.OWNER_SETUP_CODE) {
      return NextResponse.json({ error: "Sorumlu kayıt kodu ayarlanmamış." }, { status: 500 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Kullanıcı adı, şifre veya kurulum kodunu kontrol edin." }, { status: 400 });
    if (parsed.data.setupCode !== process.env.OWNER_SETUP_CODE) {
      return NextResponse.json({ error: "Kurulum kodu hatalı." }, { status: 403 });
    }

    const username = parsed.data.username.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) return NextResponse.json({ error: "Bu kullanıcı adı zaten kayıtlı." }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        name: username,
        username,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        role: "OWNER"
      }
    });

    await createSession({ userId: user.id, role: user.role });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { error: "Kayıt için veritabanı bağlantısı kurulamadı. PostgreSQL/Supabase bağlantısını kontrol edin." },
      { status: 500 }
    );
  }
}
