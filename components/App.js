'use client';
import { useEffect, useState } from 'react';
import { useStore, emptyLog } from '@/lib/store';
import { currentDay, addDays, parseKey, SHIFTS, fmt } from '@/lib/schedule';
import { dayProgress } from '@/lib/score';
import Dashboard from './Dashboard';
import Routine from './Routine';
import Trackers from './Trackers';
import Roadmap from './Roadmap';
import Settings from './Settings';
import useReminder from './useReminder';

const TABS = [['today', 'Dashboard'], ['routine', 'Routine'], ['track', 'Trackers'], ['roadmap', 'Roadmap'], ['settings', 'Settings']];

export const longDate = (k) => parseKey(k).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function App() {
  const [data, update, saveError] = useStore();
  const [now, setNow] = useState(null);
  const [tab, setTab] = useState('today');
  const [picked, setPicked] = useState(null); // null follows the current day

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 15000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, []);

  const current = data && now ? currentDay(now, data.settings) : null;

  // Changes to one day's log.
  const setLog = (key, fn) => update((d) => {
    const log = { ...emptyLog, ...d.logs[key] };
    return { ...d, logs: { ...d.logs, [key]: { ...log, ...fn(log) } } };
  });

  const reminder = useReminder(data, current, now);

  if (!current) return <main className="loading">Loading your command centre…</main>;

  const key = picked || current.key;
  const progress = dayProgress(key, data);
  const isFuture = key > current.key;
  const go = (k) => setPicked(k === current.key ? null : k);
  const drink = (ml) => setLog(current.key, (l) => ({ water: Math.min(20000, l.water + ml), lastDrink: Date.now() }));
  const props = { data, update, setLog, dayKey: key, current, progress, isFuture, setTab, go };

  return (
    <div className="shell">
      <header>
        <div className="brand"><span className="logo">&gt;_</span><div><h1>OpsLife</h1><p>Personal Command Centre</p></div></div>
        <div className="clock"><strong>{fmt(now.getHours() * 60 + now.getMinutes())}</strong>
          <span className={`pill ${progress.day.shiftId}`}>{SHIFTS[progress.day.shiftId].name} · {progress.day.work ? 'Workday' : 'Off day'}</span></div>
      </header>

      <nav aria-label="Sections">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>

      <main>
        {saveError && <div className="banner warn" role="alert">Your browser blocked saving. Changes will be lost when you close this page.</div>}
        {reminder.due && (
          <div className="banner water" role="alert">
            <span>💧 Time to drink water.</span>
            <span className="row"><button className="primary" onClick={() => drink(data.settings.glass)}>I drank {data.settings.glass} ml</button>
              <button onClick={reminder.snooze}>Snooze 15 min</button></span>
          </div>
        )}
        {tab !== 'roadmap' && tab !== 'settings' && (
          <div className="datebar">
            <button aria-label="Previous day" onClick={() => go(addDays(key, -1))}>‹</button>
            <div><strong>{longDate(key)}</strong><small>{key === current.key ? 'Current day' : isFuture ? 'Preview' : 'Past day'}</small></div>
            <button aria-label="Next day" onClick={() => go(addDays(key, 1))}>›</button>
            {picked && <button onClick={() => setPicked(null)}>Today</button>}
          </div>
        )}
        {progress.day.warnings.map((w) => tab !== 'roadmap' && <div key={w} className="banner warn">⚠️ {w}</div>)}
        {tab === 'today' && <Dashboard {...props} />}
        {tab === 'routine' && <Routine {...props} />}
        {tab === 'track' && <Trackers {...props} />}
        {tab === 'roadmap' && <Roadmap {...props} />}
        {tab === 'settings' && <Settings {...props} />}
      </main>
    </div>
  );
}
