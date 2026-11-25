mkdir -p opslife/app opslife/components opslife/lib && cd opslife

cat > package.json << 'EOF'
{
  "name": "opslife",
  "version": "1.0.0",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },
  "dependencies": { "next": "^14.2.0", "react": "^18.3.0", "react-dom": "^18.3.0", "framer-motion": "^11.0.0" },
  "devDependencies": { "@types/node": "^20", "@types/react": "^18", "autoprefixer": "^10.4.19", "postcss": "^8.4.38", "tailwindcss": "^3.4.3", "typescript": "^5" }
}
EOF

cat > next.config.mjs << 'EOF'
export default {};
EOF

cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: {} }, plugins: [] };
export default config;
EOF

cat > postcss.config.mjs << 'EOF'
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
EOF

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true, "skipLibCheck": true, "strict": true, "noEmit": true,
    "esModuleInterop": true, "module": "esnext", "moduleResolution": "bundler",
    "resolveJsonModule": true, "isolatedModules": true, "jsx": "preserve",
    "incremental": true, "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsLife — Personal Command Centre",
  description: "Shift routines, hydration, fitness, study and DevOps roadmap tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
EOF

cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat > lib/shifts.ts << 'EOF'
export type ShiftType = "morning" | "evening" | "night";

export interface Shift {
  id: ShiftType;
  label: string;
  workHours: string;
  sleepWindow: string;
}

export const SHIFTS: Shift[] = [
  { id: "morning", label: "☀️ Morning Shift", workHours: "07:00 – 15:00", sleepWindow: "22:30 – 06:00" },
  { id: "evening", label: "🌇 Evening Shift", workHours: "15:00 – 23:00", sleepWindow: "00:30 – 08:30" },
  { id: "night",   label: "🌙 Night Shift",   workHours: "23:00 – 07:00", sleepWindow: "08:00 – 15:00" },
];
EOF

cat > lib/routines.ts << 'EOF'
export type DayKind = "workday" | "offday";

export function getDayKind(date: Date): DayKind {
  const d = date.getDay();
  return d === 5 || d === 6 ? "offday" : "workday";
}

export const ROUTINES = {
  workday: [
    "🛏️ Wake up & hydrate (500ml)",
    "🏋️ Gym session (45 min)",
    "💼 Work shift",
    "📚 DevOps study (1 hr)",
    "😴 Wind down & sleep on schedule",
  ],
  offday: [
    "🛌 Relaxed wake-up",
    "🚶 10,000 steps walk",
    "🧹 Life admin / meal prep",
    "📚 DevOps deep-dive (2 hrs)",
    "🎬 Recovery & recharge",
  ],
  night: [
    "🌙 Post-shift wind-down",
    "😴 Sleep block (dark room, blackout)",
    "☕ Wake, light meal",
    "📚 Study before shift",
    "💼 Night shift",
  ],
};
EOF

cat > lib/useLocalStorage.ts << 'EOF'
"use client";
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored));
    } catch {}
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
EOF

cat > lib/roadmap.ts << 'EOF'
export const ROADMAP = [
  { month: 1, title: "Linux & Networking", topics: ["Bash scripting", "File systems", "TCP/IP, DNS, SSH"] },
  { month: 2, title: "Git & CI/CD Basics", topics: ["Git workflows", "GitHub Actions", "Pipeline design"] },
  { month: 3, title: "Containers", topics: ["Docker deep-dive", "Docker Compose", "Registry management"] },
  { month: 4, title: "Orchestration", topics: ["Kubernetes fundamentals", "Helm", "K8s networking"] },
  { month: 5, title: "IaC & Cloud", topics: ["Terraform", "AWS/GCP core services", "Cloud networking"] },
  { month: 6, title: "Observability & Security", topics: ["Prometheus/Grafana", "DevSecOps", "SRE practices"] },
];
EOF

cat > components/WaterTracker.tsx << 'EOF'
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/lib/useLocalStorage";

const GOAL = 8;

export default function WaterTracker() {
  const [glasses, setGlasses] = useLocalStorage("opslife-water", 0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setPulse(true), 45 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`rounded-2xl p-5 bg-blue-50 border border-blue-200 ${pulse ? "animate-bounce" : ""}`}>
      <h2 className="font-bold text-blue-900 mb-3">💧 Hydration — {glasses}/{GOAL} glasses</h2>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: GOAL }).map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.8 }}
            onClick={() => setGlasses(i + 1 === glasses ? i : i + 1)}
            className="w-9 h-12 rounded-b-xl rounded-t-md border-2 border-blue-400 overflow-hidden relative"
            aria-label={`Glass ${i + 1}`}
          >
            {i < glasses && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                className="absolute bottom-0 w-full bg-blue-400/70"
              />
            )}
          </motion.button>
        ))}
      </div>
      <button onClick={() => setPulse(false)} className="text-xs mt-2 text-blue-600 underline">
        Dismiss reminder
      </button>
    </div>
  );
}
EOF

cat > components/FitnessTracker.tsx << 'EOF'
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
EOF

cat > components/Dashboard.tsx << 'EOF'
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
EOF

cat > components/Roadmap.tsx << 'EOF'
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
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
EOF

cat > app/page.tsx << 'EOF'
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
EOF

cat > README.md << 'EOF'
# OpsLife — Personal Command Centre

## Local setup
npm install
npm run dev    # http://localhost:3000

## Deploy to Vercel
1. Push this folder to a GitHub repo
2. vercel.com → Add New Project → Import the repo
3. Framework preset: Next.js (auto-detected) → Deploy
EOF

cd ..
zip -r opslife.zip opslife -x "opslife/node_modules/*"
echo "✅ Done — opslife.zip created"

