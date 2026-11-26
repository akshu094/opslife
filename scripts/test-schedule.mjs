import assert from 'node:assert/strict';
import { buildDay, currentDay, addDays, SHIFTS, isWorkday } from '../lib/schedule.js';

const ids = Object.keys(SHIFTS);
const base = { gymDays: [0, 2, 3, 5, 6], months: {} };
let days = 0;
const problems = [];
// Every shift, and every month-to-month changeover, across two years.
for (const a of ids) for (const c of ids) {
  const months = {};
  for (let i = 0; i < 25; i++) {
    const d = new Date(2026, i, 1);
    months[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`] = i % 2 ? c : a;
  }
  const s = { ...base, defaultShift: a, months };
  for (let k = '2026-01-01'; k < '2028-01-01'; k = addDays(k, 1)) {
    const d = buildDay(k, s);
    days++;
    d.blocks.forEach((x, i) => {
      assert.ok(x.end > x.start, `${k} ${x.title} has no length`);
      if (i) assert.ok(x.start >= d.blocks[i - 1].end, `${k} ${a}/${c} overlap: ${d.blocks[i - 1].title} / ${x.title}`);
    });
    assert.equal(d.work, isWorkday(k));
    if (d.work) assert.ok(d.blocks.some((x) => x.type === 'work' && x.start === d.shift.start && x.end === d.shift.end));
    else assert.ok(!d.blocks.some((x) => x.type === 'work'));
    if (d.warnings.length) problems.push(k);
    if (a === c) {
      assert.equal(d.warnings.length, 0, `${k} ${a}: ${d.warnings}`);
      assert.ok(d.sleepHours >= 5 && d.sleepHours <= 9.5, `${k} ${a} sleep ${d.sleepHours}`);
      assert.ok(d.blocks.some((x) => x.type === 'study'), `${k} ${a} no study`);
      assert.ok(d.blocks.some((x) => x.type === (d.gym ? 'gym' : 'walk')), `${k} ${a} no movement`);
    }
  }
}
// 2026-11-26 is a Thursday, 2026-11-27 a Friday, 2026-11-29 a Sunday.
assert.ok(isWorkday('2026-11-26') && !isWorkday('2026-11-27') && !isWorkday('2026-11-28') && isWorkday('2026-11-29'));
const night = { ...base, defaultShift: 'night' };
assert.equal(currentDay(new Date(2026, 10, 27, 3, 0), night).key, '2026-11-26', '3 AM belongs to the previous night shift');
assert.equal(currentDay(new Date(2026, 10, 27, 13, 0), night).key, '2026-11-27');
console.log(`PASS: ${days} generated days, no overlaps; ${problems.length} changeover days raise a warning.`);
