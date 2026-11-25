"use client";
import { ROADMAP } from "@/lib/roadmap";
import { useLocalStorage } from "@/lib/useLocalStorage";

export default function Roadmap() {
  const [done, setDone] = useLocalStorage<Record<string, boolean>>("opslife-roadmap", {});

  return (
    <div className="rounded-2xl p-5 bg-slate-800 text-white">
      <h2 className="font-bold text-lg mb-3">🗺️ Six-Month DevOps Roadmap</h2>
      <div className="space-y-3">
        {ROADMAP.map(m => (
          <details key={m.month} className="rounded-xl bg-slate-700 p-3">
            <summary className="font-semibold cursor-pointer">
              {done[`month-${m.month}`] ? "✅" : "◻️"} Month {m.month}: {m.title}
            </summary>
            <ul className="mt-2 space-y-1 text-sm text-slate-200">
              {m.topics.map(t => (
                <li key={t}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!done[`m.month−{m.month}-m.month−{t}`]}
                      onChange={e => setDone(d => ({ ...d, [`m.month−{m.month}-m.month−{t}`]: e.target.checked }))}
                      className="accent-emerald-500" />
                    {t}
                  </label>



.                  </label>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
