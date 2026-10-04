import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { phraseFor } from './phrases';
import { PILLARS, READING_GOAL_MIN, STUDY_GOAL_MIN, addDays, doneCount, getDay, num, parseKey } from './utils';

const CHANNEL = 'monk-mode';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Recordatorios Modo Monje',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return !!asked.granted;
  } catch (e) {
    return false;
  }
}

const at = (key, hour) => {
  const d = parseKey(key);
  d.setHours(Math.min(23, Math.max(0, Math.floor(num(hour)))), 0, 0, 0);
  return d;
};

// Reprograma 7 días de recordatorios: mañana (arranque) y noche (lo que falta).
export async function rescheduleReminders({ settings, days, today }) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!settings.reminders) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;

    const now = Date.now();
    const schedule = (date, title, body) =>
      date.getTime() > now
        ? Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date,
              channelId: CHANNEL,
            },
          })
        : null;

    const jobs = [];
    for (let i = 0; i < 7; i += 1) {
      const key = addDays(today, i);
      const day = getDay(days, key);
      jobs.push(
        schedule(
          at(key, settings.morningHour),
          'Modo Monje ☀️',
          `Empieza con 15 min de Inglés o Ciberseguridad y ${READING_GOAL_MIN} min de lectura (puedes partirlos mañana y noche). ${phraseFor(key)}`
        )
      );

      if (i === 0 && doneCount(day) === PILLARS.length) continue; // hoy ya completo
      let body;
      if (i === 0) {
        const left = Math.max(0, STUDY_GOAL_MIN - day.englishMinutes);
        const readLeft = Math.max(0, READING_GOAL_MIN - (day.readingMinutes || 0));
        const pending = PILLARS.length - doneCount(day);
        body =
          `Te faltan ${pending} pilar${pending === 1 ? '' : 'es'}` +
          (left > 0 ? `, ${left} min de estudio` : '') +
          (readLeft > 0 ? ` y ${readLeft} min de lectura` : '') +
          `. ${phraseFor(key, 7)}`;
      } else {
        body = `Cierra el día: completa tus pilares y protege tu racha. ${phraseFor(key, 7)}`;
      }
      jobs.push(schedule(at(key, settings.nightHour), 'Modo Monje 🌙', body));
    }
    await Promise.all(jobs.filter(Boolean));
  } catch (e) {
    // Las notificaciones son opcionales: un fallo no debe romper la app.
  }
}
