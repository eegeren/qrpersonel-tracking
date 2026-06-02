import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "OWNER") redirect("/dashboard");
  if (session?.role === "EMPLOYEE") redirect("/scan");

  return (
    <main className="grid min-h-screen place-items-center bg-cloud px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">Sorumlu girişi</h1>
        <p className="mt-2 text-sm text-ink/60">Bu cihazda bir kez giriş yapın; panel açık kalır.</p>
        <div className="mt-6">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}
