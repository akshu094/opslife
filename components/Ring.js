export default function Ring({ ratio, label, size = 130, color = 'var(--accent)' }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`${label} complete`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, ratio))} transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset .6s' }} opacity={ratio > 0 ? 1 : 0} />
      <text x="60" y="68" textAnchor="middle" className="ringtext">{label}</text>
    </svg>
  );
}
