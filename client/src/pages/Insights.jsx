import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import { api } from "../api.js";

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const severityStyle = {
  info: "border-neon-blue/30 bg-neon-blue/5",
  warning: "border-amber-400/40 bg-amber-400/5",
  success: "border-emerald-400/40 bg-emerald-400/5",
};

export default function Insights() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.dashboard().then(setData);
  }, []);

  if (!data) return <p className="text-slate-400">Synthesizing insights…</p>;

  const preds = data.predictions?.category_forecasts || {};

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">AI desk</p>
        <h1 className="text-3xl font-semibold text-white">Insights & forecasts</h1>
        <p className="text-sm text-slate-400">Rule engine + ML trends, refreshed with your ledger.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard glow>
          <p className="text-xs uppercase tracking-wide text-slate-500">Next month (total)</p>
          <p className="mt-2 text-4xl font-semibold text-white">
            {data.predictions?.total_next_month != null
              ? formatInr(data.predictions.total_next_month)
              : "Not enough signal"}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-slate-500">Saving nudges</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• Cap discretionary categories at 70% of their 3‑month average.</li>
            <li>• Split weekend budgets to avoid surprise spikes.</li>
            <li>• Re-run forecasts after weekly imports for tighter accuracy.</li>
          </ul>
        </GlassCard>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Category predictions</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.keys(preds).length === 0 ? (
            <GlassCard>
              <p className="text-sm text-slate-500">Forecasts unlock after a few months of categorized spend.</p>
            </GlassCard>
          ) : (
            Object.entries(preds).map(([cat, val]) => (
              <GlassCard key={cat}>
                <p className="text-xs uppercase tracking-wide text-slate-500">{cat}</p>
                <p className="mt-1 text-xl font-semibold text-white">{formatInr(val)}</p>
                <p className="text-xs text-slate-500">Projected next month</p>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Live insight cards</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {data.insights?.map((ins, idx) => (
            <div key={idx} className={`rounded-2xl border p-4 ${severityStyle[ins.severity] || severityStyle.info}`}>
              <p className="text-xs uppercase tracking-wide text-slate-500">{ins.type}</p>
              <h4 className="mt-1 text-lg font-semibold text-white">{ins.title}</h4>
              <p className="mt-2 text-sm text-slate-200">{ins.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
