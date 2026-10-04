import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  MONTHS,
  PILLARS,
  WEEKDAYS,
  addDays,
  bestStreak,
  countStreak,
  dateKey,
  doneCount,
  getDay,
  isFull,
  longDate,
  parseKey,
} from '../utils';

function Stat({ label, value, accent }) {
  return (
    <View className="flex-1 rounded-xl border border-line bg-card p-3">
      <Text className={`text-2xl font-bold ${accent || 'text-white'}`}>{value}</Text>
      <Text className="mt-0.5 text-[11px] text-muted">{label}</Text>
    </View>
  );
}

export default function HistoryScreen({ state, today, updateDay }) {
  const { days } = state;
  const t = parseKey(today);
  const [cursor, setCursor] = useState({ y: t.getFullYear(), m: t.getMonth() });
  const [selected, setSelected] = useState(today);

  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const offset = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7; // lunes primero

  const cells = useMemo(() => {
    const arr = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d += 1) arr.push(dateKey(new Date(cursor.y, cursor.m, d, 12)));
    return arr;
  }, [cursor, daysInMonth, offset]);

  const monthKeys = cells.filter(Boolean);
  const elapsed = monthKeys.filter((k) => k <= today);
  const perfectMonth = elapsed.filter((k) => isFull(days[k])).length;
  const pctMonth = elapsed.length ? Math.round((perfectMonth / elapsed.length) * 100) : 0;
  const perfectTotal = Object.values(days).filter(isFull).length;

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  const move = (delta) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  const sel = getDay(days, selected);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text className="text-xs uppercase tracking-widest text-neon">Historial</Text>
      <Text className="mb-4 text-2xl font-bold text-white">Estadísticas</Text>

      <View className="mb-4 flex-row gap-2">
        <Stat label="Racha actual" value={countStreak(days, today, isFull)} accent="text-neon" />
        <Stat label="Mejor racha" value={bestStreak(days, isFull)} accent="text-cyan" />
        <Stat label="Días al 100%" value={perfectTotal} />
      </View>

      <View className="mb-4 rounded-2xl border border-line bg-card p-4">
        <Text className="mb-3 text-sm font-semibold text-white">Últimos 7 días</Text>
        <View className="h-24 flex-row items-end justify-between">
          {week.map((k) => {
            const n = doneCount(days[k]);
            return (
              <Pressable key={k} onPress={() => setSelected(k)} className="flex-1 items-center">
                <View className="h-20 w-5 justify-end overflow-hidden rounded bg-line">
                  <View
                    style={{ height: `${(n / PILLARS.length) * 100}%` }}
                    className={n === PILLARS.length ? 'bg-neon' : 'bg-cyan'}
                  />
                </View>
                <Text className="mt-1 text-[10px] text-muted">
                  {WEEKDAYS[(parseKey(k).getDay() + 6) % 7]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mb-4 rounded-2xl border border-line bg-card p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable onPress={() => move(-1)} className="px-3 py-1">
            <Text className="text-lg text-white">‹</Text>
          </Pressable>
          <Text className="text-base font-semibold text-white">
            {MONTHS[cursor.m]} {cursor.y}
          </Text>
          <Pressable onPress={() => move(1)} className="px-3 py-1">
            <Text className="text-lg text-white">›</Text>
          </Pressable>
        </View>

        <View className="flex-row">
          {WEEKDAYS.map((w) => (
            <Text key={w} className="flex-1 text-center text-[11px] text-muted">
              {w}
            </Text>
          ))}
        </View>

        <View className="mt-1 flex-row flex-wrap">
          {cells.map((k, i) => {
            if (!k) return <View key={`e${i}`} style={{ width: '14.2857%', height: 44 }} />;
            const future = k > today;
            const full = isFull(days[k]);
            const n = doneCount(days[k]);
            const isSel = k === selected;
            const style = full
              ? 'bg-neon'
              : n > 0
              ? 'bg-cyan/20'
              : 'bg-elevated';
            return (
              <View key={k} style={{ width: '14.2857%', height: 44, padding: 2 }}>
                <Pressable
                  disabled={future}
                  onPress={() => setSelected(k)}
                  className={`flex-1 items-center justify-center rounded-lg ${style} ${
                    isSel ? 'border-2 border-white' : k === today ? 'border border-neon' : ''
                  } ${future ? 'opacity-30' : ''}`}
                >
                  <Text className={`text-xs font-medium ${full ? 'text-black' : 'text-white'}`}>
                    {parseKey(k).getDate()}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-1 h-3 w-3 rounded bg-neon" />
            <Text className="mr-3 text-[11px] text-muted">100%</Text>
            <View className="mr-1 h-3 w-3 rounded bg-cyan/20" />
            <Text className="text-[11px] text-muted">Parcial</Text>
          </View>
          <Text className="text-[11px] text-muted">
            Mes: {perfectMonth} días perfectos ({pctMonth}%)
          </Text>
        </View>
      </View>

      <View className="rounded-2xl border border-line bg-card p-4">
        <Text className="mb-1 text-sm font-semibold capitalize text-white">{longDate(selected)}</Text>
        <Text className="mb-3 text-xs text-muted">
          {doneCount(sel)}/{PILLARS.length} pilares
          {sel.englishMinutes ? ` · ${sel.englishMinutes} min de estudio` : ''}
          {sel.readingMinutes ? ` · ${sel.readingMinutes} min de lectura` : ''}
          {selected < today ? ' · toca para corregir' : ''}
        </Text>
        {PILLARS.map((p) => (
          <Pressable
            key={p.id}
            disabled={selected > today}
            onPress={() => updateDay(selected, { [p.id]: !sel[p.id] })}
            className="flex-row items-center py-2"
          >
            <Text className="mr-2">{p.icon}</Text>
            <View className="flex-1">
              <Text className="text-sm text-white">{p.short}</Text>
              {sel.notes && sel.notes[p.id] ? (
                <Text className="text-xs text-muted">{sel.notes[p.id]}</Text>
              ) : null}
            </View>
            <Text className={sel[p.id] ? 'text-neon' : 'text-muted'}>
              {sel[p.id] ? '✓ Cumplido' : '✗ No cumplido'}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
