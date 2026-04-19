import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-white/10 text-white shadow-glow border border-white/10"
      : "text-slate-400 hover:text-white hover:bg-white/5"
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-grid-fade text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue shadow-glow">
              <span className="text-lg">◎</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Smart Expense</p>
              <p className="text-sm font-semibold text-white">AI Command Center</p>
            </div>
          </div>
          <nav className="hidden flex-wrap items-center gap-1 md:flex">
            <NavLink to="/" className={linkClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/add" className={linkClass}>
              Add
            </NavLink>
            <NavLink to="/reports" className={linkClass}>
              Reports
            </NavLink>
            <NavLink to="/insights" className={linkClass}>
              AI Insights
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-500">Signed in</p>
              <p className="text-sm font-medium text-white">{user?.name}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-neon-cyan/40 hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 md:hidden">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/add" className={linkClass}>
            Add
          </NavLink>
          <NavLink to="/reports" className={linkClass}>
            Reports
          </NavLink>
          <NavLink to="/insights" className={linkClass}>
            AI
          </NavLink>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
