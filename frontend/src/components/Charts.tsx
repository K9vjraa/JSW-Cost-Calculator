import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import type { SeriesPoint } from "@/types";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { boxWidth: 10, color: "#56657a" } } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: "#e7edf5" }, ticks: { color: "#56657a" } } }
};

export function CalculationLine({ points }: { points: SeriesPoint[] }) {
  return <div className="h-56"><Line options={options} data={{ labels: points.map((point) => point.label), datasets: [{ label: "Calculations", data: points.map((point) => point.count), borderColor: "#0057b8", backgroundColor: "rgba(0,87,184,.15)", fill: true, tension: 0.32, pointRadius: 3 }] }} /></div>;
}

export function CostBars({ points }: { points: SeriesPoint[] }) {
  return <div className="h-48"><Bar options={options} data={{ labels: points.map((point) => point.label), datasets: [{ label: "Cost Trend", data: points.map((point) => point.cost), backgroundColor: "#0057b8", borderRadius: 5 }, { label: "Previous", data: points.map((point) => point.cost * 0.82), backgroundColor: "#9fbce4", borderRadius: 5 }] }} /></div>;
}

export function DoughnutMetric({ rows, center }: { rows: { name: string; value: number }[]; center: string }) {
  return (
    <div className="relative h-52">
      <Doughnut options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { boxWidth: 10 } } } }} data={{ labels: rows.map((row) => row.name), datasets: [{ data: rows.map((row) => row.value), backgroundColor: ["#0057b8", "#103c74", "#8fb2de", "#d63031", "#cad8ea"], borderColor: "#fff" }] }} />
      <div className="pointer-events-none absolute left-[32%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"><strong className="block text-xl">{center}</strong><span className="text-xs text-[var(--muted-foreground)]">Total</span></div>
    </div>
  );
}
