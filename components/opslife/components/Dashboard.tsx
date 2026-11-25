"use client";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useMemo } from "react";

export default function Dashboard() {
  const [water] = useLocalStorage("opslife-water", 0);
  const [steps] = useLocalStorage("opslife-steps", 0);
  const [gym] = useLocalStorage("opslife-gym", false);
  const [study] = useLocalStorage("opslife-study-done", false);

  const items = [
    { label: "💧 Hydration", done: water >= 8 },
    { label: "🚶 10K Steps", done: steps >= 10000 },
    { label: "🏋️ Gym", done: gym },
    { label: "📚 Study", done: study },
  ];
  const score = useMemo(() => Math.round((items.filter(i => i.done).length / items.length) * 100), [items]);

  return (
    <div className="rounded-2xl p-5 bg-indigo-600 text-white">
      <h2 className="font-bold text-lg">Today&apos;s Completion</h2>
      <div className="text-4xl font-extrabold mt-2">{score}%</div>
      <div className="mt-3 flex gap-2 flex-wrap">
        {items.map(i => (
          <span key={i.label} className={`px-3 py-1 rounded-full text-sm ${i.done ? "bg-white text-indigo-700" : "bg-white/20"}`}>
            {i.done ? "✅" : "⬜"} {i.label}
          </span>
        ))}
      </div>
    </div>
  );
}
