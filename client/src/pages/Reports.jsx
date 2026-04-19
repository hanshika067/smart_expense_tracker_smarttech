import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import GlassCard from "../components/GlassCard.jsx";
import { api } from "../api.js";

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function Reports() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.categoryReport().then(setReport).catch(() => setReport(null));
  }, []);

  const chartData = report
    ? Object.entries(report.totals || {}).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Reports</p>
        <h1 className="text-3xl font-semibold text-white">Category intelligence</h1>
        <p className="text-sm text-slate-400">Where money flows this month.</p>
      </div>
      <GlassCard glow>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Top category</p>
            <p className="text-2xl font-semibold text-white">
              {report?.topCategory ? report.topCategory.name : "—"}
            </p>
            <p className="text-sm text-neon-cyan">
              {report?.topCategory ? formatInr(report.topCategory.amount) : "Add data to rank categories"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
            Neo-banking clarity: focus trims on the top 1–2 buckets for fastest savings.
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="text-sm font-semibold text-white">Category totals</h3>
        <div className="mt-4 h-80 w-full">
          {chartData.length ? (
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip formatter={(v) => formatInr(v)} />
                <Bar dataKey="value" fill="#22D3EE" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="pt-28 text-center text-sm text-slate-500">No category data for this month yet.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
