import Ring from './Ring';
import { ROADMAP } from '@/lib/roadmap';
import { parseKey } from '@/lib/schedule';

export default function Roadmap({ data, update, current }) {
  const start = parseKey(data.settings.roadmapStart);
  const today = parseKey(current.key);
  let months = (today.getFullYear() - start.getFullYear()) * 12 + today.getMonth() - start.getMonth();
  if (today.getDate() < start.getDate()) months--;
  const total = ROADMAP.reduce((a, m) => a + m.tasks.length, 0);
  const done = ROADMAP.reduce((a, m, i) => a + m.tasks.filter((_, j) => data.roadmap[`${i}-${j}`]).length, 0);
  const monthDate = (i) => new Date(start.getFullYear(), start.getMonth() + i, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  return (
    <>
      <section className="card row spread">
        <div><h2>Six-month DevOps roadmap</h2>
          <p>{done} of {total} milestones complete</p>
          <p className="muted">{today < start ? 'Not started yet.' : months > 5 ? 'The six months have ended. Finish any open items.' : `You are in month ${months + 1}.`} Change the start date in Settings.</p></div>
        <Ring ratio={done / total} label={`${Math.round((done / total) * 100)}%`} />
      </section>
      <div className="grid">
        {ROADMAP.map((m, i) => (
          <section key={m.title} className={`card ${i === months ? 'now' : ''}`}>
            <small className="muted">Month {i + 1} · from {monthDate(i)}{i === months ? ' · Current' : ''}</small>
            <h2>{m.title}</h2>
            <ul className="checks">
              {m.tasks.map((t, j) => (
                <li key={t}><label>
                  <input type="checkbox" checked={!!data.roadmap[`${i}-${j}`]}
                    onChange={(e) => { const v = e.target.checked; update((d) => ({ ...d, roadmap: { ...d.roadmap, [`${i}-${j}`]: v } })); }} />
                  <span>{t}</span></label></li>
              ))}
            </ul>
            <p className="note">🛠 Project: {m.project}</p>
          </section>
        ))}
      </div>
    </>
  );
}
