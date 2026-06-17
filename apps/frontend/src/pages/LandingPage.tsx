import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { 
  Database, 
  Layers, 
  Calculator, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  History, 
  FileSpreadsheet, 
  TrendingUp, 
  ArrowRight, 
  Cpu
} from "lucide-react";


// ── Custom High-Fidelity SVG Illustrations ────────────────────────────────────

// 1. Steel Coil - Hero Wireframe (Detailed Isometric View)
function SteelCoilHeroSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="currentColor" strokeWidth="1.2">
        {/* Outer Cylinder Winding Layers */}
        <ellipse cx="140" cy="150" rx="90" ry="120" strokeDasharray="1 1" className="text-[#003B7A]/20" />
        <ellipse cx="140" cy="150" rx="80" ry="110" />
        <ellipse cx="140" cy="150" rx="70" ry="100" />
        <ellipse cx="140" cy="150" rx="60" ry="90" />
        <ellipse cx="140" cy="150" rx="50" ry="80" strokeDasharray="3 3" />
        <ellipse cx="140" cy="150" rx="30" ry="45" className="text-[#003B7A]/40" fill="#f1f5f9" />
        
        {/* Depth Lines (Extrusions) */}
        <path d="M 140,40 L 290,80" />
        <path d="M 140,260 L 290,220" strokeDasharray="4 4" className="opacity-40" />
        <path d="M 220,150 L 370,110" />
        
        {/* Rear Cap Winding Layers */}
        <path d="M 290,80 A 80,110 0 0 1 370,110" />
        <path d="M 290,80 A 80,110 0 0 0 290,220" strokeDasharray="4 4" className="opacity-40" />
        
        {/* Steel strip coming off the coil */}
        <path d="M 140,260 C 140,260 100,280 40,280 L 10,280" strokeWidth="1.5" stroke="#003B7A" />
        <path d="M 140,250 C 140,250 105,270 45,270 L 15,270" strokeWidth="1" stroke="#003B7A" />
        
        {/* Inner center core cylinder cut */}
        <ellipse cx="290" cy="110" rx="30" ry="45" className="text-[#003B7A]/30" />
        
        {/* Technical crosshairs and center lines */}
        <line x1="140" y1="20" x2="140" y2="280" strokeDasharray="2 2" className="text-[#4B5563]/25" />
        <line x1="20" y1="150" x2="260" y2="150" strokeDasharray="2 2" className="text-[#4B5563]/25" />
      </g>
    </svg>
  );
}

// 2. Structural Steel H-Beam (Detailed Isometric View)
function SteelBeamSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="currentColor" strokeWidth="1.2">
        {/* Front Profile Face of H-Beam */}
        {/* Top flange front */}
        <path d="M 80,180 L 160,140 L 180,150 L 100,190 Z" fill="#F8F9FA" />
        {/* Web center front */}
        <path d="M 120,160 L 140,150 L 140,210 L 120,220 Z" />
        {/* Bottom flange front */}
        <path d="M 80,240 L 160,200 L 180,210 L 100,250 Z" fill="#F8F9FA" />
        
        {/* Extruded Depth to Back */}
        <path d="M 160,140 L 280,70" />
        <path d="M 180,150 L 300,80" />
        <path d="M 100,190 L 220,120" />
        
        {/* Web back */}
        <path d="M 240,90 L 260,80 L 260,140 L 240,150 Z" strokeDasharray="3 3" className="opacity-40" />
        
        {/* Rear Profile Face (top/bottom flanges) */}
        <path d="M 200,110 L 280,70 L 300,80 L 220,120 Z" fill="#F8F9FA" opacity="0.8" />
        <path d="M 200,170 L 280,130 L 300,140 L 220,180 Z" opacity="0.5" />
        
        {/* Bottom flange back connector */}
        <path d="M 160,200 L 280,130" />
        <path d="M 180,210 L 300,140" />
        <path d="M 100,250 L 220,180" />

        {/* Blueprint coordinate boxes & dots */}
        <circle cx="160" cy="140" r="3" fill="#D97706" />
        <circle cx="100" cy="250" r="3" fill="#D97706" />
      </g>
    </svg>
  );
}

