export const STORAGE_KEY = '@monk_mode_v1';
export const ENGLISH_GOAL_MIN = 45;

export const PILLARS = [
  { id: 'alcohol', icon: '🚫', title: 'Cero Alcohol', short: 'Alcohol' },
  { id: 'english', icon: '🇬🇧', title: 'Inglés (PC)', short: 'Inglés' },
  { id: 'meditation', icon: '🧘', title: 'Meditación', short: 'Meditación' },
  { id: 'exercise', icon: '💪', title: 'Ejercicio', short: 'Ejercicio' },
];

export const ENGLISH_TYPES = [
  'Gramática',
  'Listening',
  'Vocabulario',
  'Speaking',
  'Lectura',
];

export const DEFAULT_STATE = {
  days: {},
  settings: { costPerDay: '20', hoursPerDay: '3', currency: '$' },
};

const pad = (n) => String(n).padStart(2, '0');

export const dateKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Mediodía local para evitar problemas de cambio horario.
export const parseKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

export const addDays = (key, n) => {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};

export const emptyDay = () => ({
  alcohol: false,
  english: false,
  meditation: false,
  exercise: false,
  englishMinutes: 0,
  englishTypes: [],
  notes: { meditation: '', exercise: '' },
});

export const getDay = (days, key) => ({ ...emptyDay(), ...(days[key] || {}) });

export const doneCount = (day) =>
  day ? PILLARS.filter((p) => day[p.id]).length : 0;

export const isFull = (day) => doneCount(day) === PILLARS.length;

// Racha consecutiva terminando hoy (o ayer, si hoy aún no se completa).
export const countStreak = (days, todayKey, pred) => {
  let k = todayKey;
  if (!pred(days[k])) k = addDays(k, -1);
  let n = 0;
  while (pred(days[k])) {
    n += 1;
    k = addDays(k, -1);
  }
  return n;
};

export const bestStreak = (days, pred) => {
  const keys = Object.keys(days)
    .filter((k) => pred(days[k]))
    .sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of keys) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  }
  return best;
};

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
export const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const longDate = (key) => {
  const d = parseKey(key);
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`;
};

export const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const fmt = (n) =>
  (Math.round(n * 10) / 10).toLocaleString('es-ES', { maximumFractionDigits: 1 });
