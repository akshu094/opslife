"use client";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { SHIFTS } from "@/lib/shifts";
import { getDayKind, ROUTINES } from "@/lib/routines";
import Dashboard from "@/components/Dashboard";
import WaterTracker from "@/components/WaterTracker";
import FitnessTracker from "@/components/FitnessTracker";
import Roadmap from "@/components/Roadmap";

export default function Home() {
  const [shift, setShift] = useLocalStorage("opslife-shift", "morning");
  const [study, setStudy] = useLocalStorage("opslife-study-done", false);

  const today = new Date();
  const kind = getDayKind(today);
  const isNight = shift === "night";
  const routine = isNight ? ROUTINES.night : ROUTINES[kind];
  const activeShift = SHIFTS.find(s => s.id === shift)!<main className="max-w-3xl mx-auto p-4 space-y-4">
      <header className="text-center py-4">
        <h1 className="text-3xl font-black">⚙️ OpsLife</h1>
        <p className="text-gray-500">
          {today.toDateString()} — {kind === "workday" ? "💼 Workday" : "🏖️ Off Day"}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {SHIFTS.map(s => (
          <button key={s.id} onClick={() => setShift(s.id)}
            className={`p-3 rounded-xl border text-sm font-semibold transition ${
              shift === s.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white hover:bg-gray-50"}`}>
            {s.label}<br /><span className="text-xs opacity-70">{s.workHours}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200">
        <h2 className="font-bold mb-2">
          {isNight ? "🌙 Night-Shift Sleep Schedule" : kind === "workday" ? "💼 Workday Routine" : "🏖️ Off-Day Routine"}
        </h2>
        <ul className="space-y-1 text-sm">
          {routine.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl p-5 bg-purple-50 border border-purple-200 text-sm">
        <h2 className="font-bold text-purple-900">😴 Sleep Window</h2>
        <p className="text-purple-700">{activeShift.sleepWindow}</p>
      </div>

      <WaterTracker />
      <FitnessTracker />

      <div className="rounded-2xl p-5 bg-orange-50 border border-orange-200">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-orange-900">
          <input type="checkbox" checked={study} onChange={e => setStudy(e.target.checked)}
            className="w-5 h-5 accent-orange-600" />
          📚 DevOps study session completed today
        </label>
      </div>

      <Dashboard />
      <Roadmap />

      <footer className="text-center text-xs text-gray-400 py-4">
        Data stored locally in your browser · Deployed on Vercel
      </footer>
    </main>
  );
}
