import { Factory, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/store/auth";

export function LoginPage() {
  const { actor, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("procurement@jsw-mcms.local");
  const [password, setPassword] = useState("MCMS@2026");
  const [busy, setBusy] = useState(false);
  if (actor) return <Navigate to="/dashboard" replace />;
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-xl border bg-white shadow-xl lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative flex min-h-[460px] flex-col justify-between overflow-hidden bg-[#032f67] p-8 text-white">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,transparent_0,transparent_69px,rgba(255,255,255,.25)_70px),linear-gradient(transparent_0,transparent_69px,rgba(255,255,255,.25)_70px)] [background-size:70px_70px]" />
          <div className="relative"><p className="text-4xl font-black italic">JSW</p><h1 className="mt-8 max-w-lg text-4xl font-bold">Metal Cost Management System</h1><p className="mt-3 max-w-md text-white/80">Accurate alloy costing, master-locked pricing, reports, comparison, and auditability for industrial teams.</p></div>
          <div className="relative grid gap-3 sm:grid-cols-3">{[[Factory,"Industrial"],[ShieldCheck,"Role-based"],[LockKeyhole,"Audited"]].map(([Icon,label]) => <div key={String(label)} className="rounded-lg border border-white/20 bg-white/10 p-3 text-sm"><Icon className="mb-3 size-5" />{String(label)}</div>)}</div>
        </section>
        <Card className="rounded-none border-0 shadow-none">
          <CardContent className="flex h-full flex-col justify-center gap-5 p-8 lg:p-12">
            <div><p className="text-sm font-semibold text-[var(--primary)]">Secure login</p><h2 className="mt-1 text-3xl font-bold">Welcome back</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Demo users share password <strong>MCMS@2026</strong>. Change email prefix to admin, finance, or production for offline role preview.</p></div>
            <form className="flex flex-col gap-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); const next = await login(email, password); toast.success(`${next.role} workspace ready`); navigate("/dashboard"); setBusy(false); }}>
              <label className="flex flex-col gap-1 text-sm font-medium">Email<Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" /></label>
              <label className="flex flex-col gap-1 text-sm font-medium">Password<Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" /></label>
              <Button disabled={busy}>{busy ? "Signing in..." : "Login"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
