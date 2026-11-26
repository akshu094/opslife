import { fmt } from '@/lib/schedule';

export default function Routine({ dayKey, current, progress, setLog, isFuture }) {
  const { day, log } = progress;
  return (
    <section className="card">
      <h2>{day.work ? 'Workday routine' : 'Off-day routine'} · {day.shift.name} month</h2>
      {day.shiftId === 'night' && (
        <p className="note">🌙 Night-shift sleep today: <strong>{fmt(day.bed)} – {fmt(day.nextWake)}</strong> ({day.sleepHours.toFixed(1)} h). Use blackout curtains and silence your phone.</p>
      )}
      <ol className="timeline">
        {day.blocks.map((x) => {
          const id = `${x.start}-${x.type}`;
          const live = dayKey === current.key && current.minute >= x.start && current.minute < x.end;
          return (
            <li key={id} className={`${x.type} ${live ? 'live' : ''} ${log.done[id] ? 'done' : ''}`}>
              <label>
                <input type="checkbox" checked={!!log.done[id]} disabled={isFuture}
                  onChange={(e) => setLog(dayKey, (l) => ({ done: { ...l.done, [id]: e.target.checked } }))} />
                <time>{fmt(x.start)} – {fmt(x.end)}{x.start >= 1440 ? ' (next day)' : ''}</time>
                <span>{x.title}{live && <b>Now</b>}</span>
              </label>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
