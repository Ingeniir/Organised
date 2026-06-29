import { HOLIDAYS } from '@/constants/holidays'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useEvents } from '@/src/features/calendar/useEvents'
import dayjs from '@/src/lib/day'
import { CalendarEvent } from '@/src/types/events'
import React, { useRef, useState } from 'react'
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { ThemedText } from '../themed-text'

const SCREEN_WIDTH = Dimensions.get('window').width

interface Props {
  onSelectDate?: (date: string) => void
  onLongPressDate?: (date: string, hour: number | null) => void
  onEventPress?: (event: CalendarEvent) => void
  monthOffset: number
  setMonthOffset: (monthOffset: number) => void
}

export function MonthView({ onSelectDate, onLongPressDate, onEventPress, monthOffset, setMonthOffset }: Props) {
  const { width, height } = useWindowDimensions()
  const cellSizeWidth = (width - 32) / 7
  const cellSizeHeight = (height - 32) / 7

  
  const [selected, setSelected] = useState<number | null>(null)
  const flatListRef = useRef<FlatList>(null)

  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')

  // Mois actuel affiché (celui du centre)
  const currentMonth = dayjs().add(monthOffset, 'month')
  const from = currentMonth.startOf('month').toISOString()
  const to = currentMonth.endOf('month').toISOString()
  const { data: events = [] } = useEvents(from, to)

  // Regroupement des événements par jour pour le mois courant
  const eventsByDay = events.reduce((acc, event) => {
    const day = dayjs(event.start_at).date()
    if (!acc[day]) acc[day] = []
    acc[day].push(event)
    return acc
  }, {} as Record<number, typeof events>)

  const pages = [-1, 0, 1]

  const renderMonth = (relativeOffset: number) => {
    const month = dayjs().add(monthOffset + relativeOffset, 'month')
    const startOfMonth = month.startOf('month')
    const daysInMonth = month.daysInMonth()
    const startOffset = startOfMonth.isoWeekday() - 1

    const cells = [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]

    const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

    return (
      <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 16 }}>
        {/* Jours de la semaine */}
        <View style={styles.weekdays}>
          {WEEKDAYS.map((d, i) => (
            <ThemedText key={i} style={[styles.weekday, { color: mutedColor }]}>
              {d}
            </ThemedText>
          ))}
        </View>

        {/* Grille des jours */}
        <View style={styles.grid}>
          {cells.map((day, i) => {
            const dateObj = day ? month.date(day) : null
            const dateStr = dateObj ? dateObj.format('YYYY-MM-DD') : ''
            const isHoliday = day && HOLIDAYS[dateStr] !== undefined
            const isToday = day && dateObj?.isSame(dayjs(), 'day')
            const isSelected = selected === day && !isToday && month.isSame(currentMonth, 'month')

            return (
              <View key={i} style={[styles.cell, { width: cellSizeWidth, height: cellSizeHeight }]}>
                {day && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.dayCircle,
                        isToday && styles.todayCircle,
                        isSelected && styles.selectedCircle,
                        isHoliday && !isToday && styles.holidayCircle,
                      ]}
                      onPress={() => {
                        const date = month.date(day).format('YYYY-MM-DD')
                        setSelected(day === selected ? null : day)
                        onSelectDate?.(date)
                      }}
                      onLongPress={() => {
                        const date = month.date(day).format('YYYY-MM-DD')
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

  return (
    <View style={styles.container}>
      {/* titre */}
      <View style={styles.nav}>
        <ThemedText type="defaultSemiBold" style={styles.monthTitle}>
          {currentMonth.format('MMMM YYYY')}
        </ThemedText>
      </View>

      {/* Swipe */}
      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={1}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const pageIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
          if (pageIndex === 0) {
            // Swipe vers la gauche
            setMonthOffset(monthOffset - 1)
            setTimeout(() => flatListRef.current?.scrollToIndex({ index: 1, animated: false }), 0)
          } else if (pageIndex === 2) {
            // Swipe vers la droite
            setMonthOffset(monthOffset + 1)
            setTimeout(() => flatListRef.current?.scrollToIndex({ index: 1, animated: false }), 0)
          }
        }}
        renderItem={({ item: relativeOffset }) => renderMonth(relativeOffset)}
        keyExtractor={(item) => `month-${item}`}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  navBtn: { fontSize: 24, paddingHorizontal: 8 },
  monthTitle: { fontSize: 18, textTransform: 'capitalize' },
  monthHeader: {
    alignItems: 'center',
    marginVertical: 8,
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
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
  todayCircle: { backgroundColor: '#10b981' },
  todayText: { color: '#fff', fontWeight: '700' },
  selectedCircle: {
    borderWidth: 1.5,
    borderColor: '#10b981',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  holidayCircle: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  dayText: { fontSize: 14 },
  dots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
})