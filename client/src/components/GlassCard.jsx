export default function GlassCard({ children, className = "", glow = false }) {
  return (
    <div
      className={`glass rounded-2xl p-5 shadow-glass ${glow ? "shadow-glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
