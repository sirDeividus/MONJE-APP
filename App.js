import './global.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HistoryScreen from './src/screens/HistoryScreen';
import TodayScreen from './src/screens/TodayScreen';
import { loadState, saveState } from './src/storage';
import { DEFAULT_STATE, dateKey, getDay } from './src/utils';

const TABS = [
  { id: 'today', label: 'Hoy', icon: '◉' },
  { id: 'history', label: 'Historial', icon: '▦' },
];

export default function App() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('today');
  const [today, setToday] = useState(dateKey());
  const saveTimer = useRef(null);

  // Carga inicial desde AsyncStorage.
  useEffect(() => {
    loadState().then((s) => {
      setState(s);
      setLoaded(true);
    });
  }, []);

  // Guardado con debounce (evita escribir en cada tecla de las notas).
  useEffect(() => {
    if (!loaded) return undefined;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 300);
    return () => clearTimeout(saveTimer.current);
  }, [state, loaded]);

  // Guarda al pasar a segundo plano y refresca "hoy" al volver (cambio de día).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (status === 'active') setToday(dateKey());
      else {
        clearTimeout(saveTimer.current);
        setState((s) => {
          saveState(s);
          return s;
        });
      }
    });
    return () => sub.remove();
  }, []);

  const updateDay = useCallback((key, patch) => {
    setState((s) => ({
      ...s,
      days: { ...s.days, [key]: { ...getDay(s.days, key), ...patch } },
    }));
  }, []);

  const updateSettings = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
        <StatusBar style="light" />
        {!loaded ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#00ff9d" />
          </View>
        ) : (
          <>
            <View className="flex-1">
              {tab === 'today' ? (
                <TodayScreen
                  state={state}
                  today={today}
                  updateDay={updateDay}
                  updateSettings={updateSettings}
                />
              ) : (
                <HistoryScreen state={state} today={today} updateDay={updateDay} />
              )}
            </View>
            <View className="flex-row border-t border-line bg-card">
              {TABS.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  className="flex-1 items-center py-3"
                >
                  <Text className={`text-lg ${tab === t.id ? 'text-neon' : 'text-muted'}`}>
                    {t.icon}
                  </Text>
                  <Text className={`text-xs ${tab === t.id ? 'text-neon' : 'text-muted'}`}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
