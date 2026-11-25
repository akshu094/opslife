"use client";
import { useLocalStorage } from "@/lib/useLocalStorage";

const STEP_GOAL = 10000;

export default function FitnessTracker() {
  const [steps, setSteps] = useLocalStorage("opslife-steps", 0);
  const [gym, setGym] = useLocalStorage("opslife-gym", false);

  const pct = Math.min(100, Math.round((steps / STEP_GOAL) * 100));

  return (
    <div className="rounded-2xl p-5 bg-green-50 border border-green-200 space-y-4">
      <h2 className="font-bold text-green-900">🏃 Fitness & Study</h2>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Steps: {steps.toLocaleString()} / 10,000</span><span>{pct}%</span>
        </div>
        <div className="h-3 bg-green-100 rounded-full">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-2 mt-2">
          {[1000, 2500].map((n) => (
            <button key={n} onClick={() => setSteps(s => Math.min(STEP_GOAL, s + n))}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg">+{n.toLocaleString()}</button>
          ))}
          <button onClick={() => setSteps(0)} className="px-3 py-1 text-sm bg-gray-200 rounded-lg">Reset</button>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={gym} onChange={e => setGym(e.target.checked)} className="w-5 h-5 accent-green-600" />
        🏋️ Gym session completed
      </label>
    </div>
  );
}

