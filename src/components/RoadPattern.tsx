const GOLD = "#c9a84c";

export default function RoadPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="rp-fade" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.55" />
            <stop offset="40%" stopColor={GOLD} stopOpacity="0.22" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rp-edge" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.3" />
            <stop offset="55%" stopColor={GOLD} stopOpacity="0.09" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="rp-horizon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.20" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="200" cy="248" rx="150" ry="52" fill="url(#rp-horizon)" />

        <path d="M-40 700 L188 250" stroke="url(#rp-edge)" strokeWidth="2" />
        <path d="M440 700 L212 250" stroke="url(#rp-edge)" strokeWidth="2" />

        <g stroke="url(#rp-fade)" strokeLinecap="round">
          <path d="M200 700 L200 612" strokeWidth="7" />
          <path d="M200 578 L200 508" strokeWidth="5.6" />
          <path d="M200 480 L200 424" strokeWidth="4.5" />
          <path d="M200 402 L200 356" strokeWidth="3.6" />
          <path d="M200 339 L200 302" strokeWidth="2.9" />
          <path d="M200 289 L200 260" strokeWidth="2.2" />
        </g>
      </svg>
    </div>
  );
}
