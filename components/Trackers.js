import { useState } from 'react';
import Ring from './Ring';
import WaterGlass from './WaterGlass';

function Adder({ label, onAdd, disabled }) {
  const [v, setV] = useState('');
  return (
    <form className="row" onSubmit={(e) => { e.preventDefault(); const n = Math.round(Number(v)); if (n >= 0 && v !== '') onAdd(n); setV(''); }}>
      <input type="number" min="0" inputMode="numeric" placeholder={label} aria-label={label} value={v} disabled={disabled} onChange={(e) => setV(e.target.value)} />
      <button disabled={disabled}>Save</button>
    </form>
  );
}

export default function Trackers({ data, dayKey, current, progress, setLog, isFuture }) {
  const { log, day, studyGoal } = progress;
  const s = data.settings;
  const off = isFuture;
  const water = (ml) => setLog(dayKey, (l) => ({
    water: Math.max(0, Math.min(20000, l.water + ml)),
    ...(ml > 0 && dayKey === current.key ? { lastDrink: Date.now() } : {}),
  }));
  const add = (field, n, max) => setLog(dayKey, (l) => ({ [field]: Math.max(0, Math.min(max, l[field] + n)) }));

  return (
    <div className="grid">
      {off && <div className="banner warn wide">This day has not started, so logging is disabled.</div>}
      <section className="card center">
        <h2>Hydration</h2>
        <WaterGlass ratio={log.water / s.waterGoal} />
        <p className="big">{log.water} ml<small>of {s.waterGoal} ml</small></p>
        <div className="row">
          <button className="primary" disabled={off} onClick={() => water(s.glass)}>+ {s.glass} ml</button>
          <button disabled={off} onClick={() => water(500)}>+ 500 ml</button>
          <button disabled={off || !log.water} onClick={() => water(-s.glass)}>Undo {s.glass}</button>
        </div>
      </section>

      <section className="card center">
        <h2>Steps</h2>
        <Ring ratio={log.steps / s.stepGoal} label={log.steps.toLocaleString('en-IN')} size={180} color="var(--green)" />
        <p className="muted">Goal {s.stepGoal.toLocaleString('en-IN')}</p>
        <div className="row">
          {[500, 1000, 2500].map((n) => <button key={n} disabled={off} onClick={() => add('steps', n, 100000)}>+ {n}</button>)}
        </div>
        <Adder label="Set total steps" disabled={off} onAdd={(n) => setLog(dayKey, () => ({ steps: Math.min(100000, n) }))} />
      </section>

      <section className="card center">
        <h2>Gym</h2>
        <div className="emoji" aria-hidden="true">{log.gym ? '💪' : day.gym ? '🏋️' : '🧘'}</div>
        <p>{log.gym ? 'Session complete' : day.gym ? 'Session planned today' : 'Rest day: walk and stretch'}</p>
        <button className={log.gym ? '' : 'primary'} disabled={off} onClick={() => setLog(dayKey, (l) => ({ gym: !l.gym }))}>
          {log.gym ? 'Undo' : 'Mark gym done'}
        </button>
      </section>

      <section className="card center">
        <h2>DevOps study</h2>
        <Ring ratio={log.study / studyGoal} label={`${log.study}m`} size={150} color="var(--violet)" />
        <p className="muted">Goal {studyGoal} minutes</p>
        <div className="row">
          {[25, 45].map((n) => <button key={n} disabled={off} onClick={() => add('study', n, 1440)}>+ {n} min</button>)}
          <button disabled={off || !log.study} onClick={() => add('study', -25, 1440)}>− 25</button>
        </div>
        <Adder label="Set total minutes" disabled={off} onAdd={(n) => setLog(dayKey, () => ({ study: Math.min(1440, n) }))} />
        <textarea aria-label="Study note" placeholder="What did you learn or build?" value={log.note} disabled={off}
          onChange={(e) => { const note = e.target.value; setLog(dayKey, () => ({ note })); }} />
      </section>
    </div>
  );
}
