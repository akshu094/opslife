'use client';
import { useEffect, useState } from 'react';
import { dateKey } from './schedule';

const KEY = 'opslife:v1';

export const defaults = () => ({
  settings: {
    defaultShift: 'morning', months: {}, gymDays: [0, 2, 3, 5, 6],
    waterGoal: 4000, glass: 250, stepGoal: 10000, studyWork: 90, studyOff: 180,
    reminders: true, interval: 60, roadmapStart: dateKey(new Date()),
  },
  logs: {},
  roadmap: {},
});

export const emptyLog = { water: 0, steps: 0, study: 0, gym: false, note: '', lastDrink: null, done: {} };

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const num = (v, d, min, max) => (Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d);
const shiftId = (v) => ['morning', 'afternoon', 'night'].includes(v);

// Accepts stored or imported data and repairs anything invalid.
export function sanitize(raw) {
  const base = defaults();
  if (!isObj(raw)) return base;
  const s = isObj(raw.settings) ? raw.settings : {};
  const d = base.settings;
  const settings = {
    defaultShift: shiftId(s.defaultShift) ? s.defaultShift : d.defaultShift,
    months: Object.fromEntries(Object.entries(isObj(s.months) ? s.months : {}).filter(([, v]) => shiftId(v))),
    gymDays: Array.isArray(s.gymDays) ? s.gymDays.filter((n) => Number.isInteger(n) && n >= 0 && n <= 6) : d.gymDays,
    waterGoal: num(s.waterGoal, d.waterGoal, 500, 8000),
    glass: num(s.glass, d.glass, 50, 1000),
    stepGoal: num(s.stepGoal, d.stepGoal, 1000, 50000),
    studyWork: num(s.studyWork, d.studyWork, 15, 600),
    studyOff: num(s.studyOff, d.studyOff, 15, 600),
    reminders: typeof s.reminders === 'boolean' ? s.reminders : d.reminders,
    interval: num(s.interval, d.interval, 15, 240),
    roadmapStart: /^\d{4}-\d{2}-\d{2}$/.test(s.roadmapStart) ? s.roadmapStart : d.roadmapStart,
  };
  const logs = {};
  for (const [k, v] of Object.entries(isObj(raw.logs) ? raw.logs : {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !isObj(v)) continue;
    logs[k] = {
      water: num(v.water, 0, 0, 20000), steps: num(v.steps, 0, 0, 100000), study: num(v.study, 0, 0, 1440),
      gym: v.gym === true, note: typeof v.note === 'string' ? v.note : '',
      lastDrink: Number.isFinite(v.lastDrink) ? v.lastDrink : null, done: isObj(v.done) ? v.done : {},
    };
  }
  return { settings, logs, roadmap: isObj(raw.roadmap) ? raw.roadmap : {} };
}

export function useStore() {
  const [data, setData] = useState(null);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let stored = null;
    try { stored = JSON.parse(window.localStorage.getItem(KEY)); } catch {}
    setData(sanitize(stored));
    const sync = (e) => {
      if (e.key !== KEY) return;
      try { setData(sanitize(JSON.parse(e.newValue))); } catch {}
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Save inside the update so other tabs are not echoed back and forth.
  const update = (fn) => setData((old) => {
    const next = fn(old);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      queueMicrotask(() => setSaveError(false));
    } catch {
      queueMicrotask(() => setSaveError(true));
    }
    return next;
  });

  return [data, update, saveError];
}
