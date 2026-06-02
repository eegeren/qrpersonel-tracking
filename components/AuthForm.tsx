"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    setLoading(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "İşlem tamamlanamadı. Sunucu yanıtı okunamadı." }));
      setError(body.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-ink/70">Kullanıcı adı</span>
        <input name="username" required autoComplete="username" className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3 outline-none focus:border-mint" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink/70">Şifre</span>
        <input name="password" type="password" minLength={6} required autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3 outline-none focus:border-mint" />
      </label>
      {mode === "register" && (
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Kurulum kodu</span>
          <input name="setupCode" required autoComplete="off" className="mt-1 h-11 w-full rounded-lg border border-ink/15 px-3 outline-none focus:border-mint" />
        </label>
      )}
      {error && <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p>}
      <button disabled={loading} className="h-11 w-full rounded-lg bg-ink font-semibold text-white hover:bg-ink/90 disabled:opacity-60">
        {loading ? "Bekleyin..." : mode === "login" ? "Giriş yap" : "Hesap oluştur"}
      </button>
    </form>
  );
}
