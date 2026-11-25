export type DayKind = "workday" | "offday";

export function getDayKind(date: Date): DayKind {
  const d = date.getDay();
  // 0 = Sunday, 5 = Friday, 6 = Saturday
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

