'use client';
import { useEffect, useRef, useState } from 'react';
import { buildDay, parseKey } from '@/lib/schedule';

// Reminders fire only while the app is open: there is no push server.
export default function useReminder(data, current, now) {
  const [snoozeUntil, setSnooze] = useState(0);
  const notified = useRef(0);
  let due = false;
  let slot = 0;
  if (data && current && data.settings.reminders) {
    const day = buildDay(current.key, data.settings);
    const log = data.logs[current.key];
    const awake = current.minute >= day.wake && current.minute < day.bed;
    const wakeTime = parseKey(current.key);
    wakeTime.setHours(0, day.wake, 0, 0);
    const since = log?.lastDrink || wakeTime.getTime();
    const gap = now.getTime() - since;
    const every = data.settings.interval * 60000;
    due = awake && (log?.water || 0) < data.settings.waterGoal && gap >= every && now.getTime() >= snoozeUntil;
    slot = since + Math.floor(gap / every) * every;
  }

  useEffect(() => {
    if (!due || notified.current === slot) return;
    notified.current = slot;
    try {
      if (window.Notification?.permission === 'granted') {
        new Notification('OpsLife', { body: 'Time to drink water 💧', tag: 'opslife-water' });
      }
    } catch {} // Some mobile browsers do not allow page notifications.
  }, [due, slot]);

  return { due, snooze: () => setSnooze(Date.now() + 15 * 60000) };
}
