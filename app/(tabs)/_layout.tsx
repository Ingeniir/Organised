import { Tabs, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCalendarStore } from '@/src/stores/calendarStore';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const { setMode } = useCalendarStore()
  const colorScheme = useColorScheme();
  const segments = useSegments()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (segments[1] !== 'planning') {
        setMode('week')
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [segments[1], setMode])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#303033' : '#ffffff',
          borderTopWidth: 0,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="grid" color={color} />,
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Planning',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tâches',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finances',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard" color={color} />
        }}
      />
    </Tabs>
  );
}
