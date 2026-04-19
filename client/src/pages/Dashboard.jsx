import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import GlassCard from "../components/GlassCard.jsx";
import { api } from "../api.js";

const COLORS = ["#A855F7", "#38BDF8", "#22D3EE", "#34D399", "#FBBF24", "#FB7185", "#94A3B8"];

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const d = await api.dashboard();
    setData(d);
    if (d.budget?.monthlyLimit) setBudgetInput(String(d.budget.monthlyLimit));
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const pieData = useMemo(() => {
    if (!data?.categoryTotalsThisMonth) return [];
    return Object.entries(data.categoryTotalsThisMonth).map(([name, value]) => ({ name, value }));
  }, [data]);

  const barData = useMemo(() => {
    if (!data?.weeklyTrend?.length) return [];
    return data.weeklyTrend.map((w) => ({ name: w.week, spend: w.amount }));
  }, [data]);

  const lineForecast = useMemo(() => {
    const p = data?.predictions;
    if (!p?.category_forecasts) return [];
    return Object.entries(p.category_forecasts).map(([name, forecast]) => ({ name, forecast }));
  }, [data]);

  async function saveBudget(e) {
    e.preventDefault();
    setError("");
    const n = Number(budgetInput);
    if (!n || n < 0) return;
    await api.saveBudget({ monthlyLimit: n });
    await load();
  }

  if (!data) {
    return <p className="text-slate-400">{error || "Loading intelligence…"}</p>;
  }

  const alert = data.budget?.budgetAlert;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Overview</p>
          <h1 className="text-3xl font-semibold text-white">Financial pulse</h1>
          <p className="text-sm text-slate-400">Live totals, budgets, and model-assisted outlook.</p>
        </div>
        {alert ? (
          <div
            className={`rounded-2xl border px-4 py-2 text-sm ${
              alert.level === "exceeded"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                : "border-amber-400/40 bg-amber-400/10 text-amber-50"
            }`}
          >
            {alert.level === "exceeded"
              ? `Budget exceeded — ${alert.percent}% of plan used.`
              : `Budget alert — ${alert.percent}% of monthly budget used.`}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard glow className="md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Balance card</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">This month</p>
              <p className="mono mt-1 text-4xl font-semibold text-white">{formatInr(data.totalThisMonth)}</p>
              <p className="mt-2 text-xs text-slate-500">
                Forecast next month:{" "}
                <span className="text-neon-cyan">
                  {data.predictions?.total_next_month != null
                    ? formatInr(data.predictions.total_next_month)
                    : "needs more history"}
                </span>
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-wide text-slate-500">Monthly budget</p>
          <form className="mt-3 space-y-3" onSubmit={saveBudget}>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-neon-purple/30 focus:ring-2"
              placeholder="₹ limit"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
            />
            <button
              type="submit"
              className="w-full rounded-xl border border-neon-blue/40 bg-neon-blue/10 py-2 text-sm font-semibold text-neon-cyan hover:bg-neon-blue/20"
            >
              Save budget
            </button>
          </form>
          {data.budget ? (
            <div className="mt-4 space-y-1 text-xs text-slate-400">
              <p>
                Spent: <span className="text-white">{formatInr(data.budget.spent)}</span>
              </p>
              <p>
                Remaining: <span className="text-emerald-300">{formatInr(data.budget.remaining)}</span>
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">Set a limit to unlock 80% / exceed alerts.</p>
          )}
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Category split</h3>
            <span className="text-xs text-slate-500">Pie</span>
          </div>
          <div className="h-72 w-full">
            {pieData.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatInr(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-24 text-center text-sm text-slate-500">Add expenses to see the chart.</p>
            )}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Weekly rhythm</h3>
            <span className="text-xs text-slate-500">Bar</span>
          </div>
          <div className="h-72 w-full">
            {barData.length ? (
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatInr(v)} />
                  <Bar dataKey="spend" fill="#38BDF8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-24 text-center text-sm text-slate-500">Weekly trend builds as you spend.</p>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Category forecasts (next month)</h3>
          <span className="text-xs text-slate-500">Line</span>
        </div>
        <div className="h-72 w-full">
          {lineForecast.length ? (
            <ResponsiveContainer>
              <LineChart data={lineForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatInr(v)} />
                <Line type="monotone" dataKey="forecast" stroke="#A855F7" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="pt-24 text-center text-sm text-slate-500">Forecasts appear after multi-month signals.</p>
          )}
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2">
        {data.insights?.map((ins, idx) => (
          <GlassCard key={idx}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{ins.type}</p>
            <h4 className="mt-1 text-lg font-semibold text-white">{ins.title}</h4>
            <p className="mt-2 text-sm text-slate-300">{ins.detail}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
