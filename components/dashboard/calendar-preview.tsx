import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useEvents } from '@/src/features/calendar/useEvents'
import dayjs from '@/src/lib/day'
import { StyleSheet, View } from 'react-native'

interface Props {
    width: number
    height: number
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function CalendarPreview({ width, height}: Props) {
  const current = dayjs()
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

  const startOffset = current.startOf('month').isoWeekday() - 1
  const daysInMonth = current.daysInMonth()
  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const SCALE = 1.2
  const innerWidth = width / SCALE
  const innerHeight = height / SCALE

  return (
    <View style={[styles.clipBox, { width: width, height: height - 90 }]}>
      <View style={[styles.inner, { width: innerWidth, height: innerHeight, transform: [{ scale: SCALE }] }]}>

        {/* Mois titre */}
        <ThemedText style={styles.monthTitle}>
          {current.format('MMMM YYYY')}
        </ThemedText>

        {/* Jours semaine */}
        <View style={styles.weekdays}>
          {WEEKDAYS.map((d, i) => (
            <ThemedText key={i} style={[styles.weekday, { color: mutedColor }]}>{d}</ThemedText>
          ))}
        </View>

        {/* Grille */}
        <View style={styles.grid}>
          {cells.map((day, i) => {
            const isToday = day && current.date(day).isSame(dayjs(), 'day')
            return (
              <View key={i} style={styles.cell}>
                {day && (
                  <>
                    <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
                      <ThemedText style={[styles.dayText, isToday && styles.todayText]}>
                        {day}
                      </ThemedText>
                    </View>
                    <View style={styles.dots}>
                      {eventsByDay[day]?.slice(0, 2).map((e) => (
                        <View key={e.id} style={[styles.dot, { backgroundColor: e.color }]} />
                      ))}
                    </View>
                  </>
                )}
              </View>
            )
          })}
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  clipBox: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  inner: {
    transformOrigin: 'top left',
    padding: 16,
    gap: 6,
  },
  monthTitle: { fontSize: 18, fontWeight: '600', textTransform: 'capitalize' },
  weekdays: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  todayCircle: { backgroundColor: '#6366f1' },
  dayText: { fontSize: 11 },
  todayText: { color: '#fff', fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 1, marginTop: 1 },
  dot: { width: 3, height: 3, borderRadius: 2 },
})