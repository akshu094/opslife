// Pure scheduling logic. Times are minutes from midnight of the day's date;
// values above 1440 fall on the following calendar date.
// A "day" runs from its wake time to the next wake time, so a night shift
// stays on one day instead of splitting at midnight.

export const SHIFTS = {
  morning: { name: 'Morning', start: 330, end: 870 },
  afternoon: { name: 'Afternoon', start: 750, end: 1260 },
  night: { name: 'Night', start: 1260, end: 1800 },
};

const DAY = 1440;
const pad = (n) => String(n).padStart(2, '0');

export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};
export const addDays = (k, n) => {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};
export const fmt = (min) => {
  const m = ((min % DAY) + DAY) % DAY;
  const h = Math.floor(m / 60);
  return `${pad(h % 12 || 12)}:${pad(m % 60)} ${h < 12 ? 'AM' : 'PM'}`;
};

// Sunday (0) to Thursday (4) are workdays; Friday and Saturday are off.
export const isWorkday = (k) => parseKey(k).getDay() <= 4;
export const shiftFor = (k, settings) => settings.months[k.slice(0, 7)] || settings.defaultShift;

const workedNight = (k, s) => isWorkday(k) && shiftFor(k, s) === 'night';

export function wakeAt(k, s) {
  const shift = shiftFor(k, s);
  const work = isWorkday(k);
  const afterNight = workedNight(addDays(k, -1), s);
  if (shift === 'night') {
    if (work) return afterNight ? 870 : 600;
    return afterNight ? 750 : 570;
  }
  if (afterNight) {
    if (!work) return 750;
    return shift === 'afternoon' ? 660 : 390;
  }
  if (shift === 'morning') return work ? 270 : 360;
  return work ? 450 : 480;
}

function bedAt(k, s) {
  const shift = shiftFor(k, s);
  const work = isWorkday(k);
  const next = addDays(k, 1);
  const nextShift = shiftFor(next, s);
  if (shift === 'night') {
    if (work) return DAY + 450;
    if (nextShift === 'night') return isWorkday(next) ? DAY + 120 : DAY + 30;
  }
  if (nextShift === 'night') return DAY + 60;
  let bed;
  if (nextShift === 'morning' && isWorkday(next)) bed = 1260;
  else bed = nextShift === 'morning' ? 1320 : 1410;
  if (work && shift !== 'night') bed = Math.max(bed, SHIFTS[shift].end + 60);
  return bed;
}

const b = (start, mins, type, title) => ({ start, end: start + mins, type, title });

function activities(k, s, gym) {
  const shift = shiftFor(k, s);
  const work = isWorkday(k);
  const move = (t) => b(t, 75, gym ? 'gym' : 'walk', gym ? 'Gym session' : 'Recovery walk and stretching');
  if (shift === 'morning') {
    return work
      ? [b(270, 30, 'health', 'Wake up, water, light breakfast'), b(300, 30, 'travel', 'Get ready and commute'),
         b(870, 45, 'meal', 'Commute and lunch'), b(915, 30, 'rest', 'Power nap'), move(960),
         b(1050, 90, 'study', 'DevOps study block'), b(1140, 30, 'walk', 'Evening walk'), b(1170, 45, 'meal', 'Dinner')]
      : [b(360, 30, 'health', 'Wake up and hydrate'), b(390, 60, 'walk', 'Morning walk'), b(480, 45, 'meal', 'Breakfast'),
         b(540, 120, 'study', 'DevOps deep work: hands-on lab'), move(690), b(780, 60, 'meal', 'Lunch'),
         b(840, 90, 'rest', 'Rest and recharge'), b(960, 60, 'study', 'Notes, Git commits, revision'),
         b(1050, 90, 'free', 'Family, errands, free time'), b(1170, 45, 'meal', 'Dinner')];
  }
  if (shift === 'afternoon') {
    return work
      ? [b(450, 30, 'health', 'Wake up and hydrate'), b(480, 40, 'walk', 'Morning walk'), move(525),
         b(600, 90, 'study', 'DevOps study block'), b(690, 30, 'meal', 'Early lunch'), b(720, 30, 'travel', 'Commute'),
         b(1260, 60, 'meal', 'Commute and light dinner')]
      : [b(480, 30, 'health', 'Wake up and hydrate'), b(510, 60, 'walk', 'Morning walk'),
         b(600, 120, 'study', 'DevOps deep work: hands-on lab'), b(750, 60, 'meal', 'Lunch'),
         b(840, 90, 'rest', 'Rest and recharge'), b(960, 60, 'study', 'Notes, Git commits, revision'),
         move(1050), b(1170, 45, 'meal', 'Dinner'), b(1230, 90, 'free', 'Free time')];
  }
  if (work) {
    const end = [b(1230, 30, 'travel', 'Commute'), b(1800, 45, 'travel', 'Commute home (wear sunglasses)'),
      b(1845, 45, 'meal', 'Light meal, then dark, cool room')];
    return wakeAt(k, s) < 870
      ? [b(wakeAt(k, s), 45, 'health', 'Wake up and hydrate'), b(660, 45, 'walk', 'Daylight walk'),
         b(720, 90, 'study', 'DevOps study block'), b(810, 45, 'meal', 'Lunch'), move(870),
         b(990, 150, 'rest', 'Pre-shift nap'), b(1140, 45, 'meal', 'Dinner'), ...end]
      : [b(870, 30, 'health', 'Wake up and hydrate'), b(900, 30, 'meal', 'First meal'), move(930),
         b(1005, 90, 'study', 'DevOps study block'), b(1110, 40, 'walk', 'Walk'), b(1155, 45, 'meal', 'Dinner'), ...end];
  }
  return wakeAt(k, s) >= 750
    ? [b(750, 30, 'health', 'Wake after recovery sleep'), b(780, 45, 'meal', 'First meal'), b(840, 60, 'walk', 'Daylight walk'),
       b(930, 90, 'study', 'Light DevOps revision'), move(1050), b(1170, 60, 'meal', 'Dinner'), b(1260, 120, 'free', 'Free time')]
    : [b(570, 45, 'health', 'Wake up and hydrate'), b(630, 120, 'study', 'DevOps deep work: hands-on lab'),
       b(780, 60, 'meal', 'Lunch'), move(850), b(960, 45, 'walk', 'Walk'), b(1020, 60, 'study', 'Notes and revision'),
       b(1140, 60, 'meal', 'Dinner'), b(1230, 150, 'free', 'Free time')];
}

