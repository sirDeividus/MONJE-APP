import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STATE, STORAGE_KEY } from './utils';

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      days: parsed.days || {},
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
    };
  } catch (e) {
    return DEFAULT_STATE;
  }
}

export async function saveState(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Fallo de escritura: se reintentará en el siguiente cambio.
  }
}
