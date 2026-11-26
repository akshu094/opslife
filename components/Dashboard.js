import Ring from './Ring';
import { addDays, parseKey, fmt } from '@/lib/schedule';
import { dayProgress } from '@/lib/score';

export default function Dashboard({ data, dayKey, current, progress, setTab, go }) {
  const { day, parts, score } = progress;
  const week = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(current.key, i - 6);
    return { k, score: data.logs[k] ? dayProgress(k, data).score : 0 };
  });
  // Consecutive days at 80% or more; today only counts once it gets there.
  let streak = 0;
  let k = current.key;
  if (!(data.logs[k] && dayProgress(k, data).score >= 80)) k = addDays(k, -1);
  while (data.logs[k] && dayProgress(k, data).score >= 80) { streak++; k = addDays(k, -1); }

  const monday = addDays(current.key, -parseKey(current.key).getDay()); // week starts Sunday
  const weekKeys = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const gyms = weekKeys.filter((x) => data.logs[x]?.gym).length;
  const study = weekKeys.reduce((a, x) => a + (data.logs[x]?.study || 0), 0);
  const isCurrent = dayKey === current.key;
  const now = isCurrent && day.blocks.find((x) => current.minute >= x.start && current.minute < x.end);
  const next = isCurrent ? day.blocks.find((x) => x.start > current.minute) : day.blocks[0];

  return (
    <div className="grid">
      <section className="card hero">
        <h2>Daily completion</h2>
        <div className="row spread">
          <Ring ratio={score / 100} label={`${score}%`} size={160} />
          <ul className="bars">
            {parts.map((p) => (
              <li key={p.id}><div><span>{p.label}</span><span>{p.text}</span></div>
                <div className="bar"><i className={p.id} style={{ width: `${p.ratio * 100}%` }} /></div></li>
            ))}
          </ul>
        </div>
        {!day.gym && <p className="muted">Gym rest day: recovery is part of the plan.</p>}
        <button className="primary" onClick={() => setTab('track')}>Log progress</button>
      </section>

      <section className="card">
        <h2>{isCurrent ? 'Right now' : 'Day starts with'}</h2>
        {now && <p className="big">{now.title}<small>until {fmt(now.end)}</small></p>}
        {next && <p>{isCurrent ? 'Next: ' : ''}<strong>{next.title}</strong> at {fmt(next.start)}</p>}
        <p className="muted">{day.work ? `Shift ${fmt(day.shift.start)} – ${fmt(day.shift.end)}` : 'Off day'} · Sleep {fmt(day.bed)} – {fmt(day.nextWake)} ({day.sleepHours.toFixed(1)} h)</p>
        <button onClick={() => setTab('routine')}>Full routine</button>
      </section>

      <section className="card">
        <h2>Last 7 days</h2>
        <div className="chart">
          {week.map((w) => (
            <button key={w.k} onClick={() => go(w.k)} aria-label={`${w.k}: ${w.score}%`} className={w.k === dayKey ? 'sel' : ''}>
              <span>{w.score}</span><div><i style={{ height: `${w.score}%` }} /></div>
              <small>{parseKey(w.k).toLocaleDateString('en-GB', { weekday: 'short' })}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="card stats">
        <h2>This week (Sun–Sat)</h2>
        <div><strong>{gyms}<em>/{data.settings.gymDays.length}</em></strong><span>gym sessions</span></div>
        <div><strong>{(study / 60).toFixed(1)}<em> h</em></strong><span>DevOps study</span></div>
        <div><strong>{streak}</strong><span>day streak (80%+)</span></div>
      </section>
    </div>
  );
}
