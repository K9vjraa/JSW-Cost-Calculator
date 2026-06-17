/**
 * Enterprise Login Page — MCMS
 * Uses react-hook-form + zod validation with enterprise SaaS design.
 * Preserves the existing JSW branding and layout structure.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Factory, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/store/auth";

// ── Validation schema ─────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional()
});
type LoginForm = z.infer<typeof loginSchema>;

// ── Feature highlights ────────────────────────────────────────────────────────
const features = [
  {
    icon: Factory,
    label: "Industrial Grade",
    description: "Built for high-volume alloy costing workflows"
  },
  {
    icon: ShieldCheck,
    label: "Role-Based Access",
    description: "Costing Department & PDQC access tiers"
  },
  {
    icon: LockKeyhole,
    label: "Fully Audited",
    description: "Every calculation and price change is logged"
  }
];

export function LoginPage() {
  const { actor, login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  if (actor) {
    return <Navigate to="/dashboard" replace />;
  }

  const busy = isSubmitting || isLoading;

  const onSubmit = async (values: LoginForm) => {
    clearError();
    try {
      const next = await login(values.email, values.password, values.rememberMe);
      toast.success(`Welcome, ${next.name}`, { description: `Logged in as ${next.role}` });
      navigate("/dashboard");
    } catch {
      // Error is already in store; toast handled below via `error` field
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl lg:grid-cols-[1.1fr_.9fr]"
        style={{ boxShadow: "0 24px 64px rgba(3,47,103,0.18)" }}
      >
        {/* ── Left Brand Panel ─────────────────────────────────────────── */}
        <section className="relative flex min-h-[480px] flex-col justify-between overflow-hidden bg-[#032f67] p-10 text-white">
          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(90deg,transparent_0,transparent_69px,rgba(255,255,255,.4)_70px),linear-gradient(transparent_0,transparent_69px,rgba(255,255,255,.4)_70px)] [background-size:70px_70px]" />
          {/* Gradient glow */}
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

          {/* Brand header */}
          <div className="relative">
            <p className="text-5xl font-black italic tracking-widest text-white">JSW</p>
            <div className="mt-1 h-0.5 w-12 bg-blue-400/60 rounded-full" />
            <h1 className="mt-6 max-w-sm text-4xl font-bold leading-tight">
              Metal Cost Management System
            </h1>
            <p className="mt-4 max-w-md text-base text-blue-100/80 leading-relaxed">
              Accurate alloy costing, master-locked pricing, and enterprise-grade reporting for industrial manufacturing teams.
            </p>
          </div>

          {/* Feature cards */}
          <div className="relative grid gap-3 sm:grid-cols-3">
            {features.map(({ icon: Icon, label, description }) => (
              <div
                key={label}
                className="rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm transition-all hover:bg-white/12"
              >
                <Icon className="mb-3 size-5 text-blue-300" />
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="mt-1 text-[11px] text-blue-100/60 leading-snug">{description}</p>
              </div>
            ))}
          </div>

          {/* Version badge */}
          <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
            v2.0 Enterprise
          </div>
        </section>

        {/* ── Right Login Form ──────────────────────────────────────────── */}
        <div className="flex flex-col justify-center gap-8 p-8 lg:p-12">
          {/* Header */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#032f67]">
                <KeyRound className="size-4 text-white" />
              </div>
              <span className="text-sm font-extrabold uppercase tracking-widest text-[#0057b8]">Secure Login</span>
            </div>
            <h2 className="text-3xl font-black text-[#10233d]">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your MCMS workspace and costing tools.
            </p>
          </div>



          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" id="mcms-login-form" noValidate>
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0057b8]/20 ${
                  errors.email
                    ? "border-red-400 focus:border-red-400"
                    : "border-[#d6dfeb] focus:border-[#0057b8]"
                }`}
                placeholder="you@jsw-mcms.local"
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-[11px] font-bold text-red-500">
                  <AlertCircle className="size-3 shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0057b8]/20 ${
                  errors.password
                    ? "border-red-400 focus:border-red-400"
                    : "border-[#d6dfeb] focus:border-[#0057b8]"
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="flex items-center gap-1 text-[11px] font-bold text-red-500">
                  <AlertCircle className="size-3 shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                id="login-remember"
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-slate-300 text-[#0057b8] accent-[#0057b8]"
              />
              <span className="text-xs font-semibold text-slate-600">Remember this session</span>
            </label>

            {/* API error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700"
                >
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              id="login-submit"
              disabled={busy}
              whileHover={{ scale: busy ? 1 : 1.01 }}
              whileTap={{ scale: busy ? 1 : 0.99 }}
              className="relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[#032f67] text-sm font-extrabold uppercase tracking-wider text-white transition-all hover:bg-[#0b4ea3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In to MCMS"
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-400">
            JSW Metal Cost Management System · Role-Based Enterprise Platform
          </p>
        </div>
      </motion.div>
    </main>
  );
}
