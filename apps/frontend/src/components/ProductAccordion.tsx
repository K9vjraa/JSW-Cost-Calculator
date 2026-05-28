import { Accordion, AccordionItem, Card, CardContent, CardHeader, CardTitle, Badge } from "@jsw-mcms/ui";
import { FlaskConical, Scale, ShieldAlert, Zap } from "lucide-react";
import type { Grade } from "@/types";

interface ProductAccordionProps {
  grade: Grade | null;
}

export function ProductAccordion({ grade }: ProductAccordionProps) {

  if (!grade) {
    return (
      <Card className="border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Product Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
          <FlaskConical className="h-10 w-10 text-slate-300 animate-pulse mb-3" />
          <p className="text-xs font-semibold text-center">
            Select a metal grade to load industrial chemical & mechanical properties.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Cast JSON records safely
  const mechanical = (grade.mechanicalProperties || {}) as Record<string, string>;
  const tolerance = (grade.toleranceProperties || {}) as Record<string, string>;
  const bend = (grade.bendProperties || {}) as Record<string, string>;
  const chemical = (grade.chemicalComposition || {}) as Record<string, string>;

  const hasData = (obj: Record<string, string>) => Object.keys(obj).length > 0;

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-blue-500" /> JSW Quality Spec Sheets
          </CardTitle>
        </div>
        <Badge className="bg-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded-full text-xs">
          {grade.name}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-4 flex-1 scrollbar-thin overflow-y-auto">
        <div className="mb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Material Grade Properties:
        </div>

        <Accordion className="space-y-3">
          {/* Mechanical Properties */}
          {hasData(mechanical) && (
            <AccordionItem
              title="Mechanical Properties"
              icon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
              defaultOpen={true}
              className="border border-slate-150 bg-white"
            >
              <div className="grid gap-2">
                {Object.entries(mechanical).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-xs">
                    <span className="font-semibold text-slate-500">{key}</span>
                    <strong className="font-bold text-slate-800">{val}</strong>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}

          {/* Chemical Composition */}
          {hasData(chemical) && (
            <AccordionItem
              title="Chemical Composition"
              icon={<FlaskConical className="h-3.5 w-3.5 text-blue-500" />}
              defaultOpen={true}
              className="border border-slate-150 bg-white"
            >
              <div className="grid gap-2">
                {Object.entries(chemical).map(([key, val]) => {
                  const percent = parseFloat(val);
                  return (
                    <div key={key} className="flex flex-col gap-1.5 bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-500">{key} Content</span>
                        <strong className="font-extrabold text-blue-600">{val}</strong>
                      </div>
                      {!isNaN(percent) && (
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, percent * 5)}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionItem>
          )}

          {/* Tolerance Properties */}
          {hasData(tolerance) && (
            <AccordionItem
              title="Tolerance Properties"
              icon={<Scale className="h-3.5 w-3.5 text-emerald-500" />}
              defaultOpen={false}
              className="border border-slate-150 bg-white"
            >
              <div className="grid gap-2">
                {Object.entries(tolerance).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-xs">
                    <span className="font-semibold text-slate-500">{key}</span>
                    <strong className="font-bold text-slate-800">{val}</strong>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}

          {/* Bend Properties */}
          {hasData(bend) && (
            <AccordionItem
              title="Bend & Formability"
              icon={<ShieldAlert className="h-3.5 w-3.5 text-indigo-500" />}
              defaultOpen={false}
              className="border border-slate-150 bg-white"
            >
              <div className="grid gap-2">
                {Object.entries(bend).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-xs">
                    <span className="font-semibold text-slate-500">{key}</span>
                    <Badge className="border-indigo-150 bg-indigo-50/55 text-indigo-700 font-bold">
                      {val}
                    </Badge>
                  </div>
                ))}
              </div>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
