import { HOLIDAYS } from '@/constants/holidays'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Palette } from '@/src/constants/colors'
import { useEvents } from '@/src/features/calendar/useEvents'
import { extractProf } from '@/src/features/ical/parser'
import dayjs from '@/src/lib/day'
import { useSettingsStore } from '@/src/stores/settingsStore'
import { CalendarEvent } from '@/src/types/events'
import { ICalEvent } from '@/src/types/ical'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../themed-text'

const HOURS = Array.from({ length: 24 }, (_, i) => i + 1)
const SCREEN_WIDTH = Dimensions.get('window').width
const ROW_HEIGHT = 56 
const DEFAULT_SCROLL_Y = 7 * ROW_HEIGHT 

interface Props {
  onLongPressDate?: (date: string, hour: number) => void
  onEventPress?: (event: CalendarEvent) => void
  onIcalEventPress?: (event: ICalEvent) => void
  icalEvents?: ICalEvent[]
  onRangeChange?: (firstDate: string, lastDate: string, offset: number) => void
}

const TYPE_COLORS: Record<string, { background: string; foreground: string }> = {
  CM: { background: '#10b98133', foreground: '#10b981' },
  TD: { background: '#b0b91033', foreground: '#b0b910' },
  CTE: { background: '#b93a1033', foreground: '#b93a10' },
  CC: { background: '#3b82f633', foreground: '#3b82f6' }
}

const getEventColors = (type: string, title: string) => {
  const upperTitle = title.toUpperCase()
  if (type === 'CC' || upperTitle.includes('CC') || upperTitle.includes('CONTRÔLE CONTINU') || upperTitle.includes('CONTROLE CONTINU')) {
    return TYPE_COLORS.CC
  }
  if (type === 'CTE' || upperTitle.includes('CT') || upperTitle.includes('CONTRÔLE TERMINAL') || upperTitle.includes('CONTROLE TERMINAL')) {
    return TYPE_COLORS.CTE
  }
  return TYPE_COLORS[type] || TYPE_COLORS.CM
}

