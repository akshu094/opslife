import { buildDay } from './schedule';
import { emptyLog } from './store';

export function dayProgress(key, data) {
  const s = data.settings;
  const day = buildDay(key, s);
  const log = data.logs[key] || emptyLog;
  const studyGoal = day.work ? s.studyWork : s.studyOff;
  const cap = (v) => Math.min(1, v);
  const parts = [
    { id: 'water', label: 'Water', ratio: cap(log.water / s.waterGoal), text: `${(log.water / 1000).toFixed(2)} / ${(s.waterGoal / 1000).toFixed(1)} L` },
    { id: 'steps', label: 'Steps', ratio: cap(log.steps / s.stepGoal), text: `${log.steps.toLocaleString('en-IN')} / ${s.stepGoal.toLocaleString('en-IN')}` },
    { id: 'study', label: 'DevOps study', ratio: cap(log.study / studyGoal), text: `${log.study} / ${studyGoal} min` },
  ];
  // Rest days do not count against the score unless you choose to train.
  if (day.gym || log.gym) parts.push({ id: 'gym', label: 'Gym', ratio: log.gym ? 1 : 0, text: log.gym ? 'Done' : 'Planned' });
  const score = Math.round((parts.reduce((a, p) => a + p.ratio, 0) / parts.length) * 100);
  return { day, log, parts, score, studyGoal };
}
