import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import { api } from "../api.js";

const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Other"];

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function AddExpense() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function refresh() {
    const data = await api.listExpenses();
    setItems(data);
  }

  useEffect(() => {
    refresh().catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      if (editingId) {
        await api.updateExpense(editingId, {
          amount: Number(amount),
          category,
          date,
          description,
        });
        setEditingId(null);
        setMsg("Expense updated.");
      } else {
        await api.createExpense({
          amount: Number(amount),
          date,
          description,
        });
      }
      setAmount("");
      setDescription("");
      await refresh();
    } catch (err) {
      setMsg(err.body?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(row) {
    setEditingId(row._id);
    setAmount(String(row.amount));
    setCategory(row.category);
    setDate(new Date(row.date).toISOString().slice(0, 10));
    setDescription(row.description || "");
    setMsg("");
  }

  function cancelEdit() {
    setEditingId(null);
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setMsg("");
  }

  async function remove(id) {
    await api.deleteExpense(id);
    await refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard glow>
        <h2 className="text-lg font-semibold text-white">{editingId ? "Edit expense" : "New expense"}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {editingId
            ? "Adjust fields and save."
            : "Add amount and a short description — we pick the category for you."}
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount (₹)</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-neon-purple/30 focus:ring-2"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          {editingId ? (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-neon-purple/30 focus:ring-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-neon-purple/30 focus:ring-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
            <textarea
              className="mt-1 min-h-[88px] w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-neon-purple/30 focus:ring-2"
              placeholder="e.g. Swiggy dinner, Uber to airport…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {msg ? <p className="text-sm text-neon-cyan">{msg}</p> : null}
          <div className="flex gap-2">
            {editingId ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="w-1/3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-slate-200"
              >
                Cancel
              </button>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className={`rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60 ${
                editingId ? "w-2/3" : "w-full"
              }`}
            >
              {loading ? "Saving…" : editingId ? "Update" : "Save expense"}
            </button>
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold text-white">Recent activity</h3>
        <p className="text-sm text-slate-500">Last 50 entries</p>
        <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No expenses yet.</p>
          ) : (
            items.map((x) => (
              <div
                key={x._id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-white">{x.description || "No description"}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(x.date).toLocaleDateString("en-IN")} · {x.category}
                    {x.classifiedByMl ? (
                      <span className="ml-2 rounded-full bg-neon-blue/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neon-cyan">
                        AI
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="mono text-sm text-white">{formatInr(x.amount)}</span>
                  <button
                    type="button"
                    className="text-xs text-neon-cyan hover:text-white"
                    onClick={() => startEdit(x)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-xs text-rose-300 hover:text-rose-200"
                    onClick={() => remove(x._id).catch(() => {})}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
