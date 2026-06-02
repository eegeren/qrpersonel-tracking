import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.role === "OWNER") redirect("/dashboard");
  if (session?.role === "EMPLOYEE") redirect("/scan");

  return (
    <main className="grid min-h-screen place-items-center bg-cloud px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">Yetkili kurulum</h1>
        <p className="mt-2 text-sm text-ink/60">Bu ekran sadece kurulum kodu olan yetkili kişiler içindir.</p>
        <div className="mt-6">
          <AuthForm mode="register" />
        </div>
        <p className="mt-5 text-center text-sm text-ink/60">
          Zaten hesabınız var mı? <Link href="/login" className="font-semibold text-mint">Giriş yapın</Link>
        </p>
      </div>
    </main>
  );
}
