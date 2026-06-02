import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Veritabanı ayarı eksik. DATABASE_URL tanımlanmalı." }, { status: 500 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { username: parsed.data.username.toLowerCase() } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
    }

    await createSession({ userId: user.id, role: user.role });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { error: "Giriş için veritabanı bağlantısı kurulamadı. PostgreSQL/Supabase bağlantısını kontrol edin." },
      { status: 500 }
    );
  }
}
