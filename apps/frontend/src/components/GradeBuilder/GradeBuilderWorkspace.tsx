import { GradeLibrarySidebar } from "./GradeLibrarySidebar";
import { GradeEditor } from "./GradeEditor";
import { GradeLiveSummary } from "./GradeLiveSummary";
import { ErrorBoundary } from "react-error-boundary";
import { AlertCircle } from "lucide-react";
import { useGradeBuilderStore } from "../../store/gradeBuilderStore";

import { Drawer } from "@jsw-mcms/ui";

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-red-50 text-red-900 p-6 rounded-md">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
      <pre className="text-xs bg-red-100 p-4 rounded-md mb-4 max-w-xl overflow-auto border border-red-200">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

export function GradeBuilderWorkspace() {
  const { isSidebarOpen, toggleSidebar } = useGradeBuilderStore();

  return (
    <div
      className="animate-fade-in overflow-hidden bg-slate-100 rounded-md"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(250px, 18%)",
        gap: "clamp(8px, 1vw, 12px)",
        height: "100%",
        minHeight: 0,
        padding: "clamp(8px, 1vw, 12px)"
      }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Drawer
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          title="Grade Library"
          subtitle="Select or create a new grade"
          side="left"
        >
          <GradeLibrarySidebar />
        </Drawer>
        
        <GradeEditor />
        <GradeLiveSummary />
      </ErrorBoundary>
    </div>
  );
}
