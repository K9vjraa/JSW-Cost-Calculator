import { GitCompareArrows, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHead } from "@/components/ui/table";
import { grades } from "@/data/fixtures";
import { inr } from "@/utils";
import type { Grade } from "@/types";

const propertyGroups: Array<[string, keyof Grade]> = [["Mechanical Properties", "mechanicalProperties"], ["Tolerance Properties", "toleranceProperties"], ["Bend Properties", "bendProperties"], ["Chemical Composition", "chemicalComposition"]];

export function ComparisonPage() {
  const [selected, setSelected] = useState(grades.map((grade) => grade.id));
  const [query, setQuery] = useState("");
  const chosen = useMemo(() => grades.filter((grade) => selected.includes(grade.id) && `${grade.name} ${grade.metal?.name}`.toLowerCase().includes(query.toLowerCase())), [query, selected]);
  return <div className="flex flex-col gap-4">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-[var(--primary)]">One click product info table</p><h2 className="text-2xl font-bold">Comparison Table / Multi Metal Comparison</h2></div><label className="relative min-w-[260px]"><Search className="absolute left-3 top-3 size-4 text-[var(--muted-foreground)]" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter grades..." /></label></header>
    <div className="grid gap-3 xl:grid-cols-3">{grades.map((grade, index) => <Card key={grade.id} className={selected.includes(grade.id) ? "ring-2 ring-[var(--primary)]" : ""}><CardHeader><CardTitle className="flex items-center justify-between">{index + 1}. {grade.name}<input type="checkbox" checked={selected.includes(grade.id)} onChange={() => setSelected((current) => current.includes(grade.id) ? current.filter((id) => id !== grade.id) : [...current, grade.id])} /></CardTitle></CardHeader><CardContent className="grid gap-2 text-sm"><p><strong>Type:</strong> {grade.metal?.category}</p><p><strong>Price/kg:</strong> {inr(grade.name === "SS316" ? 22 : grade.name === "SS304" ? 20 : 25)}</p><Badge className="w-fit border-[#bde4cf] bg-[#e8fbf0] text-[#087443]">In Stock</Badge><div><span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Comparison indicator</span><div className="mt-1 h-3 overflow-hidden rounded bg-[#e6edf7]"><div className="h-full bg-[var(--primary)]" style={{ width: `${60 + index * 10}%` }} /></div></div><Button variant="outline" size="sm"><GitCompareArrows />Open Info</Button></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Product Info Section</CardTitle></CardHeader><CardContent className="max-h-[720px] overflow-auto p-0"><Table className="min-w-[760px]"><thead className="sticky top-0 z-10"><tr><TableHead className="w-56">Properties</TableHead>{chosen.map((grade) => <TableHead key={grade.id}>{grade.name}</TableHead>)}</tr></thead><tbody><tr><TableCell className="font-semibold">Product Info</TableCell>{chosen.map((grade) => <TableCell key={grade.id}><strong className="block">{grade.metal?.name}</strong><span>{grade.metal?.category}</span></TableCell>)}</tr>{propertyGroups.map(([title, key]) => <tr key={title}><TableCell className="font-semibold">{title}</TableCell>{chosen.map((grade) => <TableCell key={grade.id} className="bg-white"><PropertyLines rows={grade[key] as Record<string, string>} chosen={chosen} group={key} /></TableCell>)}</tr>)}</tbody></Table></CardContent></Card>
    <div className="grid gap-2 rounded-lg border border-dashed bg-white p-4 text-sm md:grid-cols-4"><Step title="Select Metals" /><Step title="Open Info Table" /><Step title="Compare" /><Step title="Take Decision" /></div>
  </div>;
}
function PropertyLines({ rows, chosen, group }: { rows: Record<string, string>; chosen: Grade[]; group: keyof Grade }) {
  return <dl className="grid gap-1">{Object.entries(rows).map(([name, value]) => { const differs = chosen.some((grade) => (grade[group] as Record<string, string>)[name] !== value); return <div key={name} className={differs ? "rounded bg-[#fff3df] px-2 py-1" : ""}><dt className="text-xs text-[var(--muted-foreground)]">{name}</dt><dd className="font-semibold">{value}</dd></div>; })}</dl>;
}
function Step({ title }: { title: string }) {
  return <div className="rounded-md border bg-[#f7faff] p-3 font-semibold">{title}</div>;
}