// 3. Exploded Steel Coil SVG for Breakdown Section
function SteelCoilExplodedSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="currentColor" strokeWidth="1.2">
        {/* Center core support cylinder - exploded outwards */}
        <g className="text-[#003B7A]/60">
          <ellipse cx="150" cy="200" rx="25" ry="40" strokeWidth="1" />
          <path d="M 150,160 L 250,160 M 150,240 L 250,240" strokeDasharray="2 2" />
          <ellipse cx="250" cy="200" rx="25" ry="40" strokeDasharray="2 2" strokeWidth="1" />
        </g>
        
        {/* Main Inner Steel Coil winding */}
        <ellipse cx="300" cy="200" rx="60" ry="90" fill="#FFFFFF" />
        <ellipse cx="300" cy="200" rx="50" ry="75" />
        <ellipse cx="300" cy="200" rx="40" ry="60" />
        
        {/* Outer Steel wrapper - exploded outwards */}
        <g className="text-[#4B5563]">
          {/* Exploded wrapper sleeve */}
          <path d="M 370,110 A 110,140 0 0 1 450,200 A 110,140 0 0 1 370,290" strokeWidth="1.5" strokeDasharray="4 2" />
          <path d="M 370,110 L 450,70" strokeDasharray="2 2" />
          <path d="M 370,290 L 450,250" strokeDasharray="2 2" />
          <path d="M 450,70 A 110,140 0 0 1 530,160 A 110,140 0 0 1 450,250" strokeWidth="1.5" strokeDasharray="4 2" />
        </g>
        
        {/* 3D lines */}
        <path d="M 300,110 L 420,80" />
        <path d="M 300,290 L 420,260" strokeDasharray="3 3" className="opacity-30" />
        <path d="M 360,200 L 480,170" />
        
        {/* Cap winding */}
        <path d="M 420,80 A 60,90 0 0 1 480,170" />
        <path d="M 420,80 A 60,90 0 0 0 420,260" strokeDasharray="3 3" className="opacity-30" />

        {/* Dimension annotation lines */}
        {/* Width Annotation */}
        <line x1="300" y1="90" x2="420" y2="60" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M 300,90 L 305,95 M 300,90 L 305,85 M 420,60 L 415,65 M 420,60 L 415,55" stroke="#D97706" />
        <text x="345" y="65" fill="#D97706" className="font-geist text-[10px] font-bold">W: 1,500 mm</text>

        {/* Diameter Annotation */}
        <line x1="230" y1="200" x2="370" y2="200" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="230" cy="200" r="2.5" fill="#D97706" />
        <circle cx="370" cy="200" r="2.5" fill="#D97706" />
        <text x="260" y="193" fill="#D97706" className="font-geist text-[10px] font-bold">Ø 1,250 mm</text>
      </g>
    </svg>
  );
}

// 4. Detailed Isometric Wireframes for Gallery
function GalleryWireframeSvg({ type }: { type: "hr" | "cr" | "gp" | "beam" }) {
  if (type === "beam") {
    return (
      <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-400">
        <g stroke="currentColor" strokeWidth="1">
          {/* Minor beam view */}
          <path d="M 50,110 L 80,95 L 90,100 L 60,115 Z" fill="#E5E7EB" />
          <path d="M 70,100 L 80,95 L 80,125 L 70,130 Z" />
          <path d="M 50,140 L 80,125 L 90,130 L 60,145 Z" fill="#E5E7EB" />
          <path d="M 80,95 L 140,65" />
          <path d="M 90,100 L 150,70" />
          <path d="M 60,115 L 120,85" />
          <path d="M 80,125 L 140,95" />
          <path d="M 60,145 L 120,115" />
          <path d="M 140,65 L 150,70 L 120,85 L 110,80 Z" opacity="0.6" />
        </g>
      </svg>
    );
  }
  if (type === "gp") {
    // Galvalume / GP stack sheets
    return (
      <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-400">
        <g stroke="currentColor" strokeWidth="1">
          {/* Parallel sheets */}
          <path d="M 30,80 L 130,50 L 170,80 L 70,110 Z" fill="#F3F4F6" />
          <path d="M 30,85 L 130,55 L 170,85 L 70,115 Z" fill="#E5E7EB" />
          <path d="M 30,90 L 130,60 L 170,90 L 70,120 Z" fill="#D1D5DB" />
          
          <line x1="30" y1="80" x2="30" y2="90" />
          <line x1="70" y1="110" x2="70" y2="120" />
          <line x1="170" y1="80" x2="170" y2="90" />
          
          {/* Caliper thickness indicator */}
          <path d="M 20,75 L 20,95 M 15,75 L 25,75 M 15,95 L 25,95" stroke="#D97706" strokeWidth="0.8" />
          <text x="5" y="90" fill="#D97706" className="font-geist text-[8px] font-bold">t: 3.5mm</text>
        </g>
      </svg>
    );
  }
  if (type === "cr") {
    // Thin rolled coil wireframe
    return (
      <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-400">
        <g stroke="currentColor" strokeWidth="1">
          <ellipse cx="70" cy="75" rx="35" ry="50" />
          <ellipse cx="70" cy="75" rx="25" ry="36" />
          <ellipse cx="70" cy="75" rx="15" ry="21" fill="#FFFFFF" />
          <path d="M 70,25 L 130,45 M 70,125 L 130,105" />
          <path d="M 130,45 A 35,50 0 0 1 130,105" />
          <path d="M 130,45 A 35,50 0 0 0 130,105" strokeDasharray="3 3" opacity="0.3" />
        </g>
      </svg>
    );
  }
  // Default: HR coil (Heavy roll coil wireframe)
  return (
    <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gray-400">
      <g stroke="currentColor" strokeWidth="1">
        <ellipse cx="70" cy="75" rx="45" ry="55" />
        <ellipse cx="70" cy="75" rx="30" ry="38" />
        <ellipse cx="70" cy="75" rx="15" ry="18" fill="#F3F4F6" />
        <path d="M 70,20 L 140,40 M 70,130 L 140,110" />
        <path d="M 140,40 A 45,55 0 0 1 140,110" />
        {/* Core depth */}
        <path d="M 70,75 L 140,75" strokeDasharray="2 2" />
      </g>
    </svg>
  );
}