export function WeekView({ onLongPressDate, onEventPress, icalEvents = [], onIcalEventPress, onRangeChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const { showIcal, profs } = useSettingsStore()
  
  const flatListRef = useRef<FlatList>(null)
  const scrollRefs = useRef<Record<number, ScrollView | null>>({})
  const verticalScrollY = useRef(DEFAULT_SCROLL_Y)
  const initialScrollDone = useRef<Record<number, boolean>>({})
  const isSyncingRef = useRef(false)

  const pageData = [-1, 0, 1]

  const borderColor = useThemeColor({}, 'border')
  const mutedColor = useThemeColor({ light: Palette.textMuted.light, dark: Palette.textMuted.dark }, 'text')

  const getDays = (offset: number) =>
    Array.from({ length: 7 }, (_, i) =>
      dayjs().add(currentWeekOffset + offset, 'week').startOf('isoWeek').add(i, 'day')
    )

  const from = dayjs().add(currentWeekOffset - 2, 'week').startOf('isoWeek').toISOString()
  const to = dayjs().add(currentWeekOffset + 2, 'week').endOf('isoWeek').toISOString()
  const { data: events = [] } = useEvents(from, to)

  useEffect(() => {
    const currentVisibleDate = dayjs().add(currentWeekOffset, 'week')
    const firstDate = currentVisibleDate.subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
    const lastDate = currentVisibleDate.add(1, 'month').endOf('month').format('YYYY-MM-DD')
    
    // Modifiez cette ligne pour ajouter currentWeekOffset :
    onRangeChange?.(firstDate, lastDate, currentWeekOffset)
  }, [currentWeekOffset])

  const syncVerticalScroll = (y: number, originOffset: number) => {
    if (isSyncingRef.current) return
    isSyncingRef.current = true
    
    verticalScrollY.current = y
    pageData.forEach(offset => {
      if (offset !== originOffset) {
        scrollRefs.current[offset]?.scrollTo({ y, animated: false })
      }
    })

    setTimeout(() => {
      isSyncingRef.current = false
    }, 0)
  }

  const indexedEvents = useMemo(() => {
    const map: Record<string, { local: CalendarEvent[]; ical: ICalEvent[] }> = {}
    events.forEach(e => {
      const start = dayjs(e.start_at)
      const key = `${start.format('YYYY-MM-DD')}-${start.hour()}`
      if (!map[key]) map[key] = { local: [], ical: [] }
      map[key].local.push(e)
    })
    icalEvents.forEach(e => {
      const start = dayjs(e.start)
      const key = `${start.format('YYYY-MM-DD')}-${start.hour()}`
      if (!map[key]) map[key] = { local: [], ical: [] }
      map[key].ical.push(e)
    })
    return map
  }, [events, icalEvents])

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pageData}
        horizontal
        pagingEnabled
        directionalLockEnabled={true}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={1}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={e => {
          const pageIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
          if (pageIndex === 0) {
            setCurrentWeekOffset(o => o - 1)
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: 1, animated: false })
              scrollRefs.current[0]?.scrollTo({ y: verticalScrollY.current, animated: false })
            }, 0)
          } else if (pageIndex === 2) {
            setCurrentWeekOffset(o => o + 1)
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: 1, animated: false })
              scrollRefs.current[0]?.scrollTo({ y: verticalScrollY.current, animated: false })
            }, 0)
          }
        }}
        renderItem={({ item: weekOffset }) => {
          const days = getDays(weekOffset)
          return (
            <View style={{ width: SCREEN_WIDTH }}>
              <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
                <View style={styles.timeGutter} />
                {days.map((day) => {
                  const dateStr = day.format('YYYY-MM-DD')
                  const isToday = dayjs().isSame(day, 'day')
                  const isSelected = selected === dateStr && !isToday
                  const isWeekend = day.isoWeekday() >= 6
                  const holiday = HOLIDAYS[dateStr]
                  const isSpecial = isWeekend || !!holiday

                  return (
                    <TouchableOpacity
                      key={`${weekOffset}-${dateStr}`}
                      style={[styles.dayHeader]}
                      onPress={() => setSelected(dateStr)}
                    >
                      <ThemedText style={[
                        styles.dayName,
                        { color: isSpecial ? (holiday ? '#f59e0b' : mutedColor) : mutedColor }
                      ]}>
                        {holiday ? holiday.slice(0, 6) : day.format('ddd')}
                      </ThemedText>
                      <View style={[
                        styles.dayCircle,
                        isToday && styles.todayCircle,
                        isSelected && styles.selectedCircle,
                        isWeekend && !isToday && { backgroundColor: '#6366f110' },
                      ]}>
                        <ThemedText style={[
                          styles.dayNumber,
                          isToday && styles.todayText,
                          isWeekend && !isToday && { color: mutedColor },
                          holiday && !isToday && { color: '#f59e0b' },
                        ]}>
                          {day.format('D')}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <ScrollView 
                ref={el => { scrollRefs.current[weekOffset] = el }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={e => syncVerticalScroll(e.nativeEvent.contentOffset.y, weekOffset)}
                onLayout={() => {
                  if (!initialScrollDone.current[weekOffset]) {
                    initialScrollDone.current[weekOffset] = true
                    setTimeout(() => {
                      scrollRefs.current[weekOffset]?.scrollTo({ y: verticalScrollY.current, animated: false })
                    }, 10)
                  }
                }}
              >
                {HOURS.map((hour) => (
                  <View key={`${weekOffset}-${hour}`} style={[styles.hourRow, { borderTopColor: borderColor }]}>
                    <ThemedText style={[styles.hourLabel, { color: mutedColor }]}>
                      {`${hour}h`}
                    </ThemedText>
                    {days.map((day) => {
                      const dateStr = day.format('YYYY-MM-DD')
                      const cellKey = `${dateStr}-${hour}`
                      const cellData = indexedEvents[cellKey] || { local: [], ical: [] }
                      const isWeekend = day.isoWeekday() >= 6

                      return (
                        <TouchableOpacity
                          key={`${weekOffset}-${hour}-${dateStr}`}
                          style={[
                            styles.cell,
                            { borderLeftColor: borderColor },
                            isWeekend && { backgroundColor: '#6366f108' },
                            HOLIDAYS[dateStr] && { backgroundColor: '#f59e0b08' },
                          ]}
                          onLongPress={() => onLongPressDate?.(dateStr, hour)}
                          delayLongPress={400}
                          activeOpacity={1}
                        >
                          {cellData.local.map(e => (
                            <TouchableOpacity
                              key={`${weekOffset}-${e.id}`}
                              style={[styles.eventBlock, { backgroundColor: e.color + '33' }]}
                              onPress={() => onEventPress?.(e)}
                            >
                              <ThemedText style={[styles.eventTitle, { color: e.color }]} numberOfLines={1}>
                                {e.title}
                              </ThemedText>
                            </TouchableOpacity>
                          ))}
                          
                          {showIcal === true && cellData.ical.map(e => {
                            const colors = getEventColors(e.type ?? 'CM', e.title)
                            e.prof = extractProf(e.description, profs) ?? ''
                            return (
                              <TouchableOpacity
                                key={`${weekOffset}-${hour}-${dateStr}-${e.uid}`}
                                style={[styles.eventBlock, { backgroundColor: colors.background }]}
                                onPress={() => onIcalEventPress?.(e)}
                              >
                                <ThemedText
                                  style={[styles.eventTitle, { color: colors.foreground }]}
                                  numberOfLines={1}
                                >
                                  {e.title} ({e.type})
                                </ThemedText>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 6 }}>
                                  {e.location && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4}}>
                                      <Ionicons name="location" size={10} style={{ color: colors.foreground }} />
                                      <ThemedText style={[styles.eventMeta, { color: colors.foreground }]} numberOfLines={1}>
                                        {e.location}
                                      </ThemedText>
                                    </View>
                                  )}
                                  {e.prof && (
                                    <Ionicons name="person" size={10} style={{ color: colors.foreground }} />
                                  )}
                                </View>
                              </TouchableOpacity>
                            )
                          })}
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
  todayCircle: { backgroundColor: "#10b981ee" },
  todayText: { color: '#fff', fontWeight: '700' },
  selectedCircle: {
    borderWidth: 1.5,
    borderColor: Palette.primary.light,
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
    lineHeight: 14,
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
  eventMeta: { fontSize: 8, opacity: 0.8 },
  holidayLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
})