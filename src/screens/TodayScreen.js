import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import PillarCard from '../components/PillarCard';
import ProgressRing from '../components/ProgressRing';
import {
  READING_GOAL_MIN,
  STUDY_GOAL_MIN,
  PRACTICE_TYPES,
  TOPICS,
  PILLARS,
  bestStreak,
  countStreak,
  doneCount,
  fmt,
  getDay,
  isFull,
  longDate,
  num,
} from '../utils';
import { phraseFor } from '../phrases';
import { ensurePermission } from '../notifications';

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
  const [topic, setTopic] = useState('english');
  const { days, settings } = state;
  const day = getDay(days, today);
  const done = doneCount(day);
  const percent = (done / PILLARS.length) * 100;
  const streak = countStreak(days, today, isFull);

  // Alcohol: días sobrio consecutivos y acumulados.
  const soberStreak = countStreak(days, today, (d) => d && d.alcohol);
  const soberTotal = Object.values(days).filter((d) => d && d.alcohol).length;
  const cleanStreak = countStreak(days, today, (d) => d && d.purity);
  const cleanBest = bestStreak(days, (d) => d && d.purity);
  const money = soberTotal * num(settings.costPerDay);
  const hours = soberTotal * num(settings.hoursPerDay);

  const addMinutes = (delta) => {
    // El cambio real nunca baja el tema de 0 (el total se mantiene coherente).
    const current = day.topicMinutes[topic] || 0;
    const applied = Math.max(-current, delta);
    if (applied === 0) return;
    const minutes = Math.max(0, day.englishMinutes + applied);
    const patch = {
      englishMinutes: minutes,
      topicMinutes: { ...day.topicMinutes, [topic]: current + applied },
    };
    // Solo se marca/desmarca al cruzar la meta; no pisa un cambio manual.
    const was = day.englishMinutes >= STUDY_GOAL_MIN;
    const now = minutes >= STUDY_GOAL_MIN;
    if (!was && now) patch.english = true;
    else if (was && !now) patch.english = false;
    updateDay(today, patch);
  };

  const addReading = (delta) => {
    const was = day.readingMinutes || 0;
    const minutes = Math.max(0, was + delta);
    if (minutes === was) return;
    const patch = { readingMinutes: minutes };
    if (was < READING_GOAL_MIN && minutes >= READING_GOAL_MIN) patch.reading = true;
    else if (was >= READING_GOAL_MIN && minutes < READING_GOAL_MIN) patch.reading = false;
    updateDay(today, patch);
  };

  const toggleReminders = async (on) => {
    if (on && !(await ensurePermission())) return;
    updateSettings({ reminders: on });
  };

  const toggleType = (t) => {
    const has = day.englishTypes.includes(t);
    updateDay(today, {
      englishTypes: has ? day.englishTypes.filter((x) => x !== t) : [...day.englishTypes, t],
    });
  };

  const setNote = (id, text) => updateDay(today, { notes: { ...day.notes, [id]: text } });
  const readingPct = Math.min(100, ((day.readingMinutes || 0) / READING_GOAL_MIN) * 100);
  const englishPct = Math.min(100, (day.englishMinutes / STUDY_GOAL_MIN) * 100);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-xs uppercase tracking-widest text-neon">Monk Mode</Text>
      <Text className="mb-4 text-2xl font-bold capitalize text-white">{longDate(today)}</Text>

      <View className="mb-4 rounded-2xl border border-neon/30 bg-neon/5 p-4">
        <Text className="text-sm italic text-white">“{phraseFor(today)}”</Text>
      </View>

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
        icon="🔥"
        title="Sin Porno / Sin Masturbación"
        subtitle="Cero hoy. Controla tu energía y tu enfoque"
        done={day.purity}
        onToggle={() => updateDay(today, { purity: !day.purity })}
      >
        <View className="mb-3 flex-row gap-2">
          <Stat label="Días limpio (racha)" value={cleanStreak} accent="text-neon" />
          <Stat label="Mejor racha" value={cleanBest} accent="text-cyan" />
        </View>
        <NoteInput
          value={day.notes.purity}
          onChangeText={(t) => setNote('purity', t)}
          placeholder="¿Qué disparó el impulso? ¿Cómo lo manejaste?"
        />
        <Text className="mt-2 text-[11px] text-muted">
          Si llega el impulso: regla de 10 minutos. Levántate, sal del cuarto, agua fría o flexiones.
        </Text>
      </PillarCard>

      <PillarCard
        icon="🖥️"
        title="Estudio: Inglés + Ciberseguridad"
        subtitle={`Meta ${STUDY_GOAL_MIN} min: 15 en la mañana, el resto en la noche`}
        done={day.english}
        onToggle={() => updateDay(today, { english: !day.english })}
      >
        <View className="mb-3 flex-row gap-2">
          {TOPICS.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setTopic(t.id)}
              className={`flex-1 items-center rounded-lg border py-2 ${
                topic === t.id ? 'border-cyan bg-cyan/15' : 'border-line bg-elevated'
              }`}
            >
              <Text className="text-base">{t.icon}</Text>
              <Text className={`text-[11px] ${topic === t.id ? 'text-cyan' : 'text-muted'}`}>
                {t.label}
              </Text>
              <Text className="text-xs font-semibold text-white">
                {day.topicMinutes[t.id] || 0} min
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="mb-2 flex-row items-end justify-between">
          <Text className="text-3xl font-bold text-white">
            {day.englishMinutes}
            <Text className="text-base font-normal text-muted"> / {STUDY_GOAL_MIN} min</Text>
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
          {PRACTICE_TYPES.map((t) => (
            <Chip
              key={t}
              label={t}
              active={day.englishTypes.includes(t)}
              onPress={() => toggleType(t)}
            />
          ))}
        </View>
      </PillarCard>

      <PillarCard
        icon="📖"
        title="Lectura"
        subtitle={`Meta ${READING_GOAL_MIN} min: puedes partirlos mañana y noche`}
        done={day.reading}
        onToggle={() => updateDay(today, { reading: !day.reading })}
      >
        <Text className="mb-2 text-3xl font-bold text-white">
          {day.readingMinutes || 0}
          <Text className="text-base font-normal text-muted"> / {READING_GOAL_MIN} min</Text>
        </Text>
        <View className="mb-3 h-2 overflow-hidden rounded-full bg-line">
          <View
            style={{ width: `${readingPct}%` }}
            className={`h-2 rounded-full ${readingPct >= 100 ? 'bg-neon' : 'bg-cyan'}`}
          />
        </View>
        <View className="mb-3 flex-row gap-2">
          {[-5, 5, 10, 15].map((m) => (
            <Pressable
              key={m}
              onPress={() => addReading(m)}
              className="flex-1 items-center rounded-lg border border-line bg-elevated py-2"
            >
              <Text className={m > 0 ? 'font-medium text-cyan' : 'text-muted'}>
                {m > 0 ? `+${m}` : m}
              </Text>
            </Pressable>
          ))}
        </View>
        <NoteInput
          value={day.notes.reading}
          onChangeText={(t) => setNote('reading', t)}
          placeholder="Libro / páginas (ej. Atomic Habits, p. 40-55)"
        />
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

      <View className="rounded-2xl border border-line bg-card p-4">
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-base font-semibold text-white">🔔 Recordatorios</Text>
            <Text className="mt-0.5 text-xs text-muted">
              Mañana: arranca con 15 min. Noche: te dice lo que falta.
            </Text>
          </View>
          <Switch
            value={!!settings.reminders}
            onValueChange={toggleReminders}
            trackColor={{ false: '#262626', true: '#22d3ee66' }}
            thumbColor={settings.reminders ? '#22d3ee' : '#737373'}
          />
        </View>
        {settings.reminders ? (
          <View className="mt-3 flex-row gap-2">
            <View className="flex-1">
              <Text className="mb-1 text-[11px] text-muted">Hora mañana (0-23)</Text>
              <TextInput
                value={settings.morningHour}
                onChangeText={(v) => updateSettings({ morningHour: v.replace(/\D/g, '').slice(0, 2) })}
                keyboardType="number-pad"
                className="rounded-lg border border-line bg-elevated px-3 py-2 text-white"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-[11px] text-muted">Hora noche (0-23)</Text>
              <TextInput
                value={settings.nightHour}
                onChangeText={(v) => updateSettings({ nightHour: v.replace(/\D/g, '').slice(0, 2) })}
                keyboardType="number-pad"
                className="rounded-lg border border-line bg-elevated px-3 py-2 text-white"
              />
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
