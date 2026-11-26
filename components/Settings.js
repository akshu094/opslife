import { useEffect, useState } from 'react';
import { SHIFTS, fmt, parseKey } from '@/lib/schedule';
import { sanitize, defaults } from '@/lib/store';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// A number field that saves on blur, so partial typing is not clamped.
function Num({ label, value, onSave }) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  return (
    <label>{label}
      <input type="number" value={v} onChange={(e) => setV(e.target.value)}
        onBlur={() => { if (v === '') setV(String(value)); else { onSave(Number(v)); setV(String(value)); } }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
    </label>
  );
}

export default function Settings({ data, update, current }) {
  const s = data.settings;
  const [perm, setPerm] = useState('unsupported');
  const [msg, setMsg] = useState('');
  useEffect(() => { if ('Notification' in window) setPerm(Notification.permission); }, []);
  const set = (patch) => update((d) => sanitize({ ...d, settings: { ...d.settings, ...patch } }));

  const base = parseKey(current.key);
  const months = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    return { id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) };
  });

  const exportData = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = `opslife-backup-${current.key}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importData = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (!raw?.settings || !raw?.logs) throw new Error();
      if (window.confirm('Replace all current data with this backup?')) { update(() => sanitize(raw)); setMsg('Backup restored.'); }
    } catch { setMsg('That file is not a valid OpsLife backup.'); }
  };

  return (
    <div className="grid">
      <section className="card wide">
        <h2>Monthly shift</h2>
        <div className="shifts">
          {Object.entries(SHIFTS).map(([id, x]) => <div key={id} className={`pill ${id}`}>{x.name}: {fmt(x.start)} – {fmt(x.end)}</div>)}
        </div>
        <div className="form">
          <label>Default for unlisted months
            <select value={s.defaultShift} onChange={(e) => set({ defaultShift: e.target.value })}>
              {Object.entries(SHIFTS).map(([id, x]) => <option key={id} value={id}>{x.name}</option>)}
            </select></label>
          {months.map((m) => (
            <label key={m.id}>{m.label}
              <select value={s.months[m.id] || ''} onChange={(e) => set({ months: { ...s.months, [m.id]: e.target.value } })}>
                <option value="">Default ({SHIFTS[s.defaultShift].name})</option>
                {Object.entries(SHIFTS).map(([id, x]) => <option key={id} value={id}>{x.name}</option>)}
              </select></label>
          ))}
        </div>
        <p className="muted">Set each month explicitly if you want past records to stay unchanged when you change the default.</p>
      </section>

      <section className="card">
        <h2>Goals</h2>
        <div className="form">
          <Num label="Water goal (ml)" value={s.waterGoal} onSave={(v) => set({ waterGoal: v })} />
          <Num label="Glass size (ml)" value={s.glass} onSave={(v) => set({ glass: v })} />
          <Num label="Step goal" value={s.stepGoal} onSave={(v) => set({ stepGoal: v })} />
          <Num label="Study, workday (min)" value={s.studyWork} onSave={(v) => set({ studyWork: v })} />
          <Num label="Study, off day (min)" value={s.studyOff} onSave={(v) => set({ studyOff: v })} />
          <label>Roadmap start<input type="date" value={s.roadmapStart} onChange={(e) => e.target.value && set({ roadmapStart: e.target.value })} /></label>
        </div>
        <h3>Gym days</h3>
        <div className="row">
          {DAYS.map((d, i) => (
            <button key={d} aria-pressed={s.gymDays.includes(i)} className={s.gymDays.includes(i) ? 'primary' : ''}
              onClick={() => set({ gymDays: s.gymDays.includes(i) ? s.gymDays.filter((x) => x !== i) : [...s.gymDays, i] })}>{d}</button>
          ))}
        </div>
        {s.gymDays.length > 5 && <p className="note">Keep at least two rest days to avoid burnout.</p>}
      </section>

      <section className="card">
        <h2>Water reminders</h2>
        <label className="inline"><input type="checkbox" checked={s.reminders} onChange={(e) => set({ reminders: e.target.checked })} /> Remind me while awake</label>
        <div className="form"><Num label="Every (minutes)" value={s.interval} onSave={(v) => set({ interval: v })} /></div>
        {perm === 'default' && <button onClick={() => Notification.requestPermission().then(setPerm)}>Enable browser notifications</button>}
        <p className="muted">Notifications: {perm}. Reminders work only while OpsLife is open; background tabs may delay them.</p>

        <h2>Your data</h2>
        <p className="muted">Stored only in this browser. Export a backup before clearing site data or switching device.</p>
        <div className="row">
          <button onClick={exportData}>Export backup</button>
          <label className="button">Import backup<input type="file" accept="application/json,.json" onChange={importData} hidden /></label>
          <button className="danger" onClick={() => { if (window.confirm('Delete all OpsLife data in this browser?')) { update(() => defaults()); setMsg('Data reset.'); } }}>Reset</button>
        </div>
        <p role="status">{msg}</p>
      </section>
    </div>
  );
}
