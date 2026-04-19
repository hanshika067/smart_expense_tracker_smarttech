import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GlassCard from "../components/GlassCard.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      nav("/", { replace: true });
    } catch (err) {
      setError(err.body?.error || err.message || "Could not sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid-fade px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">Create your vault</h1>
          <p className="text-sm text-slate-400">Neo-banking grade expense intelligence.</p>
        </div>
        <GlassCard glow>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-neon-blue/30 focus:ring-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-neon-blue/30 focus:ring-2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-neon-blue/30 focus:ring-2"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
        </GlassCard>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="text-neon-cyan hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
