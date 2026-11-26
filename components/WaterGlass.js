export default function WaterGlass({ ratio }) {
  const level = 190 - Math.min(1, ratio) * 170;
  return (
    <svg className="glass" viewBox="0 0 140 200" role="img" aria-label={`Water glass ${Math.round(ratio * 100)}% full`}>
      <defs><clipPath id="cup"><path d="M12 8H128L114 182Q113 192 102 192H38Q27 192 26 182Z" /></clipPath></defs>
      <g clipPath="url(#cup)">
        <g className="level" style={{ transform: `translateY(${level}px)`, opacity: ratio > 0 ? 1 : 0 }}>
          <path className="wave back" d="M-140 4q35-12 70 0t70 0 70 0 70 0 70 0V220H-140Z" />
          <path className="wave" d="M-140 6q35 11 70 0t70 0 70 0 70 0 70 0V220H-140Z" />
          {[45, 78, 98].map((x, i) => <circle key={x} className="bubble" cx={x} cy="150" r={3 + i} style={{ animationDelay: `${i * 0.9}s` }} />)}
        </g>
      </g>
      <path className="outline" d="M12 8H128L114 182Q113 192 102 192H38Q27 192 26 182Z" />
      <text x="70" y="108" textAnchor="middle" className="glasstext">{Math.round(ratio * 100)}%</text>
    </svg>
  );
}
