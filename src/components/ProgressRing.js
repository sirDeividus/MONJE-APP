import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export default function ProgressRing({ percent, size = 168, stroke = 12, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);
  const full = percent >= 100;
  const color = full ? '#00ff9d' : '#22d3ee';

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="#262626" strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={offset}
          />
        </G>
      </Svg>
      <View className="absolute items-center">
        <Text className="text-4xl font-bold text-white">{Math.round(percent)}%</Text>
        {label ? <Text className="mt-1 text-xs text-muted">{label}</Text> : null}
      </View>
    </View>
  );
}
