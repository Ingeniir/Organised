import { useThemeColor } from '@/hooks/use-theme-color'
import { useEvents } from '@/src/features/calendar/useEvents'
import dayjs from '@/src/lib/day'
import { CalendarEvent } from '@/src/types/events'
import { useRef, useState } from 'react'
import { Dimensions, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../themed-text'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

interface Props {
  onLongPressDate?: (date: string, hour: number) => void
  onEventPress?: (event: CalendarEvent) => void
}

export function WeekView({ onLongPressDate, onEventPress }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const WEEKS = [-2, -1, 0, 1, 2]

  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')

  const getDays = (offset: number) => {
    return Array.from({ length: 7 }, (_, i) =>
      dayjs().add(offset, 'week').startOf('isoWeek').add(i, 'day')
    )
  }

  const from = dayjs().add(currentWeekOffset - 2, 'week').startOf('isoWeek').toISOString()
  const to = dayjs().add(currentWeekOffset + 2, 'week').endOf('isoWeek').toISOString()
  const { data: events = [] } = useEvents(from, to)

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={WEEKS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={2}
        getItemLayout={(_, index) => ({
          length: Dimensions.get('window').width,
          offset: Dimensions.get('window').width * index,
          index,
        })}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width)
          setCurrentWeekOffset(WEEKS[index])
        }}
        renderItem={({ item: weekOffset }) => {
          const days = getDays(weekOffset)
          return (
            <View style={{ width: Dimensions.get('window').width }}>
              {/* Header jours */}
              <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
                <View style={styles.timeGutter} />
                {days.map((day) => {
                  const isToday = dayjs().isSame(day, 'day')
                  const isSelected = selected === day.format('YYYY-MM-DD') && !isToday
                  return (
                    <TouchableOpacity
                      key={day.toString()}
                      style={styles.dayHeader}
                      onPress={() => setSelected(day.format('YYYY-MM-DD'))}
                    >
                      <ThemedText style={[styles.dayName, { color: mutedColor }]}>
                        {day.format('ddd')}
                      </ThemedText>
                      <View style={[
                        styles.dayCircle,
                        isToday && styles.todayCircle,
                        isSelected && styles.selectedCircle,
                      ]}>
                        <ThemedText style={[styles.dayNumber, isToday && styles.todayText]}>
                          {day.format('D')}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>

              {/* Grille */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {HOURS.map((hour) => (
                  <View key={hour} style={[styles.hourRow, { borderTopColor: borderColor }]}>
                    <ThemedText style={[styles.hourLabel, { color: mutedColor }]}>
                      {hour === 0 ? '' : `${hour}h`}
                    </ThemedText>
                    {days.map((day) => {
                      const dayEvents = events.filter(e =>
                        dayjs(e.start_at).isSame(day, 'day') &&
                        dayjs(e.start_at).hour() === hour
                      )
                      return (
                        <TouchableOpacity
                          key={day.toString()}
                          style={[styles.cell, { borderLeftColor: borderColor }]}
                          onLongPress={() => onLongPressDate?.(day.format('YYYY-MM-DD'), hour)}
                          delayLongPress={400}
                          activeOpacity={1}
                        >
                          {dayEvents.map(e => (
                            <TouchableOpacity
                              key={e.id}
                              style={[styles.eventBlock, { backgroundColor: e.color + '33' }]}
                              onPress={() => onEventPress?.(e)}
                            >
                              <ThemedText style={[styles.eventTitle, { color: e.color }]} numberOfLines={1}>
                                {e.title}
                              </ThemedText>
                            </TouchableOpacity>
                          ))}
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                ))}
              </ScrollView>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  timeGutter: { width: 44 },
  dayHeader: { flex: 1, alignItems: 'center', gap: 2 },
  dayName: { fontSize: 11, textTransform: 'uppercase' },
  dayNumber: { fontSize: 16, fontWeight: '500' },
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
  hourRow: {
    flexDirection: 'row',
    height: 56,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  hourLabel: {
    width: 44,
    fontSize: 11,
    textAlign: 'right',
    paddingRight: 8,
    marginTop: -8,
  },
  cell: {
    flex: 1,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  eventBlock: {
    margin: 1,
    borderRadius: 4,
    padding: 2,
    flex: 1,
  },
  eventTitle: { fontSize: 10, fontWeight: '500' },
})