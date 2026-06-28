/**
 * Enterprise Login Page — MCMS
 * Uses react-hook-form + zod validation with professional industrial ERP design.
 * Preserves the JSW branding and Light enterprise theme.
 */
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Lock, LogIn, Mail, ArrowRight, ShieldCheck, User, Building, CheckCircle2 } from "lucide-react";
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

export function LoginPage() {
  const { actor, login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<"COSTING" | "PDQC" | null>(null);


  const {
    register,
    handleSubmit,
    setValue,
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
    console.log("[TRACE] LoginPage: Actor exists, navigating to /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  const busy = isSubmitting || isLoading;

  const onSubmit = async (values: LoginForm) => {
    if (!selectedDepartment) {
      toast.error("Please select a department before signing in.");
      return;
    }
    clearError();
    try {
      const next = await login(values.email, values.password, selectedDepartment, values.rememberMe);
      toast.success(`Welcome, ${next.name}`, { description: `Logged in as ${next.role}` });
      console.log("[TRACE] LoginPage: Login API success, navigating to /dashboard");
      navigate("/dashboard");
    } catch {
      // Error is already in store; toast handled below via `error` field
    }
  };

  // Helper to trigger login for demo cards
  const handleDemoLogin = async (email: string) => {
    setValue("email", email);
    setValue("password", "MCMS@2026");
    clearError();
    try {
      const next = await login(email, "MCMS@2026", email.includes("admin") ? "COSTING" : "PDQC", true);
      toast.success(`Welcome, ${next.name}`, { description: `Logged in as ${next.role}` });
      console.log("[TRACE] LoginPage: Demo Login API success, navigating to /dashboard");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to login");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6 md:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-100/50 opacity-50 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] rounded-full bg-slate-200/50 opacity-60 blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 z-10 items-center">
        {/* ── Left Branding & Welcome Side ─────────────────────────────── */}
        <div className="flex flex-col justify-center space-y-6">
          {/* Logo Area */}
          <div className="flex flex-col items-start space-y-3">
            <img src="/jsw-logo.jpg" alt="JSW Steel Logo" className="h-28 w-auto object-contain" />
            <div className="border-l-2 border-[#002b63] pl-3 ml-1">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block">Metal Cost Management System</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-950 leading-tight">
              Precision Control for<br />Industrial Costing.
            </h2>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Securely access the centralized platform to manage, analyze, and optimize metal production costs across all JSW facilities.
            </p>
          </div>

          {/* Macro Machined Steel Image Card */}
          <div className="mt-6 rounded-sm overflow-hidden h-48 w-full relative shadow-sm border border-slate-200">
            <div className="absolute inset-0 bg-blue-900/10 z-10" />
            <img
              className="w-full h-full object-cover"
              alt="Polished metallic curves and steel surfaces"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmVN957jkd9gFVbiwBetmRqUw-aDRuv1K0nw5bno19mPDZx2OMm1xoiATH2vc9mU2XThppU6GFTrOLrBYldSwlns2lF930CzJ-n-CW21h-vqCud4-9lyCleVXv1QKncxfIZQ0sAz5ZlQJm_nOEQvo6AdgNV1MatiGhPG3YLasnQCYVE-p4WboRz1GBEYWpliYBnxMmhZ6aD8mNKpA1XkinLZVaoqtgtSCYDV20luo2gYIFPGPuLGBD4Q2BZBAbiNyMMXzEZVVvhtA"
            />
          </div>
        </div>

        {/* ── Right Login Form Card ────────────────────────────────────── */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-sm shadow-sm p-8">
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Sign In</h3>
                  <p className="text-xs text-slate-500 mt-1">Enter your corporate credentials to continue.</p>
                </div>
                <AnimatePresence>
                  {selectedDepartment && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-blue-50 border border-blue-100 rounded-sm px-2.5 py-1 flex items-center gap-1.5"
                    >
                      {selectedDepartment === "COSTING" ? <ShieldCheck className="size-3 text-[#002b63]" /> : <User className="size-3 text-[#002b63]" />}
                      <span className="text-[10px] font-bold text-[#002b63]">
                        {selectedDepartment === "COSTING" ? "Costing Dept." : "PDQC Dept."}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="mcms-login-form" noValidate>
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="login-email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="size-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    disabled={busy}
                    {...register("email")}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-sm text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#002b63]/20 disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.email
                        ? "border-red-400 focus:border-red-400"
                        : "border-slate-200 focus:border-[#002b63]"
                    }`}
                    placeholder="name@jsw-mcms.local"
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-[11px] font-bold text-red-500">
                    <AlertCircle className="size-3 shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="login-password">
                    Password
                  </label>
                  <a className="text-[#002b63] hover:text-[#0b4ea3] text-[11px] font-bold transition-colors" href="#">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="size-4" />
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    disabled={busy}
                    {...register("password")}
                    className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-sm text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#002b63]/20 disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.password
                        ? "border-red-400 focus:border-red-400"
                        : "border-slate-200 focus:border-[#002b63]"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-[11px] font-bold text-red-500">
                    <AlertCircle className="size-3 shrink-0" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="login-remember"
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 text-[#002b63] bg-slate-50 border-slate-200 rounded focus:ring-[#002b63]/20 focus:ring-2 accent-[#002b63]"
                />
                <label className="ml-2 block text-xs font-semibold text-slate-600 select-none cursor-pointer" htmlFor="login-remember">
                  Remember me for 30 days
                </label>
              </div>

              {/* API error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700"
                  >
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                id="login-submit"
                disabled={busy}
                whileHover={{ scale: busy ? 1 : 1.01 }}
                whileTap={{ scale: busy ? 1 : 0.99 }}
                className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-sm shadow-sm text-sm font-extrabold uppercase tracking-wider text-white bg-[#002b63] hover:bg-[#0b4ea3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002b63] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${busy ? "btn-loading-stripes" : ""}`}
              >
                {busy ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </motion.button>

              {/* Department Selection Section */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-3 text-center uppercase tracking-wider">
                  Select Department to Continue
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setSelectedDepartment("COSTING")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ scale: selectedDepartment === "COSTING" ? 1.02 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative p-3.5 rounded-sm border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                      selectedDepartment === "COSTING"
                        ? "border-[#002b63] bg-blue-50/40 shadow-sm ring-1 ring-[#002b63]"
                        : "border-slate-200 bg-white hover:border-[#002b63]/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="absolute top-3 right-3">
                      {selectedDepartment === "COSTING" ? (
                        <CheckCircle2 className="size-4.5 text-[#002b63]" />
                      ) : (
                        <div className="size-4.5 rounded-full border border-slate-200 bg-white group-hover:border-slate-300" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={`p-1.5 rounded-sm transition-colors ${selectedDepartment === "COSTING" ? "bg-[#002b63] text-white" : "bg-blue-100/50 text-[#002b63] group-hover:bg-[#002b63] group-hover:text-white"}`}>
                          <ShieldCheck className="size-4" />
                        </div>
                        <div>
                          <span className={`text-[11px] font-bold block ${selectedDepartment === "COSTING" ? "text-[#002b63]" : "text-slate-900"}`}>
                            Costing Department
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500 block">
                            Administrator Login
                          </span>
                        </div>
                      </div>
                      
                      <ul className="space-y-1 mt-2.5 pt-2.5 border-t border-slate-100">
                        {["User Management", "Material Rates", "Audit Logs"].map((feature) => (
                          <li key={feature} className="flex items-center gap-1.5 text-[9px] font-medium text-slate-600">
                            <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => setSelectedDepartment("PDQC")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ scale: selectedDepartment === "PDQC" ? 1.02 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative p-3.5 rounded-sm border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                      selectedDepartment === "PDQC"
                        ? "border-[#002b63] bg-blue-50/40 shadow-sm ring-1 ring-[#002b63]"
                        : "border-slate-200 bg-white hover:border-[#002b63]/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="absolute top-3 right-3">
                      {selectedDepartment === "PDQC" ? (
                        <CheckCircle2 className="size-4.5 text-[#002b63]" />
                      ) : (
                        <div className="size-4.5 rounded-full border border-slate-200 bg-white group-hover:border-slate-300" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={`p-1.5 rounded-sm transition-colors ${selectedDepartment === "PDQC" ? "bg-[#002b63] text-white" : "bg-blue-100/50 text-[#002b63] group-hover:bg-[#002b63] group-hover:text-white"}`}>
                          <Building className="size-4" />
                        </div>
                        <div>
                          <span className={`text-[11px] font-bold block ${selectedDepartment === "PDQC" ? "text-[#002b63]" : "text-slate-900"}`}>
                            PDQC Department
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500 block">
                            Department Login
                          </span>
                        </div>
                      </div>
                      
                      <ul className="space-y-1 mt-2.5 pt-2.5 border-t border-slate-100">
                        {["Calculation Workspace", "Grade Builder", "Reports"].map((feature) => (
                          <li key={feature} className="flex items-center gap-1.5 text-[9px] font-medium text-slate-600">
                            <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.button>
                </div>
              </div>
            </form>

            {/* Demo Access Cards (Development Only) */}
            {import.meta.env.DEV && (
              <>
                <div className="mt-6 relative">
                  <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      Demo Access
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {/* Costing Dept Admin */}
                  <button
                    type="button"
                    id="quick-login-admin"
                    onClick={() => handleDemoLogin("admin@jsw-mcms.local")}
                    className="w-full group flex items-center p-3 bg-slate-50 border border-slate-200 rounded-sm hover:border-[#002b63] hover:shadow-sm hover:bg-blue-50/50 transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="shrink-0 text-[#002b63] bg-blue-100/60 p-1.5 rounded">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div className="ml-3 flex-grow">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#002b63] transition-colors">
                        Costing Department (Admin)
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        admin@jsw-mcms.local
                      </p>
                    </div>
                    <div className="shrink-0 text-slate-300 group-hover:text-[#002b63] transition-colors self-center opacity-0 group-hover:opacity-100">
                      <LogIn className="size-4" />
                    </div>
                  </button>

                  {/* PDQC User */}
                  <button
                    type="button"
                    id="quick-login-pdqc"
                    onClick={() => handleDemoLogin("pdqc@jsw-mcms.local")}
                    className="w-full group flex items-center p-3 bg-slate-50 border border-slate-200 rounded-sm hover:border-[#002b63] hover:shadow-sm hover:bg-blue-50/50 transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="shrink-0 text-[#002b63] bg-blue-100/60 p-1.5 rounded">
                      <User className="size-4" />
                    </div>
                    <div className="ml-3 flex-grow">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#002b63] transition-colors">
                        PDQC (User)
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        pdqc@jsw-mcms.local
                      </p>
                    </div>
                    <div className="shrink-0 text-slate-300 group-hover:text-[#002b63] transition-colors self-center opacity-0 group-hover:opacity-100">
                      <LogIn className="size-4" />
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* Footer */}
            <p className="text-center text-[10px] text-slate-400 mt-8">
              JSW Metal Cost Management System · Enterprise Platform V2.0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
