import { EventDetailModal } from '@/components/calendar/event-detail-modal'
import { EventModal } from '@/components/calendar/event-modal'
import { MonthView } from '@/components/calendar/month-view'
import { WeekView } from '@/components/calendar/week-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useICalEvents } from '@/src/features/ical/useICalEvents'
import { useSettingsStore } from '@/src/stores/settingsStore'
import { useToastStore } from '@/src/stores/toastStore'
import { CalendarEvent } from '@/src/types/events'
import { ICalEvent } from '@/src/types/ical'
import BottomSheet from '@gorhom/bottom-sheet'
import dayjs from 'dayjs'
import { useMemo, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ViewMode = 'week' | 'month'

export default function PlanningScreen() {
  const [mode, setMode] = useState<ViewMode>('week')
  const [icalRange, setIcalRange] = useState({
    firstDate: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
    lastDate: dayjs().add(1, 'month').endOf('month').format('YYYY-MM-DD'),
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | ICalEvent | null>(null)
  const detailsSheetRef = useRef<BottomSheet>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const insets = useSafeAreaInsets()
  const activeBg = useThemeColor({ light: '#10b981ee', dark: '#6366f1ee' }, 'text')
  const inactiveBg = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'text')

  const { showICalL2, showICalL3, toggleICalL, showIcal, onShowICal } = useSettingsStore()
  const toast = useToastStore()
  const { data: icalL2 = [], isLoading: loadingL2 } = useICalEvents('L2', icalRange.firstDate, icalRange.lastDate, showICalL2)
  const { data: icalL3 = [], isLoading: loadingL3 } = useICalEvents('L3', icalRange.firstDate, icalRange.lastDate, showICalL3)

  const isLoading = loadingL2 || loadingL3

  const icalEvents = useMemo(() => [
    ...(showICalL2 ? icalL2 : []),
    ...(showICalL3 ? icalL3 : []),
  ], [showICalL2, showICalL3, icalL2, icalL3])

  const handleLongPress = (date: string, hour: number | null) => {
    setSelectedDate(date)
    setSelectedHour(hour)
    bottomSheetRef.current?.expand()
  }

  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event)
    detailsSheetRef.current?.expand()
  }

  const handleICalEventPress = (event: ICalEvent) => {
    setSelectedEvent(event)
    detailsSheetRef.current?.expand()
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topbarLeft}>
          <ThemedText type="defaultSemiBold">Planning</ThemedText>
          {isLoading && (
            <ActivityIndicator size="small" color="#6366f1" />
          )}
        </View>
        <View style={styles.topbarRight}>
          {mode === 'week' && (
            <TouchableOpacity
              style={[styles.icalBtn, { backgroundColor: showIcal ? '#10b98120' : '#6f6d6d' }]}
              onPress={() => {
                toggleICalL()
                toast.show({
                  variant: 'message',
                  icon: 'school',
                  message: `Affichage ${showICalL2 ? 'L3' : 'L2'}`,
                  duration: 2000,
                })
              }}
              onLongPress={() => onShowICal()}
              delayLongPress={200}
            >
              <ThemedText style={[styles.icalBtnText]}>
                {showICalL2 ? "L2" : "L3"}
              </ThemedText>
            </TouchableOpacity>
          )}
          {/* Toggle semaine/mois */}
          <View style={[styles.toggle, { backgroundColor: inactiveBg }]}>
            {(['week', 'month'] as ViewMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.toggleBtn, mode === m && { backgroundColor: "#10b98188" }]}
                onPress={() => {
                  setMode(m)
                  toast.show({
                    variant: 'message',
                    icon: 'calendar-month',
                    message: `Affichage mode ${m === 'week' ? 'Semaine' : 'Mois'}`
                  })
                }}
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
            onIcalEventPress={handleICalEventPress}
            icalEvents={icalEvents}
            onRangeChange={(firstDate, lastDate) => setIcalRange({ firstDate, lastDate })}
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
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8},
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8},
  icalBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  icalBtnText: { fontSize: 12, fontWeight: '600' },
})