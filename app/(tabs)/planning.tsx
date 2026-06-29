import { EventDetailModal } from '@/components/calendar/event-detail-modal'
import { EventModal } from '@/components/calendar/event-modal'
import { MonthView } from '@/components/calendar/month-view'
import { WeekView } from '@/components/calendar/week-view'
import { ProfsManagementModal } from '@/components/settings/prof-modal'
import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { ThemedTouchable } from '@/components/themed-touchable'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useICalEvents } from '@/src/features/ical/useICalEvents'
import { scheduleICalNotifications } from '@/src/features/notifications/useNotifications'
import { useSettingsStore } from '@/src/stores/settingsStore'
import { useToastStore } from '@/src/stores/toastStore'
import { CalendarEvent } from '@/src/types/events'
import { ICalEvent } from '@/src/types/ical'
import BottomSheet from '@gorhom/bottom-sheet'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ViewMode = 'week' | 'month'

export default function PlanningScreen() {
  const [mode, setMode] = useState<ViewMode>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)
  const [weekKey, setWeekKey] = useState(0)
  const [monthKey, setMonthKey] = useState(0)
  const [icalRange, setIcalRange] = useState({
    firstDate: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
    lastDate: dayjs().add(1, 'month').endOf('month').format('YYYY-MM-DD'),
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | ICalEvent | null>(null)
  const detailsSheetRef = useRef<BottomSheet>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const profsSheetRef = useRef<BottomSheet>(null)
  const insets = useSafeAreaInsets()
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

  useEffect(() => {
    if (icalEvents.length > 0) {
      scheduleICalNotifications(icalEvents)
    }
  }, [icalEvents])

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

  const handleResetToToday = (mode: 'week' | 'month') => {
    if (mode === 'week') {
      setWeekOffset(0)
      setWeekKey(prev => prev + 1)
    } else {
      setMonthOffset(0)
      setMonthKey(prev => prev + 1)
    }
    toast.show({
      variant: 'message',
      icon: 'calendar-today',
      message: "Retour à aujourd'hui",
      duration: 1500
    })
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topbarLeft}>
          <ThemedText type="defaultSemiBold">Planning</ThemedText>
          {isLoading && (
            <ActivityIndicator size="small" color="#6366f1" />
          )}
          {(weekOffset !== 0 || monthOffset !== 0) && (
            <TouchableOpacity style={styles.todayBtn} onPress={() => handleResetToToday(mode)}>
              <ThemedText style={styles.todayBtnText}>Aujourd&#39;hui</ThemedText>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.topbarRight}>
          {mode === 'week' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <ThemedTouchable variant="ghost" onPress={
                () => profsSheetRef.current?.expand()
              }>
                <ThemedIcon name="person" size={20} />
              </ThemedTouchable>
              <TouchableOpacity
                style={[styles.icalBtn, { backgroundColor: showIcal && showICalL2 ? '#10b98120' : showICalL3 ? '#b0b91020' : '#6f6d6d' }]}
                onPress={() => {
                  toggleICalL()
                  toast.show({
                    variant: 'message',
                    icon: 'school',
                    message: `Affichage ${showICalL2 ? 'L3' : 'L2'}`,
                    duration: 2000,
                  })
                }}
                onLongPress={() => {
                  onShowICal()
                  if (showIcal) {
                    toast.show({
                      variant: 'message',
                      icon: 'school',
                      message: 'Evênement iCal désativé'
                    })
                  } else {
                    toast.show({
                      variant: 'message',
                      icon: 'school',
                      message: 'Evênement iCal activé'
                    })
                  }
                }}
                delayLongPress={200}
              >
                <ThemedText style={[styles.icalBtnText]}>
                  {showICalL2 ? "L2" : "L3"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
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
            key={weekKey}
            onLongPressDate={handleLongPress}
            onEventPress={handleEventPress}
            onIcalEventPress={handleICalEventPress}
            icalEvents={icalEvents}
            onRangeChange={(firstDate, lastDate, offset) => {
              setIcalRange({ firstDate, lastDate })
              if (offset !== undefined) setWeekOffset(offset)
            }}
          /> 
        : <MonthView
            key={monthKey}
            onSelectDate={setSelectedDate} 
            onLongPressDate={handleLongPress}
            onEventPress={handleEventPress}
            monthOffset={monthOffset}
            setMonthOffset={setMonthOffset}
          />
      }

      <EventDetailModal ref={detailsSheetRef} event={selectedEvent} />

      <EventModal ref={bottomSheetRef} selectedDate={selectedDate} selectedHour={selectedHour} />

      <ProfsManagementModal ref={profsSheetRef} />
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
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12},
  icalBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  icalBtnText: { fontSize: 12, fontWeight: '600' },
  todayBtn: {
    backgroundColor: '#10b98122',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b98144',
  },
  todayBtnText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
})