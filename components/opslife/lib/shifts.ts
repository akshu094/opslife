export type ShiftType = "morning" | "evening" | "night";

export interface Shift {
  id: ShiftType;
  label: string;
  workHours: string;
  sleepWindow: string;
}

export const SHIFTS: Shift[] = [
  { id: "morning", label: "☀️ Morning Shift", workHours: "07:00 – 15:00", sleepWindow: "22:30 – 06:00" },
  { id: "evening", label: "🌇 Evening Shift", workHours: "15:00 – 23:00", sleepWindow: "00:30 – 08:30" },
  { id: "night",   label: "🌙 Night Shift",   workHours: "23:00 – 07:00", sleepWindow: "08:00 – 15:00" },
];
