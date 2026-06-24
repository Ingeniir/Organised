import { useThemeColor } from '@/hooks/use-theme-color'
import { useEvents } from '@/src/features/calendar/useEvents'
import dayjs from '@/src/lib/day'
import { CalendarEvent } from '@/src/types/events'
import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { ThemedText } from '../themed-text'


interface Props {
  onSelectDate?: (date: string) => void
  onLongPressDate?: (date: string, hour: number | null) => void
  onEventPress?: (event: CalendarEvent) => void
}

export function MonthView({ onSelectDate, onLongPressDate, onEventPress }: Props) {
  const { width, height } = useWindowDimensions()
  const cellSizeWidth = (width - 32) / 7 // 32 = padding horizontal * 2
  const cellSizeHeight = (height - 32) / 7

  const [current, setCurrent] = useState(dayjs())
  const [selected, setSelected] = useState<number | null>(null)
  // const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')

  const from = current.startOf('month').toISOString()
  const to = current.endOf('month').toISOString()
  const { data: events = [] } = useEvents(from, to)

  const eventsByDay = events.reduce((acc, event) => {
    const day = dayjs(event.start_at).date()
    if (!acc[day]) acc[day] = []
    acc[day].push(event)
    return acc
  }, {} as Record<number, typeof events>)

  const startOfMonth = current.startOf('month')
  const daysInMonth = current.daysInMonth()
  const startOffset = startOfMonth.isoWeekday() - 1

  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => setCurrent(c => c.subtract(1, 'month'))}>
          <ThemedText style={styles.navBtn}>‹</ThemedText>
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold" style={styles.monthTitle}>
          {current.format('MMMM YYYY')}
        </ThemedText>
        <TouchableOpacity onPress={() => setCurrent(c => c.add(1, 'month'))}>
          <ThemedText style={styles.navBtn}>›</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((d, i) => (
          <ThemedText key={i} style={[styles.weekday, { color: mutedColor }]}>{d}</ThemedText>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          const isToday = day && current.date(day).isSame(dayjs(), 'day')
          const isSelected = selected === day && !isToday

          return (
            <View key={i} style={[styles.cell, { width: cellSizeWidth, height: cellSizeHeight }]}>
              {day && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.dayCircle,
                      isToday && styles.todayCircle,
                      isSelected && styles.selectedCircle,
                    ]}
                    onPress={() => {
                      const date = current.date(day).format('YYYY-MM-DD')
                      setSelected(day === selected ? null : day)
                      onSelectDate?.(date)
                    }}
                    onLongPress={() => {
                      const date = current.date(day).format('YYYY-MM-DD')
                      onLongPressDate?.(date, null)
                    }}
                    delayLongPress={400}
                  >
                    <ThemedText style={[styles.dayText, isToday && styles.todayText]}>
                      {day}
                    </ThemedText>
                  </TouchableOpacity>
                  <View style={styles.dots}>
                    {eventsByDay[day]?.slice(0, 3).map((e) => (
                      <TouchableOpacity key={e.id} onPress={() => onEventPress?.(e)}>
                        <View style={[styles.dot, { backgroundColor: e.color }]} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: { fontSize: 24, paddingHorizontal: 8 },
  monthTitle: { fontSize: 18, textTransform: 'capitalize' },
  weekdays: { flexDirection: 'row', marginBottom: 8 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    alignItems: 'center',
    paddingTop: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  todayCircle: { backgroundColor: '#6366f1' },
  todayText: { color: '#fff', fontWeight: '700' },
  selectedCircle: {
    borderWidth: 1.5,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  dayText: { fontSize: 14 },
  dots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
})