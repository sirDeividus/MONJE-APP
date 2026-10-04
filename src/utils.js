export const STORAGE_KEY = '@monk_mode_v1';
export const STUDY_GOAL_MIN = 45;
export const READING_GOAL_MIN = 40;

export const PILLARS = [
  { id: 'alcohol', icon: '🚫', title: 'Cero Alcohol', short: 'Alcohol' },
  { id: 'purity', icon: '🔥', title: 'Sin Porno / Sin Masturbación', short: 'Pureza' },
  { id: 'english', icon: '🖥️', title: 'Estudio PC', short: 'Estudio' },
  { id: 'reading', icon: '📖', title: 'Lectura', short: 'Lectura' },
  { id: 'meditation', icon: '🧘', title: 'Meditación', short: 'Meditación' },
  { id: 'exercise', icon: '💪', title: 'Ejercicio', short: 'Ejercicio' },
];

export const TOPICS = [
  { id: 'english', label: 'Inglés', icon: '🇬🇧' },
  { id: 'cyber', label: 'Ciberseguridad', icon: '🛡️' },
];

export const PRACTICE_TYPES = [
  'Gramática en PC',
  'Listening en PC',
  'Vocabulario',
  'Labs / CTF',
  'Teoría seguridad',
];

export const DEFAULT_STATE = {
  days: {},
  settings: {
    costPerDay: '20',
    hoursPerDay: '3',
    currency: '$',
    reminders: false,
    morningHour: '8',
    nightHour: '21',
  },
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
  purity: false,
  reading: false,
  readingMinutes: 0,
  english: false,
  meditation: false,
  exercise: false,
  englishMinutes: 0, // minutos totales de estudio (inglés + ciberseguridad)
  topicMinutes: { english: 0, cyber: 0 },
  englishTypes: [],
  notes: { meditation: '', exercise: '', purity: '', reading: '' },
});

export const getDay = (days, key) => {
  const base = emptyDay();
  const raw = days[key] || {};
  return {
    ...base,
    ...raw,
    topicMinutes: { ...base.topicMinutes, ...(raw.topicMinutes || {}) },
    notes: { ...base.notes, ...(raw.notes || {}) },
  };
};

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