export function LandingPage() {
  const { actor } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCapWord, setActiveCapWord] = useState<number | null>(null);

  // Monitor scroll height to make header solid white
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Launch workspace handler
  const handleLaunchWorkspace = () => {
    if (actor) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] font-inter overflow-x-hidden selection:bg-[#003B7A]/10 selection:text-[#003B7A]">
      
      {/* ─── HEADER ─── */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white border-b border-gray-200/80 py-4 shadow-sm" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex flex-col gap-0.5">
              {/* Stylized JSW emblem */}
              <div className="flex gap-1 items-end">
                <span className="w-1.5 h-6 bg-[#003B7A]" />
                <span className="w-1.5 h-4 bg-[#D97706]" />
                <span className="w-1.5 h-5 bg-[#4B5563]" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-geist font-black text-lg leading-none tracking-tight text-[#003B7A]">JSW STEEL</span>
              <span className="font-geist text-[10px] font-extrabold tracking-widest text-[#4B5563] uppercase">MCMS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#4B5563] font-geist">
            <a href="#platform" className="hover:text-[#003B7A] transition-colors">Platform</a>
            <a href="#capabilities" className="hover:text-[#003B7A] transition-colors">Features</a>
            <a href="#workflow" className="hover:text-[#003B7A] transition-colors">Workspace</a>
            <a href="#gallery" className="hover:text-[#003B7A] transition-colors">Reports</a>
            <a href="#about" className="hover:text-[#003B7A] transition-colors">About</a>
          </nav>

          {/* Launch Buttons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/login")} 
              className="text-[#4B5563] hover:text-[#003B7A] font-geist text-sm font-bold transition-colors px-3 py-2"
            >
              Login
            </button>
            <button 
              onClick={handleLaunchWorkspace} 
              className="bg-[#003B7A] hover:bg-[#002D5E] text-white px-5 py-2.5 rounded text-sm font-bold font-geist tracking-wide transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.98]"
            >
              Launch Workspace
              <ArrowRight className="size-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ─── SECTION 1: HERO ─── */}
      <section className="relative min-h-screen pt-32 pb-20 flex items-center blueprint-grid border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 flex flex-col text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#003B7A]/5 border border-[#003B7A]/10 text-[#003B7A] text-[10px] font-extrabold tracking-widest uppercase rounded max-w-max mb-6"
            >
              <span className="live-dot-pulsate" />
              JSW Enterprise Costing Engine
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-geist text-6xl sm:text-7xl xl:text-[90px] font-black tracking-tight leading-[0.9] text-[#111827]"
            >
              CALCULATE.<br />
              COMPARE.<br />
              OPTIMIZE.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[#4B5563] text-lg sm:text-xl font-normal max-w-xl mt-6 leading-relaxed"
            >
              Centralized metal pricing, grade management, cost simulation, and reporting for industrial procurement and manufacturing teams.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <button 
                onClick={handleLaunchWorkspace} 
                className="bg-[#003B7A] hover:bg-[#002D5E] text-white px-8 py-4 rounded font-bold font-geist text-sm transition-all flex items-center gap-2 shadow-sm"
              >
                Launch Workspace
                <ArrowRight className="size-4" />
              </button>
              <a 
                href="#platform" 
                className="border border-gray-300 text-[#111827] hover:bg-gray-100/60 px-8 py-4 rounded font-bold font-geist text-sm transition-all"
              >
                View Platform
              </a>
            </motion.div>
 
            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-8 border-t border-dashed border-gray-200"
            >
              <div>
                <div className="font-geist font-bold text-2xl text-[#003B7A]">100+</div>
                <div className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mt-0.5">Steel Grades</div>
              </div>
              <div>
                <div className="font-geist font-bold text-2xl text-[#003B7A]">50+</div>
                <div className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mt-0.5">Material Types</div>
              </div>
              <div>
                <div className="font-geist font-bold text-2xl text-[#003B7A]">Real-Time</div>
                <div className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mt-0.5">Pricing Sync</div>
              </div>
              <div>
                <div className="font-geist font-bold text-2xl text-[#003B7A]">Enterprise</div>
                <div className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mt-0.5">Grade Security</div>
              </div>
            </motion.div>
          </div>
 
          {/* Right Hero Column - Premium Industrial Visual with Engineering Callouts */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center items-center"
          >
            
            {/* Visual Container */}
            <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-hidden">
              <div className="absolute top-3 left-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-geist text-[9px] font-bold tracking-wider text-gray-400 uppercase">SYS_VIZ_ENGINE // ST-04</span>
              </div>
              
              {/* Technical Drawing Canvas - side-by-side coil & structural beam */}
              <div className="py-6 text-[#003B7A] flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="border border-gray-100 rounded bg-gray-50/50 p-2 flex flex-col items-center">
                    <span className="font-geist text-[8px] font-bold text-gray-400 self-start uppercase">ITEM_01 // COIL</span>
                    <SteelCoilHeroSvg className="w-full h-auto max-h-[140px]" />
                  </div>
                  <div className="border border-gray-100 rounded bg-gray-50/50 p-2 flex flex-col items-center">
                    <span className="font-geist text-[8px] font-bold text-gray-400 self-start uppercase">ITEM_02 // H_BEAM</span>
                    <SteelBeamSvg className="w-full h-auto max-h-[140px]" />
                  </div>
                </div>
              </div>
 
              {/* Engineering Callout Labels Overlay */}
              <div className="absolute right-4 top-24 bg-white/90 backdrop-blur-sm border border-gray-200 rounded p-2.5 shadow-sm text-left max-w-[140px] pointer-events-none">
                <div className="font-geist text-[9px] font-bold text-gray-400 uppercase">PART_SPEC</div>
                <div className="font-geist font-bold text-sm text-[#111827] mt-0.5">HR Coil</div>
                <div className="border-t border-gray-100 my-1" />
                <div className="flex justify-between text-[9px] text-gray-500"><span className="font-medium">Grade:</span><span className="font-bold font-geist">E250A</span></div>
                <div className="flex justify-between text-[9px] text-gray-500"><span className="font-medium">Thk:</span><span className="font-bold font-geist">8.00 mm</span></div>
              </div>
 
              <div className="absolute left-4 bottom-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded p-2.5 shadow-sm text-left max-w-[150px] pointer-events-none">
                <div className="font-geist text-[9px] font-bold text-gray-400 uppercase">LIVE_COST</div>
                <div className="font-geist font-black text-base text-[#D97706] mt-0.5">₹63.75<span className="text-[10px] font-bold text-gray-500 font-inter">/kg</span></div>
                <div className="border-t border-gray-100 my-1" />
                <div className="flex justify-between text-[9px] text-gray-500"><span className="font-medium">Sourcing:</span><span className="font-bold text-[#003B7A]">JSW Master</span></div>
              </div>
            </div>
 
            {/* Decorative Isometric grid details behind */}
            <div className="absolute -z-10 -right-6 -bottom-6 w-32 h-32 blueprint-grid opacity-60 border border-gray-200 pointer-events-none" />
          </motion.div>
 
        </div>
      </section>

      {/* ─── SECTION 2: PRODUCT BREAKDOWN ─── */}
      <section id="platform" className="py-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full text-center">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[11px] font-extrabold tracking-widest text-[#003B7A] uppercase">Exploded Technical Model</span>
            <h2 className="font-geist text-3xl md:text-4xl font-black tracking-tight text-[#111827] mt-2">
              HR COIL E250A SPECIFICATION
            </h2>
            <div className="w-12 h-1 bg-[#003B7A] mx-auto mt-4" />
          </div>

          {/* Exploded product presentation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Tech Specs Left */}
            <div className="lg:col-span-3 text-left order-2 lg:order-1 flex flex-col gap-6">
              <div className="border-l-2 border-gray-200 pl-4 py-1 hover:border-[#003B7A] transition-colors">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Material Grade</div>
                <div className="font-geist font-bold text-xl text-[#111827] mt-0.5">HR Coil E250A</div>
                <p className="text-xs text-gray-500 mt-1">High strength structural steel suitable for manufacturing and infrastructure costing models.</p>
              </div>
              <div className="border-l-2 border-gray-200 pl-4 py-1 hover:border-[#003B7A] transition-colors">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Coil Nominal Weight</div>
                <div className="font-geist font-bold text-xl text-[#111827] mt-0.5">1,000 kg (Standard Unit)</div>
                <p className="text-xs text-gray-500 mt-1">Sizing standard weight parameters applied directly during grade additions inside calculators.</p>
              </div>
            </div>

            {/* Central SVG Render with Callout Line Annotations */}
            <div className="lg:col-span-6 relative flex justify-center items-center order-1 lg:order-2">
              <div className="w-full max-w-xl text-[#003B7A]/80">
                <SteelCoilExplodedSvg className="w-full h-auto" />
              </div>
            </div>

            {/* Tech Specs Right */}
            <div className="lg:col-span-3 text-left order-3 flex flex-col gap-6">
              <div className="border-l-2 border-gray-200 pl-4 py-1 hover:border-[#D97706] transition-colors">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Calculated Base Rate</div>
                <div className="font-geist font-bold text-xl text-[#D97706] mt-0.5">₹63.75 / kg</div>
                <p className="text-xs text-gray-500 mt-1">Reflects active market rates excluding tax parameters. Recalculated dynamically in workflows.</p>
              </div>
              <div className="border-l-2 border-gray-200 pl-4 py-1 hover:border-[#003B7A] transition-colors">
                <div className="text-[11px] font-bold text-gray-400 uppercase">Sourcing Database</div>
                <div className="font-geist font-bold text-xl text-[#111827] mt-0.5">JSW Master Pricing</div>
                <p className="text-xs text-gray-500 mt-1">Enterprise master table storing secure baseline data uploaded by central pricing administrators.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 3: PLATFORM CAPABILITIES ─── */}
      <section id="capabilities" className="py-28 bg-[#F3F4F6] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Explanatory detail sticky left */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 text-left">
              <span className="text-[11px] font-extrabold tracking-widest text-[#003B7A] uppercase">System Pillars</span>
              <h3 className="font-geist text-3xl font-black tracking-tight text-[#111827] mt-2 leading-none">
                CORE SYSTEM<br />CAPABILITIES
              </h3>
              <p className="text-sm text-[#4B5563] mt-4 max-w-sm leading-relaxed">
                MCMS is designed as an engineering tool. These core pillars guide costing calculations, verification procedures, and audit validation pipelines.
              </p>
              <div className="flex gap-4 mt-6">
                <div className="h-0.5 w-12 bg-[#003B7A]" />
                <span className="font-geist text-[11px] font-black tracking-wider uppercase text-gray-400">Section 03 // Core</span>
              </div>
            </div>

            {/* Massive Typography Rows Right */}
            <div className="lg:col-span-8 flex flex-col gap-6 text-left">
              
              {[
                { word: "PRICE.", desc: "Dynamic integration of base prices, premium sheets, and sourcing indices directly from JSW central database." },
                { word: "CALCULATE.", desc: "High-density workspace calculator evaluating grades, ingredients, and custom alloy blends instantly." },
                { word: "COMPARE.", desc: "Advanced comparison interface plotting costing profiles, thickness ranges, and rates across steel grades." },
                { word: "REPORT.", desc: "One-click export of detailed cost summaries, PDF reports, and compliance audits for management review." }
              ].map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={idx} 
                  className="group border-b border-gray-300/60 pb-8 cursor-pointer"
                  onMouseEnter={() => setActiveCapWord(idx)}
                  onMouseLeave={() => setActiveCapWord(null)}
                >
                  <div className="flex justify-between items-baseline">
                    <h4 
                      className={`font-geist text-5xl sm:text-6xl xl:text-8xl font-black tracking-tighter leading-none select-none transition-all duration-300 ${
                        activeCapWord === idx ? "text-[#003B7A] translate-x-2" : "text-[#111827]/10"
                      }`}
                    >
                      {item.word}
                    </h4>
                    <span className="font-geist text-xs font-bold text-gray-400">0{idx + 1}</span>
                  </div>
                  <p className="text-sm text-[#4B5563] max-w-xl mt-4 font-normal leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}

            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 4: WORKFLOW BLUEPRINT ─── */}
      <section id="workflow" className="py-24 bg-[#0A1A2F] text-white border-b border-gray-900 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.05] blueprint-grid-dark" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full text-center relative z-10">
          
          <div className="max-w-xl mx-auto mb-20 text-center">
            <span className="text-[10px] font-extrabold tracking-widest text-[#D97706] uppercase">Schematic Blueprint</span>
            <h2 className="font-geist text-3xl md:text-4xl font-black tracking-tight mt-2">
              STEEL COSTING SYSTEM FLOW
            </h2>
            <div className="w-12 h-0.5 bg-[#D97706] mx-auto mt-4" />
          </div>

          {/* Workflow Steps Horizontal/Vertical Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start relative">
            
            {[
              { num: "01", title: "Metal Selection", icon: Database, desc: "Query base metal category indices from secure JSW pricing records." },
              { num: "02", title: "Grade Selection", icon: Layers, desc: "Pick JSW grades (e.g., E250A) mapping to specific density values." },
              { num: "03", title: "Cost Calculation", icon: Calculator, desc: "Compute price per KG and ton factoring sheet thicknesses." },
              { num: "04", title: "Live Simulation", icon: Sliders, desc: "Add cards to the cost worksheet, adjust parameters, and compare variables." },
              { num: "05", title: "Report Generation", icon: FileText, desc: "Run audit trace procedures and export clean PDF sheets." }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative flex flex-col items-center group">
                  {/* Step Card Container */}
                  <div className="w-full bg-white/5 border border-white/10 rounded p-6 text-center hover:border-white/30 transition-all duration-300 min-h-[200px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="font-geist text-[9px] font-bold text-gray-500 tracking-wider">FLOW_NODE_{step.num}</span>
                      <span className="text-[10px] font-bold text-[#D97706] font-geist">STEP {step.num}</span>
                    </div>
                    
                    <div className="my-4 flex flex-col items-center">
                      <Icon className="size-8 text-white/80 group-hover:text-[#D97706] transition-colors mb-3" />
                      <h4 className="font-geist font-bold text-base text-white">{step.title}</h4>
                    </div>

                    <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Connecting Line (Only visible on desktop between columns) */}
                  {idx < 4 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[1px] border-t border-dashed border-white/20 transform -translate-y-1/2 z-20 pointer-events-none" />
                  )}
                </div>
              );
            })}

          </div>

          <div className="mt-16 text-xs text-gray-500 font-mono flex items-center justify-center gap-2">
            <span>[FLOW_STATUS: VERIFIED]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="ml-4">[EN-2290 INDUSTRIAL PROTOCOL ACTIVE]</span>
          </div>

        </div>
      </section>

      {/* ─── SECTION 5: PLATFORM SHOWCASE (3D PERSPECTIVE) ─── */}
      <section className="py-28 bg-[#F8F9FA] border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Description Left */}
          <div className="lg:col-span-5 text-left flex flex-col">
            <span className="text-[11px] font-extrabold tracking-widest text-[#003B7A] uppercase">3D Interface Showcase</span>
            <h2 className="font-geist text-4xl font-black tracking-tight text-[#111827] mt-2">
              LAYERED PERSPECTIVE ENGINE
            </h2>
            <p className="text-sm text-[#4B5563] font-normal leading-relaxed mt-6">
              MCMS compiles individual tool modules that interface with each other. Explore dynamic components stacking cleanly into a single costing platform.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="size-5 rounded-full bg-[#003B7A]/5 border border-[#003B7A]/20 flex items-center justify-center font-geist text-[10px] font-bold text-[#003B7A] mt-0.5">1</span>
                <div>
                  <span className="font-geist font-bold text-sm text-[#111827]">Cost Workspace</span>
                  <p className="text-xs text-[#4B5563] mt-0.5">Build and evaluate costing sheets dynamically.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="size-5 rounded-full bg-[#003B7A]/5 border border-[#003B7A]/20 flex items-center justify-center font-geist text-[10px] font-bold text-[#003B7A] mt-0.5">2</span>
                <div>
                  <span className="font-geist font-bold text-sm text-[#111827]">Comparison Engine</span>
                  <p className="text-xs text-[#4B5563] mt-0.5">Compare costing variables side-by-side across alloys.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="size-5 rounded-full bg-[#003B7A]/5 border border-[#003B7A]/20 flex items-center justify-center font-geist text-[10px] font-bold text-[#003B7A] mt-0.5">3</span>
                <div>
                  <span className="font-geist font-bold text-sm text-[#111827]">Price Master Database</span>
                  <p className="text-xs text-[#4B5563] mt-0.5">Central baseline for alloy rates and logistics metrics.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Layered Perspective Panel Right */}
          <div className="lg:col-span-7 flex justify-center items-center py-12 relative min-h-[480px]">
            
            {/* 3D Stack Container wrapper */}
            <div className="relative w-full max-w-lg perspective-1000">
              <div className="relative w-full h-[360px] preserve-3d transition-transform duration-700 hover:rotate-x-12 hover:-rotate-y-12">
                
                {/* Layer 4: Audit Logs (Bottom of stack) */}
                <div 
                  className="absolute inset-0 bg-white border border-gray-200 rounded-md p-4 shadow-sm transition-transform duration-500 font-mono text-[10px] text-gray-500 flex flex-col justify-between"
                  style={{
                    transform: "translateZ(-80px) translateY(80px) rotateX(15deg) rotateY(-15deg) rotateZ(5deg)",
                  }}
                >
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-bold text-[#003B7A]">AUDIT_LOGGER // LOGS</span>
                    <span>ONLINE</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5 mt-2 justify-start text-left">
                    <div>[07:40:12] - <span className="text-green-600 font-bold">SUCCESS</span> - Cost sheet JSW-9287 generated.</div>
                    <div>[07:42:00] - <span className="text-blue-600 font-bold">INFO</span> - Grade E250A price adjusted to ₹63.75/kg.</div>
                    <div>[07:43:15] - <span className="text-yellow-600 font-bold">WARN</span> - ERP connection database sync initialized.</div>
                  </div>
                  <div className="text-right text-[8px] border-t border-gray-100 pt-2 font-geist">SYSTEM ACTIVE // NO ERRORS</div>
                </div>

                {/* Layer 3: Price Master Database */}
                <div 
                  className="absolute inset-0 bg-white border border-gray-200 rounded-md p-4 shadow-sm transition-transform duration-500 text-left flex flex-col"
                  style={{
                    transform: "translateZ(-40px) translateY(40px) rotateX(15deg) rotateY(-15deg) rotateZ(5deg)",
                  }}
                >
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-geist font-bold text-xs text-[#111827]">Price Master</span>
                    <span className="text-[9px] font-bold bg-[#003B7A]/5 text-[#003B7A] px-1.5 py-0.5 rounded">DATABASE</span>
                  </div>
                  <div className="mt-2 space-y-2 flex-1">
                    <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
                      <span className="font-bold">E250A (HR Coil)</span>
                      <span className="font-geist font-bold text-[#D97706]">₹63.75/kg</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
                      <span className="font-bold">E350 (HR Coil)</span>
                      <span className="font-geist font-bold text-[#D97706]">₹67.20/kg</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-gray-50 pb-1">
                      <span className="font-bold">CR Coil G300</span>
                      <span className="font-geist font-bold text-[#D97706]">₹72.10/kg</span>
                    </div>
                  </div>
                  <div className="text-[9px] font-bold text-gray-400">Total Items: 104 Grades</div>
                </div>

                {/* Layer 2: Comparison Engine */}
                <div 
                  className="absolute inset-0 bg-white border border-gray-200 rounded-md p-4 shadow-sm transition-transform duration-500 text-left flex flex-col"
                  style={{
                    transform: "translateZ(0px) translateY(0px) rotateX(15deg) rotateY(-15deg) rotateZ(5deg)",
                  }}
                >
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="font-geist font-bold text-xs text-[#111827]">Comparison Engine</span>
                    <span className="text-[9px] font-bold bg-[#D97706]/10 text-[#D97706] px-1.5 py-0.5 rounded">SIM_ACTIVE</span>
                  </div>
                  <div className="mt-3 flex-1 flex flex-col gap-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-500"><span>HR Coil E250A</span><span className="font-bold">₹63,750 / Ton</span></div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-[#003B7A] h-full" style={{ width: "63%" }} /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-500"><span>CR Coil G300</span><span className="font-bold">₹72,100 / Ton</span></div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-[#003B7A] h-full" style={{ width: "72%" }} /></div>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-400 font-geist">SIMULATION DELTA: +13.1%</div>
                </div>

                {/* Layer 1: Cost Workspace (Top layer, detailed visual) */}
                <div 
                  className="absolute inset-0 bg-white border border-[#003B7A] rounded-md p-4 shadow-md transition-all duration-500 text-left flex flex-col justify-between hover:scale-[1.02]"
                  style={{
                    transform: "translateZ(40px) translateY(-40px) rotateX(15deg) rotateY(-15deg) rotateZ(5deg)",
                  }}
                >
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#003B7A]" />
                      <span className="font-geist font-black text-xs text-[#003B7A]">Workspace Calculator</span>
                    </div>
                    <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">ACTIVE</span>
                  </div>

                  <div className="my-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Selected Metal Card</span>
                      <div className="border border-gray-100 p-2 rounded bg-[#F8F9FA] flex justify-between items-center">
                        <div>
                          <div className="font-geist font-bold text-[11px]">HR Coil E250A</div>
                          <div className="text-[9px] text-gray-400">1000kg // 8mm</div>
                        </div>
                        <span className="font-geist font-extrabold text-xs text-[#003B7A]">₹63.75/kg</span>
                      </div>
                    </div>

                    <div className="bg-[#003B7A] text-white p-2.5 rounded flex justify-between items-center mt-3">
                      <div>
                        <div className="text-[8px] font-bold text-white/60 uppercase">Material Subtotal</div>
                        <div className="font-geist font-black text-sm">₹63,750.00</div>
                      </div>
                      <div className="text-[9px] font-bold bg-white/10 px-2 py-1 rounded border border-white/20 select-none">
                        Added to Summary
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono">
                    <span>USR_KEY: PROCUR_01</span>
                    <span>v1.0.4</span>
                  </div>
                </div>

              </div>
            </div>
            
          </div>

        </div>
      </section>

      {/* ─── SECTION 6: INDUSTRIAL METRICS ─── */}
      <section className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {[
              { stat: "100+", label: "Steel Grades", desc: "Fully cataloged structural alloys, high-strength cold-rolled, and galvanized metal grades." },
              { stat: "50+", label: "Material Types", desc: "Diversified inputs covering raw alloys, hot rolled, galvanized sheets, and sections." },
              { stat: "5000+", label: "Calculations", desc: "Simulated costing pipelines evaluating material thickness, volume, and rate configurations." },
              { stat: "100%", label: "Audit Traceability", desc: "Cryptographic logging tracking baseline edits, calculation logs, and export events." }
            ].map((metric, idx) => (
              <div key={idx} className="border-t border-gray-200 pt-6 text-left flex flex-col justify-between">
                <div>
                  <div className="font-geist font-black text-5xl text-[#003B7A] tracking-tight">{metric.stat}</div>
                  <div className="font-geist font-bold text-xs text-[#111827] uppercase tracking-wider mt-2">{metric.label}</div>
                  <p className="text-xs text-[#4B5563] mt-3 font-normal leading-relaxed">
                    {metric.desc}
                  </p>
                </div>
                <div className="w-8 h-[2px] bg-gray-200 mt-6" />
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ─── SECTION 7: MATERIAL GALLERY ─── */}
      <section id="gallery" className="py-24 bg-[#F8F9FA] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full text-center">
          
          <div className="max-w-xl mx-auto mb-16 text-center">
            <span className="text-[11px] font-extrabold tracking-widest text-[#003B7A] uppercase">Procured Materials</span>
            <h2 className="font-geist text-3xl md:text-4xl font-black tracking-tight text-[#111827] mt-2">
              STEEL MATERIAL CATALOG
            </h2>
            <div className="w-12 h-1 bg-[#003B7A] mx-auto mt-4" />
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {[
              { type: "hr", title: "HR Coil", grade: "E250A / E350", thk: "1.6mm - 20mm", weight: "1,000 kg", range: "₹61.50 - ₹67.80/kg" },
              { type: "cr", title: "CR Coil", grade: "IS 513 C-D / D-D", thk: "0.4mm - 3.2mm", weight: "1,000 kg", range: "₹68.20 - ₹73.50/kg" },
              { type: "gp", title: "GP Coil", grade: "IS 277 Z120 / Z180", thk: "0.3mm - 2.5mm", weight: "1,000 kg", range: "₹72.80 - ₹78.20/kg" },
              { type: "beam", title: "Structural Steel", grade: "IS 2062 E250 / E350", thk: "Flange: 6mm - 25mm", weight: "Custom Meter", range: "₹65.40 - ₹71.20/kg" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded p-6 text-left flex flex-col justify-between hover:border-[#003B7A] transition-all duration-300 group">
                
                {/* Header info */}
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-geist text-[9px] font-bold text-[#4B5563] tracking-widest uppercase">CATALOG_PART_0{idx + 1}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#003B7A] transition-colors" />
                  </div>
                  <h3 className="font-geist font-black text-xl text-[#111827] mt-2">{item.title}</h3>
                </div>

                {/* Embedded Wireframe View */}
                <div className="w-full h-32 my-6 bg-gray-50 border border-gray-100 flex items-center justify-center rounded overflow-hidden">
                  <GalleryWireframeSvg type={item.type as any} />
                </div>

                {/* Specs Data List */}
                <div className="space-y-2 text-xs border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-gray-500"><span className="font-medium">Standard Grade:</span><span className="font-bold text-[#111827] font-geist">{item.grade}</span></div>
                  <div className="flex justify-between text-gray-500"><span className="font-medium">Thickness Spec:</span><span className="font-bold text-[#111827] font-geist">{item.thk}</span></div>
                  <div className="flex justify-between text-gray-500"><span className="font-medium">Weight Metric:</span><span className="font-bold text-[#111827] font-geist">{item.weight}</span></div>
                  
                  <div className="border-t border-dashed border-gray-100 my-2 pt-2" />
                  
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Rate Range</span>
                    <span className="font-geist font-black text-sm text-[#D97706]">{item.range}</span>
                  </div>
                </div>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ─── SECTION 8: ENTERPRISE FEATURES ─── */}
      <section className="py-24 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full text-center">
          
          <div className="max-w-xl mx-auto mb-20 text-center">
            <span className="text-[11px] font-extrabold tracking-widest text-[#003B7A] uppercase">Platform Stack</span>
            <h2 className="font-geist text-3xl md:text-4xl font-black tracking-tight text-[#111827] mt-2">
              ENTERPRISE CAPABILITIES
            </h2>
            <div className="w-12 h-1 bg-[#003B7A] mx-auto mt-4" />
          </div>

          {/* Grid of 8 Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {[
              { icon: ShieldCheck, title: "Role Based Access", desc: "Fine-grained permissions segregating Admin, Employee, and Procurement accounts." },
              { icon: History, title: "Audit Logging", desc: "Cryptographic timeline storing every grade rate modification and workspace generation." },
              { icon: Database, title: "Master Pricing", desc: "Centralized authority table safeguarding metal base rates, logistics parameters, and margins." },
              { icon: Cpu, title: "Live Calculations", desc: "React-memoized costing engine evaluating subtotal changes instantly inside user viewport." },
              { icon: Sliders, title: "Comparison Engine", desc: "Plot grade profiles across thickness, width, and rates to evaluate margins." },
              { icon: FileText, title: "PDF Reports", desc: "One-click layout compiles summary listings into print-ready document sheets." },
              { icon: FileSpreadsheet, title: "Excel Export", desc: "Download raw ledger details directly to tabular sheets for finance team auditing." },
              { icon: TrendingUp, title: "Centralized Data", desc: "Harmonized costing database eliminating redundant calculations across teams." }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="border border-gray-100 hover:border-gray-200 rounded-lg p-6 text-left flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div>
                    <div className="size-10 rounded-full bg-[#003B7A]/5 flex items-center justify-center text-[#003B7A] mb-4">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-geist font-bold text-base text-[#111827]">{feat.title}</h3>
                    <p className="text-xs text-[#4B5563] mt-3 font-normal leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-gray-300 font-mono mt-6">NODE_ID: 0{idx + 1}</div>
                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* ─── SECTION 9: ABOUT MCMS ─── */}
      <section id="about" className="py-24 bg-[#F8F9FA] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 text-left">
            <span className="text-[11px] font-extrabold tracking-widest text-[#003B7A] uppercase">Manufacturing Infrastructure</span>
            <h2 className="font-geist text-3xl md:text-4xl font-black tracking-tight text-[#111827] mt-2">
              BUILT FOR INDUSTRIAL COSTING
            </h2>
            <div className="w-12 h-1 bg-[#003B7A] mt-4" />
          </div>

          <div className="lg:col-span-7 text-left">
            <p className="text-base text-[#4B5563] font-normal leading-relaxed">
              The JSW Metal Cost Management System (MCMS) represents a premium technological step in steel costing management. Developed to replace scattered offline spreadsheets, the platform consolidates pricing updates, costing models, grade metrics, and audit tracking into a fast, centralized web utility.
            </p>
            <p className="text-sm text-[#4B5563] font-normal leading-relaxed mt-4">
              With integrated calculation layers, a dynamic database matching the JSW Steel catalog, and a cryptographic logging database, MCMS brings speed, accuracy, and absolute validation security to industrial teams evaluating costing projects.
            </p>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded p-4 text-left">
                <span className="font-geist font-bold text-xs text-[#003B7A]">JSW Core Principles</span>
                <p className="text-[11px] text-[#4B5563] mt-1">Consistency in baseline alloy pricing inputs, eliminating margin anomalies.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-4 text-left">
                <span className="font-geist font-bold text-xs text-[#003B7A]">Enterprise Security</span>
                <p className="text-[11px] text-[#4B5563] mt-1">Full traceability protocols protecting corporate base metal procurement catalogs.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── SECTION 10: FINAL CTA ─── */}
      <section className="py-24 bg-[#003B7A] text-white relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.04] blueprint-grid-dark" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="text-[10px] font-extrabold tracking-widest text-[#D97706] uppercase">Get Started</span>
          <h2 className="font-geist text-4xl md:text-5xl font-black tracking-tight mt-3">
            READY TO MODERNIZE STEEL COSTING?
          </h2>
          <p className="text-white/70 text-base max-w-lg mx-auto mt-6 font-normal leading-relaxed">
            Consolidate your alloy costing workspace, pricing matrices, and reports inside the secure JSW Metal Cost Management System.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <button 
              onClick={handleLaunchWorkspace} 
              className="bg-white hover:bg-gray-100 text-[#003B7A] px-8 py-4 rounded font-bold font-geist text-sm transition-all shadow-md flex items-center gap-2"
            >
              Launch MCMS Workspace
              <ArrowRight className="size-4" />
            </button>
            <a 
              href="mailto:administrator@jsw-mcms.local" 
              className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded font-bold font-geist text-sm transition-all"
            >
              Contact Administrator
            </a>
          </div>

          <div className="mt-12 text-[10px] text-white/40 font-mono">
            JSW STEEL ENTERPRISE PLATFORM // v1.0.4 ACTIVE
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#111827] text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          
          {/* Logo Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 select-none">
              <div className="flex gap-1 items-end">
                <span className="w-1.5 h-6 bg-white" />
                <span className="w-1.5 h-4 bg-[#D97706]" />
                <span className="w-1.5 h-5 bg-gray-500" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-geist font-black text-lg leading-none tracking-tight">JSW STEEL</span>
                <span className="font-geist text-[10px] font-extrabold tracking-widest text-gray-500 uppercase">MCMS</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-normal leading-relaxed max-w-[200px]">
              JSW Steel Enterprise Industrial Costing and Grade Management platform.
            </p>
          </div>

          {/* Links Column 1: Platform */}
          <div>
            <h4 className="font-geist font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><button onClick={handleLaunchWorkspace} className="hover:text-white transition-colors">Workspace</button></li>
              <li><button onClick={() => navigate("/reports")} className="hover:text-white transition-colors">Reports</button></li>
              <li><button onClick={() => navigate("/comparison")} className="hover:text-white transition-colors">Comparison Engine</button></li>
              <li><button onClick={() => navigate("/masters")} className="hover:text-white transition-colors">Pricing Master</button></li>
            </ul>
          </div>

          {/* Links Column 2: Resources */}
          <div>
            <h4 className="font-geist font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="#workflow" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">User Guide</a></li>
            </ul>
          </div>

          {/* Links Column 3: Company */}
          <div>
            <h4 className="font-geist font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="https://www.jsw.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">JSW Steel</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-mono">
          <div>
            © {new Date().getFullYear()} JSW Metal Cost Management System. All rights reserved.
          </div>
          <div>
            Enterprise Industrial Costing Platform
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
