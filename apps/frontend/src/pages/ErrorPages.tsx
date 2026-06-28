import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertTriangle, 
  Lock, 
  ShieldAlert, 
  RefreshCw, 
  FileText, 
  ChevronRight, 
  Home, 
  LogOut,
  Copy,
  CheckCircle2,
  Activity
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "../store/auth";
import { logger } from "../utils/logger";
import { api } from "../services/api";

// ── 404 NOT FOUND PAGE ──────────────────────────────────────────────────────────
export function Page404() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
        <div className="size-20 rounded-sm bg-amber-50 text-amber-500 grid place-items-center shadow-sm shadow-amber-500/5 ring-1 ring-amber-200">
          <AlertTriangle className="size-10" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-amber-600">Error Code: 404</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Costing Workspace Not Found</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-semibold">
            The page you are looking for does not exist or has been shifted. Please verify the URL parameter or redirect back.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <Button variant="outline" className="flex-1 text-xs h-10 border-slate-200 font-bold text-slate-600 hover:bg-slate-50" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button className="flex-1 text-xs h-10 bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm shadow-blue-500/10 flex items-center justify-center gap-1" onClick={() => navigate("/")}>
            <Home className="size-4" /> Go to Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}

// ── 403 FORBIDDEN PAGE ──────────────────────────────────────────────────────────
export function Page403() {
  const { actor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout().then(() => navigate("/login"));
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
        <div className="size-20 rounded-sm bg-red-50 text-red-500 grid place-items-center shadow-sm shadow-red-500/5 ring-1 ring-red-200">
          <ShieldAlert className="size-10" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-red-600">Error Code: 403</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Security Clearance Required</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
            Current Profile: {actor?.name || "Guest"} ({actor?.role || "UNASSIGNED"})
          </p>
          <p className="text-sm text-slate-500 leading-relaxed font-semibold mt-1">
            Your current role does not have authorization to view this cost-master page section.
          </p>
        </div>
        
        <Card className="w-full border-slate-150 shadow-xs bg-white text-left p-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5"><Lock className="size-4 text-slate-500" /> Authorized Roles</h3>
          <div className="grid gap-1.5 mt-2.5">
            <div className="flex justify-between items-center text-xs p-2 rounded-sm border bg-slate-50">
              <span className="font-semibold text-slate-600">Masters / Rates / Audits / Users / Settings</span>
              <span className="font-black text-blue-600 text-[10px]">COSTING_DEPARTMENT ONLY</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2 rounded-sm border bg-slate-50">
              <span className="font-semibold text-slate-600">Dashboard / Workspace / Grades / Reports</span>
              <span className="font-black text-slate-500 text-[10px]">COSTING_DEPARTMENT, PDQC</span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <Button variant="outline" className="flex-1 text-xs h-10 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1" onClick={handleLogout}>
            <LogOut className="size-4" /> Sign In as Admin
          </Button>
          <Button className="flex-1 text-xs h-10 bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-1" onClick={() => navigate("/")}>
            <Home className="size-4" /> Exit to Safety
          </Button>
        </div>
      </div>
    </main>
  );
}

// ── 500 SERVER / CRASH PAGE ──────────────────────────────────────────────────────
export function Page500({ error, resetErrorBoundary }: { error?: Error; resetErrorBoundary?: () => void }) {
  const { actor } = useAuth();
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [copied, setCopied] = useState(false);

  const diagText = logger.exportDiagnostics(actor);

  const handleCopy = () => {
    navigator.clipboard.writeText(diagText);
    setCopied(true);
    toast.success("Diagnostic report copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-xl w-full text-center flex flex-col items-center gap-6 animate-in fade-in duration-300">
        <div className="size-20 rounded-sm bg-red-50 text-red-500 grid place-items-center shadow-sm ring-1 ring-red-200">
          <AlertTriangle className="size-10" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-red-600">Error Code: 500</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">System Cost View Failed</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-semibold">
            An unexpected error occurred during costing data rendering. The diagnostic information below has been captured.
          </p>
        </div>

        {/* Diagnostic Accordion */}
        <Card className="w-full border-slate-150 bg-white text-left overflow-hidden shadow-xs">
          <button 
            type="button" 
            onClick={() => setShowDiagnostics(curr => !curr)} 
            className="w-full p-4 flex justify-between items-center hover:bg-slate-50/40 border-b border-slate-100 transition-colors"
          >
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="size-4 text-slate-500" /> IT Diagnostic Report
            </span>
            <ChevronRight className={`size-4 text-slate-400 transition-transform duration-200 ${showDiagnostics ? "rotate-90" : ""}`} />
          </button>
          {showDiagnostics && (
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Diag JSON</span>
                <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-[10px] border-slate-200 font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                  {copied ? <CheckCircle2 className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied!" : "Copy Diagnostics"}
                </Button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed p-3.5 rounded-sm max-h-[220px] overflow-auto border shadow-inner">
                {error?.stack || diagText}
              </pre>
            </CardContent>
          )}
        </Card>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <Button 
            variant="outline" 
            className="flex-1 text-xs h-10 border-slate-200 font-bold text-slate-600 hover:bg-slate-50" 
            onClick={() => {
              if (resetErrorBoundary) resetErrorBoundary();
              else window.location.reload();
            }}
          >
            Attempt Recovery
          </Button>
          <Button 
            className="flex-1 text-xs h-10 bg-blue-600 text-white font-bold hover:bg-blue-700" 
            onClick={() => window.location.href = "/"}
          >
            Force Exit to Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}

// ── MAINTENANCE / OFFLINE PAGE ──────────────────────────────────────────────────
export function PageMaintenance() {
  const [seconds, setSeconds] = useState(15);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const verifyConnection = async () => {
    setChecking(true);
    try {
      // Ping backend health endpoint
      await api.get("/auth/me");
      toast.success("Connection re-established! Redirecting to Dashboard.");
      navigate("/");
    } catch {
      toast.error("ERP backend service is still unreachable. Retrying shortly.");
      setSeconds(15);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (seconds <= 0) {
      verifyConnection();
      return;
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50/50">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6 animate-in fade-in duration-300">
        <div className="size-20 rounded-sm bg-blue-50 text-blue-600 grid place-items-center shadow-sm ring-1 ring-blue-200 relative overflow-hidden">
          <Activity className="size-10 animate-pulse" />
          {checking && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-600 animate-loading-bar" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-blue-600">Offline / Maintenance Mode</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">ERP cost database connection lost</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-semibold">
            We are currently running database index synchronization or are temporarily disconnected from JSW core server services.
          </p>
        </div>

        <Card className="w-full border-slate-150 shadow-xs bg-white py-3.5 px-4 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Next Connection Retry</span>
          <span className="text-sm font-black text-blue-600 font-mono">{seconds} seconds</span>
        </Card>

        <Button 
          disabled={checking}
          onClick={verifyConnection}
          className={`w-full text-xs h-10 bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all ${checking ? "btn-loading-stripes" : ""}`}
        >
          {!checking && <RefreshCw className="size-4" />}
          {checking ? "Checking ERP Services..." : "Recheck Connection Now"}
        </Button>
      </div>
    </main>
  );
}
