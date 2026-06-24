import { EventDetailModal } from '@/components/calendar/event-detail-modal'
import { EventModal } from '@/components/calendar/event-modal'
import { MonthView } from '@/components/calendar/month-view'
import { WeekView } from '@/components/calendar/week-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import { CalendarEvent } from '@/src/types/events'
import BottomSheet from '@gorhom/bottom-sheet'
import { useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ViewMode = 'week' | 'month'

export default function PlanningScreen() {
  const [mode, setMode] = useState<ViewMode>('week')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const detailsSheetRef = useRef<BottomSheet>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const insets = useSafeAreaInsets()
  const activeBg = useThemeColor({ light: '#6366f1', dark: '#6366f1' }, 'text')
  const inactiveBg = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'text')

  const handleLongPress = (date: string, hour: number | null) => {
    setSelectedDate(date)
    setSelectedHour(hour)
    bottomSheetRef.current?.expand()
  }

  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event)
    detailsSheetRef.current?.expand()
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <ThemedText type="defaultSemiBold">Planning</ThemedText>
        <View style={styles.topbarRight}>
          {/* Toggle semaine/mois */}
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
      </View>

      {mode === 'week' 
        ? <WeekView 
            onLongPressDate={handleLongPress}
            onEventPress={handleEventPress}
          /> 
        : <MonthView 
            onSelectDate={setSelectedDate} 
            onLongPressDate={handleLongPress}
            onEventPress={handleEventPress}
          />
      }

      <EventDetailModal ref={detailsSheetRef} event={selectedEvent} />

      <EventModal ref={bottomSheetRef} selectedDate={selectedDate} selectedHour={selectedHour} />
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
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 12},
})