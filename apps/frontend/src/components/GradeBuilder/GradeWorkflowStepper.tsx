import { FileText, Database, PieChart, Send, CheckCircle2 } from "lucide-react";

interface GradeWorkflowStepperProps {
  currentStep: number;
  isSubmitted: boolean;
}

export function GradeWorkflowStepper({ currentStep, isSubmitted }: GradeWorkflowStepperProps) {
  const steps = [
    {
      id: 1,
      title: "Grade Details",
      icon: FileText,
      description: "Enter name & code",
    },
    {
      id: 2,
      title: "Add Materials",
      icon: Database,
      description: "Select from approved",
    },
    {
      id: 3,
      title: "Composition",
      icon: PieChart,
      description: "Must equal 100%",
    },
    {
      id: 4,
      title: "Submit",
      icon: Send,
      description: "Finalize draft",
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto relative z-10">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id || isSubmitted;
          const isPending = currentStep < step.id && !isSubmitted;
          
          const Icon = isCompleted ? CheckCircle2 : step.icon;

          return (
            <div key={step.id} className="flex items-center gap-3 flex-1">
              {/* Step indicator */}
              <div
                className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : isActive
                    ? "bg-primary border-primary text-white shadow-[0_0_12px_rgba(25,118,210,0.4)] ring-4 ring-primary/10"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive && !isCompleted ? "animate-pulse" : ""}`} />
              </div>
              
              {/* Step Text */}
              <div className="flex flex-col">
                <span
                  className={`text-[11px] font-black uppercase tracking-wider ${
                    isActive ? "text-primary" : isCompleted ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
                <span
                  className={`text-[9px] font-medium leading-tight ${
                    isActive ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {step.description}
                </span>
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 ml-3 flex items-center">
                  <div
                    className={`h-0.5 w-full rounded-full transition-all duration-500 ${
                      isCompleted ? "bg-emerald-500" : "bg-slate-100"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
