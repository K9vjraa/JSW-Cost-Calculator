import * as React from "react";
import { cn, inr } from "../utils";
import { Calculator, AlertTriangle } from "lucide-react";
import { Card } from "./Card";

export interface CalculationLine {
  label: string;
  value: string | number;
  isCurrency?: boolean;
  type?: "addition" | "subtraction" | "multiplication" | "division" | "constant";
  description?: string;
}

export interface CalculationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  formula?: string;
  lines: CalculationLine[];
  finalResult: string | number;
  finalLabel?: string;
  finalIsCurrency?: boolean;
  alertText?: string;
}

export function CalculationCard({
  title,
  formula,
  lines,
  finalResult,
  finalLabel = "Calculated Total",
  finalIsCurrency = true,
  alertText,
  className,
  ...props
}: CalculationCardProps) {
  const getSymbol = (type?: CalculationLine["type"]) => {
    switch (type) {
      case "addition":
        return "+";
      case "subtraction":
        return "-";
      case "multiplication":
        return "×";
      case "division":
        return "÷";
      default:
        return null;
    }
  };

  const formatVal = (val: string | number, isCurrency?: boolean) => {
    if (isCurrency) {
      return inr(val);
    }
    return typeof val === "number" ? val.toLocaleString("en-IN", { maximumFractionDigits: 4 }) : val;
  };

  return (
    <Card className={cn("p-5 flex flex-col gap-4 text-left shadow-xs border-[#d6dfeb] bg-white", className)} {...props}>
      {/* Title Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 select-none">
        <div className="text-[#0057b8] flex items-center justify-center p-1.5 bg-[#edf5ff] rounded-lg size-8 shrink-0">
          <Calculator className="size-4" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#10233d] m-0">
            {title}
          </h4>
          {formula && (
            <code className="text-[9px] font-mono text-[#56657a] bg-slate-50 px-1 rounded border border-slate-100 w-fit">
              {formula}
            </code>
          )}
        </div>
      </div>

      {/* Itemized Calculation Lines */}
      <div className="flex flex-col gap-2.5">
        {lines.map((line, idx) => {
          const symbol = getSymbol(line.type);
          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#10233d] gap-4">
                <div className="flex items-center gap-1.5">
                  {symbol && (
                    <span className="text-[11px] size-4.5 flex items-center justify-center bg-slate-100 text-[#56657a] border border-[#d6dfeb]/60 rounded font-black">
                      {symbol}
                    </span>
                  )}
                  <span className="text-[#56657a] font-semibold">{line.label}</span>
                </div>
                <span>{formatVal(line.value, line.isCurrency)}</span>
              </div>
              {line.description && (
                <span className="text-[9px] text-slate-400 font-medium pl-6 leading-relaxed">
                  {line.description}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Final computed metric results block */}
      <div className="mt-2.5 p-4 rounded-xl bg-[#edf5ff]/60 border border-[#bfd6f5] flex items-center justify-between gap-4">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#063d83]">
          {finalLabel}
        </span>
        <span className="text-lg font-black text-[#032f67] tracking-tight">
          {formatVal(finalResult, finalIsCurrency)}
        </span>
      </div>

      {/* Optional warnings/alerts */}
      {alertText && (
        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-[#fef5ec] border border-[#fdd9b5] text-[10px] text-[#f2994a] font-bold">
          <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{alertText}</span>
        </div>
      )}
    </Card>
  );
}
