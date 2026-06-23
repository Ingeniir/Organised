import { useThemeColor } from '@/hooks/use-theme-color'
import dayjs from '@/src/lib/day'
import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../themed-text'


export function MonthView() {
  const [selected, setSelected] = useState<number | null>(null)
  const [current, setCurrent] = useState(dayjs())
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')

  const startOfMonth = current.startOf('month')
  const daysInMonth = current.daysInMonth()
  const startOffset = startOfMonth.isoWeekday() - 1 // lundi = 0

  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  const selectedDay = (day: number) => {
      if (day === selected) {
        setSelected(null)
        return
      }
      setSelected(day)
  }

  return (
    <View style={styles.container}>
      {/* Navigation */}
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

      {/* Jours de la semaine */}
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
                <TouchableOpacity
                  style={[
                    styles.dayCircle,
                    isToday && styles.todayCircle,
                    selected === day && !isToday && styles.selectedCircle,
                  ]}
                  onPress={() => selectedDay(day)}
                >
                  <ThemedText style={[
                    styles.dayText,
                    isToday && styles.todayText,
                  ]}>
                    {day}
                  </ThemedText>
                </TouchableOpacity>
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
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  todayCircle: { backgroundColor: '#6366f1' },
  selectedCircle: {
    borderWidth: 1.5,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  dayText: { fontSize: 14 },
  todayText: { color: '#fff', fontWeight: '600' },
})