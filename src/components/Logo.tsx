export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round">
        {/* figura correndo estilizada */}
        <circle cx="15" cy="4.6" r="1.8" fill="#0f172a" stroke="none" />
        <path d="M13.2 8.2l-2.6 3.4 3 1.8 1.2 4.4" />
        <path d="M10.6 11.6L7.4 13l-1.8 3.6" />
        <path d="M13.6 13.4l3.2.6c.6 1.6-.2 3.4-.2 3.4" />
        <path d="M4 6.4h4.4" opacity=".55" />
        <path d="M3 9.2h3.4" opacity=".35" />
      </svg>
    </div>
  );
}
