import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

export default function PillarCard({ icon, title, subtitle, done, onToggle, children }) {
  return (
    <View
      className={`mb-3 rounded-2xl border p-4 ${
        done ? 'border-neon/60 bg-neon/5' : 'border-line bg-card'
      }`}
    >
      <Pressable
        onPress={onToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: done }}
        className="flex-row items-center"
      >
        <Text className="mr-3 text-2xl">{icon}</Text>
        <View className="flex-1">
          <Text className="text-base font-semibold text-white">{title}</Text>
          {subtitle ? <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text> : null}
        </View>
        <Text className={`mr-2 text-xs font-medium ${done ? 'text-neon' : 'text-muted'}`}>
          {done ? 'Cumplido' : 'Pendiente'}
        </Text>
        <Switch
          value={done}
          onValueChange={onToggle}
          trackColor={{ false: '#262626', true: '#00ff9d66' }}
          thumbColor={done ? '#00ff9d' : '#737373'}
        />
      </Pressable>
      {children ? <View className="mt-3">{children}</View> : null}
    </View>
  );
}
