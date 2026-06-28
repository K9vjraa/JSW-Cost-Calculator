import { useState, useMemo, memo } from "react";
import { MoreVertical, Loader2 } from "lucide-react";
import { cn } from "@/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export interface GradeHierarchyTreeProps {
  grades?: any[];
  isLoading?: boolean;
}

export const GradeHierarchyTree = memo(function GradeHierarchyTree({ grades = [], isLoading = false }: GradeHierarchyTreeProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const treeData = useMemo(() => {
    if (!grades || grades.length === 0) return [];

    const grouped: Record<string, { id: string, title: string, count: number, children: any[] }> = {};

    grades.forEach(g => {
      const metalName = g.metal?.name || 'Uncategorized';
      const metalId = g.metalId || g.metal?.id || 'uncategorized';

      if (!grouped[metalId]) {
        grouped[metalId] = {
          id: metalId,
          title: metalName,
          count: 0,
          children: []
        };
      }

      grouped[metalId].count += 1;
      grouped[metalId].children.push({
        id: g.id,
        title: g.name,
        subgrade: g.subgrade || g.description || "Standard",
        count: 1
      });
    });

    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [grades]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col h-[calc(100vh-16rem)] min-h-[500px] sticky top-6 overflow-hidden">
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <h3 className="font-bold text-xs tracking-tight text-slate-800 uppercase">Grade Hierarchy</h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <MoreVertical className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin relative bg-[#fafbfd]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : treeData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400 font-medium">
            No grade data available
          </div>
        ) : (
          <Accordion type="multiple" className="flex flex-col gap-2.5">
            {treeData.map((node) => (
              <AccordionItem key={node.id} value={node.id} className="border-none rounded-sm bg-white shadow-sm overflow-hidden">
                <AccordionTrigger className="px-3 py-2.5 hover:bg-slate-50 transition-colors border border-slate-200 rounded-sm data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                  <div className="flex items-center justify-between w-full pr-2">
                    <span className="text-xs font-bold text-slate-800">{node.title}</span>
                    <div className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#0b5cbf]/10 text-[#0b5cbf]">
                      {node.count}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0 border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
                  <div className="flex flex-col divide-y divide-slate-100 bg-white">
                    {node.children.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => setActiveNode(child.id)}
                        className={cn(
                          "flex flex-col py-2 px-3 cursor-pointer transition-colors hover:bg-slate-50",
                          activeNode === child.id ? "bg-[#eef5ff] border-l-2 border-l-[#0b5cbf]" : "border-l-2 border-l-transparent"
                        )}
                      >
                        <span className="text-xs font-semibold text-slate-800">{child.title}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 truncate">{child.subgrade}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
});
