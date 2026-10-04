import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STATE, STORAGE_KEY } from './utils';

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: DEFAULT_STATE, ok: true };
    const parsed = JSON.parse(raw);
    return {
      state: {
        days: parsed.days || {},
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
      },
      ok: true,
    };
  } catch (e) {
    // ok=false: no sobrescribir los datos guardados con valores por defecto.
    return { state: DEFAULT_STATE, ok: false };
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Fallo de escritura: se reintentará en el siguiente cambio.
  }
}
