import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import PillarCard from '../components/PillarCard';
import ProgressRing from '../components/ProgressRing';
import {
  ENGLISH_GOAL_MIN,
  ENGLISH_TYPES,
  PILLARS,
  countStreak,
  doneCount,
  fmt,
  getDay,
  isFull,
  longDate,
  num,
} from '../utils';

function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-2 mr-2 rounded-full border px-3 py-1.5 ${
        active ? 'border-cyan bg-cyan/15' : 'border-line bg-elevated'
      }`}
    >
      <Text className={`text-xs ${active ? 'text-cyan' : 'text-muted'}`}>{label}</Text>
    </Pressable>
  );
}

function Stat({ label, value, accent }) {
  return (
    <View className="flex-1 rounded-xl border border-line bg-elevated p-3">
      <Text className={`text-xl font-bold ${accent || 'text-white'}`}>{value}</Text>
      <Text className="mt-0.5 text-[11px] text-muted">{label}</Text>
    </View>
  );
}

function NoteInput({ value, onChangeText, placeholder }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#525252"
      maxLength={120}
      className="rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-white"
    />
  );
}

export default function TodayScreen({ state, today, updateDay, updateSettings }) {
  const [showSettings, setShowSettings] = useState(false);
  const { days, settings } = state;
  const day = getDay(days, today);
  const done = doneCount(day);
  const percent = (done / PILLARS.length) * 100;
  const streak = countStreak(days, today, isFull);

  // Alcohol: días sobrio consecutivos y acumulados.
  const soberStreak = countStreak(days, today, (d) => d && d.alcohol);
  const soberTotal = Object.values(days).filter((d) => d && d.alcohol).length;
  const money = soberTotal * num(settings.costPerDay);
  const hours = soberTotal * num(settings.hoursPerDay);

  const addMinutes = (delta) => {
    const minutes = Math.max(0, day.englishMinutes + delta);
    const patch = { englishMinutes: minutes };
    // Solo se marca/desmarca al cruzar la meta; no pisa un cambio manual.
    const was = day.englishMinutes >= ENGLISH_GOAL_MIN;
    const now = minutes >= ENGLISH_GOAL_MIN;
    if (!was && now) patch.english = true;
    else if (was && !now) patch.english = false;
    updateDay(today, patch);
  };

  const toggleType = (t) => {
    const has = day.englishTypes.includes(t);
    updateDay(today, {
      englishTypes: has ? day.englishTypes.filter((x) => x !== t) : [...day.englishTypes, t],
    });
  };

  const setNote = (id, text) => updateDay(today, { notes: { ...day.notes, [id]: text } });
  const englishPct = Math.min(100, (day.englishMinutes / ENGLISH_GOAL_MIN) * 100);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-xs uppercase tracking-widest text-neon">Monk Mode</Text>
      <Text className="mb-4 text-2xl font-bold capitalize text-white">{longDate(today)}</Text>

      <View className="mb-4 flex-row items-center rounded-2xl border border-line bg-card p-4">
        <ProgressRing percent={percent} size={140} label={`${done}/${PILLARS.length} pilares`} />
        <View className="ml-4 flex-1">
          <Text className="text-xs uppercase tracking-wider text-muted">Racha activa</Text>
          <Text className={`text-5xl font-bold ${streak > 0 ? 'text-neon' : 'text-white'}`}>
            {streak}
          </Text>
          <Text className="text-sm text-muted">{streak === 1 ? 'día' : 'días'} sin romper</Text>
          {isFull(day) ? (
            <Text className="mt-2 text-xs text-neon">✓ Protocolo completo hoy</Text>
          ) : null}
        </View>
      </View>

      <PillarCard
        icon="🚫"
        title="Cero Alcohol"
        subtitle="Cero consumo hoy"
        done={day.alcohol}
        onToggle={() => updateDay(today, { alcohol: !day.alcohol })}
      >
        <View className="flex-row gap-2">
          <Stat label="Días sobrio (racha)" value={soberStreak} accent="text-neon" />
          <Stat label={`Ahorrado ${settings.currency}`} value={fmt(money)} />
          <Stat label="Horas ganadas" value={fmt(hours)} />
        </View>
        <Pressable onPress={() => setShowSettings((s) => !s)} className="mt-3">
          <Text className="text-xs text-cyan">
            {showSettings ? 'Ocultar ajustes' : 'Ajustar cálculo de ahorro'}
          </Text>
        </Pressable>
        {showSettings ? (
          <View className="mt-2 flex-row gap-2">
            <View className="flex-1">
              <Text className="mb-1 text-[11px] text-muted">Gasto/día ({settings.currency})</Text>
              <TextInput
                value={settings.costPerDay}
                onChangeText={(v) => updateSettings({ costPerDay: v })}
                keyboardType="decimal-pad"
                className="rounded-lg border border-line bg-elevated px-3 py-2 text-white"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-[11px] text-muted">Horas/día recuperadas</Text>
              <TextInput
                value={settings.hoursPerDay}
                onChangeText={(v) => updateSettings({ hoursPerDay: v })}
                keyboardType="decimal-pad"
                className="rounded-lg border border-line bg-elevated px-3 py-2 text-white"
              />
            </View>
          </View>
        ) : null}
      </PillarCard>

      <PillarCard
        icon="🇬🇧"
        title="Acelerar Inglés"
        subtitle={`Mínimo ${ENGLISH_GOAL_MIN} min desde PC/pantalla`}
        done={day.english}
        onToggle={() => updateDay(today, { english: !day.english })}
      >
        <View className="mb-2 flex-row items-end justify-between">
          <Text className="text-3xl font-bold text-white">
            {day.englishMinutes}
            <Text className="text-base font-normal text-muted"> / {ENGLISH_GOAL_MIN} min</Text>
          </Text>
        </View>
        <View className="mb-3 h-2 overflow-hidden rounded-full bg-line">
          <View
            style={{ width: `${englishPct}%` }}
            className={`h-2 rounded-full ${englishPct >= 100 ? 'bg-neon' : 'bg-cyan'}`}
          />
        </View>
        <View className="mb-3 flex-row gap-2">
          {[-5, 5, 15, 30].map((m) => (
            <Pressable
              key={m}
              onPress={() => addMinutes(m)}
              className="flex-1 items-center rounded-lg border border-line bg-elevated py-2"
            >
              <Text className={m > 0 ? 'font-medium text-cyan' : 'text-muted'}>
                {m > 0 ? `+${m}` : m}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="flex-row flex-wrap">
          {ENGLISH_TYPES.map((t) => (
            <Chip
              key={t}
              label={`${t} en PC`}
              active={day.englishTypes.includes(t)}
              onPress={() => toggleType(t)}
            />
          ))}
        </View>
      </PillarCard>

      <PillarCard
        icon="🧘"
        title="Meditación"
        subtitle="15-20 min de enfoque mental"
        done={day.meditation}
        onToggle={() => updateDay(today, { meditation: !day.meditation })}
      >
        <NoteInput
          value={day.notes.meditation}
          onChangeText={(t) => setNote('meditation', t)}
          placeholder="Observaciones (ej. 15 min de respiración)"
        />
      </PillarCard>

      <PillarCard
        icon="💪"
        title="Ejercicio Físico"
        subtitle="Fuerza o cardio"
        done={day.exercise}
        onToggle={() => updateDay(today, { exercise: !day.exercise })}
      >
        <NoteInput
          value={day.notes.exercise}
          onChangeText={(t) => setNote('exercise', t)}
          placeholder="Observaciones (ej. Glúteos/Pecho)"
        />
      </PillarCard>
    </ScrollView>
  );
}