export function buildDay(k, s) {
  const shiftId = shiftFor(k, s);
  const shift = SHIFTS[shiftId];
  const work = isWorkday(k);
  const gym = s.gymDays.includes(parseKey(k).getDay());
  const wake = wakeAt(k, s);
  const nextWake = wakeAt(addDays(k, 1), s) + DAY;
  const bed = Math.min(bedAt(k, s), nextWake); // never later than the next wake-up
  const windDown = work && shiftId === 'night' ? bed : bed - 45;

  const blocks = [];
  if (work) blocks.push(b(shift.start, shift.end - shift.start, 'work', `${shift.name} shift`));
  const free = (x) => x.start >= wake && !blocks.some((y) => x.start < y.end && y.start < x.end);
  for (const a of activities(k, s, gym)) {
    const x = { ...a, end: Math.min(a.end, windDown) };
    if (x.end - x.start >= 15 && free(x)) blocks.push(x);
  }
  if (windDown < bed) {
    const start = Math.max(windDown, ...blocks.map((x) => x.end));
    if (start < bed) blocks.push(b(start, bed - start, 'rest', 'Wind down, screens off'));
  }
  if (nextWake > bed) blocks.push({ start: bed, end: nextWake, type: 'sleep', title: 'Sleep' });
  blocks.sort((x, y) => x.start - y.start);

  const warnings = [];
  if (work && wake > shift.start) {
    warnings.push('Shift changeover clash: the previous night shift ends at 06:00 AM, after this morning shift starts. Agree a swap or time off with your manager.');
  }
  const sleepHours = (nextWake - bed) / 60;
  const next = addDays(k, 1);
  // A short sleep after the last night shift is planned: it resets you for the off days.
  const recovery = work && shiftId === 'night' && !isWorkday(next) && shiftFor(next, s) === 'night';
  if (sleepHours < 6.5 && !recovery) {
    warnings.push(`Only ${sleepHours.toFixed(1)} hours of sleep fit before the next day. Cut study or gym and protect rest.`);
  }
  return { key: k, shiftId, shift, work, gym, wake, bed, nextWake, sleepHours, blocks, warnings };
}

// The day that is running right now, and the minute within it.
export function currentDay(now, s) {
  const today = dateKey(now);
  const minute = now.getHours() * 60 + now.getMinutes();
  for (const offset of [0, -1, -2]) {
    const key = addDays(today, offset);
    const m = minute - offset * DAY;
    if (m >= wakeAt(key, s)) return { key, minute: m };
  }
  return { key: today, minute };
}
