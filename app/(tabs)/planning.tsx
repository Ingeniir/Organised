import { MonthView } from '@/components/calendar/month-view'
import { WeekView } from '@/components/calendar/week-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ViewMode = 'week' | 'month'

export default function PlanningScreen() {
  const [mode, setMode] = useState<ViewMode>('week')
  const insets = useSafeAreaInsets()
  const activeBg = useThemeColor({ light: '#6366f1', dark: '#6366f1' }, 'text')
  const inactiveBg = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'text')

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Topbar */}
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <ThemedText type="defaultSemiBold">Planning</ThemedText>
        <View style={[styles.toggle, { backgroundColor: inactiveBg }]}>
          {(['week', 'month'] as ViewMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleBtn, mode === m && { backgroundColor: activeBg }]}
              onPress={() => setMode(m)}
            >
              <ThemedText style={[styles.toggleText, mode === m && { color: '#fff' }]}>
                {m === 'week' ? 'Semaine' : 'Mois'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {mode === 'week' ? <WeekView /> : <MonthView />}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleText: { fontSize: 13, fontWeight: '500' },
})