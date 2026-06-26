import { useThemeColor } from '@/hooks/use-theme-color'
import { Palette } from '@/src/constants/colors'
import { useEvents } from '@/src/features/calendar/useEvents'
import dayjs from '@/src/lib/day'
import { CalendarEvent } from '@/src/types/events'
import { ICalEvent } from '@/src/types/ical'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../themed-text'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SCREEN_WIDTH = Dimensions.get('window').width
const ROW_HEIGHT = 56 
const DEFAULT_SCROLL_Y = 7 * ROW_HEIGHT 

interface Props {
  onLongPressDate?: (date: string, hour: number) => void
  onEventPress?: (event: CalendarEvent) => void
  onIcalEventPress?: (event: ICalEvent) => void
  icalEvents?: ICalEvent[]
  onRangeChange?: (firstDate: string, lastDate: string) => void
}

export function WeekView({ onLongPressDate, onEventPress, icalEvents = [], onIcalEventPress, onRangeChange }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  
  const flatListRef = useRef<FlatList>(null)
  const scrollRefs = useRef<Record<number, ScrollView | null>>({})
  const verticalScrollY = useRef(DEFAULT_SCROLL_Y)
  const initialScrollDone = useRef<Record<number, boolean>>({})
  
  // 🔥 Verrou anti-boucle infinie pour la synchronisation en temps réel
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
    onRangeChange?.(firstDate, lastDate)
  }, [currentWeekOffset])

  // 🔥 Synchronisation en temps réel optimisée
  const syncVerticalScroll = (y: number, originOffset: number) => {
    if (isSyncingRef.current) return
    isSyncingRef.current = true
    
    verticalScrollY.current = y
    pageData.forEach(offset => {
      if (offset !== originOffset) {
        scrollRefs.current[offset]?.scrollTo({ y, animated: false })
      }
    })

    // Libère le verrou immédiatement après l'exécution du scroll
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
        directionalLockEnabled={true} // Gardé ici : bloque le horizontal si on scroll verticalement
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
              {/* Header jours */}
              <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
                <View style={styles.timeGutter} />
                {days.map((day) => {
                  const dateStr = day.format('YYYY-MM-DD')
                  const isToday = dayjs().isSame(day, 'day')
                  const isSelected = selected === dateStr && !isToday
                  return (
                    <TouchableOpacity
                      key={`${weekOffset}-${dateStr}`}
                      style={styles.dayHeader}
                      onPress={() => setSelected(dateStr)}
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

              {/* Grille de la semaine */}
              <ScrollView 
                ref={el => { scrollRefs.current[weekOffset] = el }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16} // Permet un suivi fluide à 60fps
                
                // 🛠️ Nettoyage des verrous conflictuels ici
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
                      {hour === 0 ? '' : `${hour}h`}
                    </ThemedText>
                    {days.map((day) => {
                      const dateStr = day.format('YYYY-MM-DD')
                      const cellKey = `${dateStr}-${hour}`
                      const cellData = indexedEvents[cellKey] || { local: [], ical: [] }

                      return (
                        <TouchableOpacity
                          key={`${weekOffset}-${hour}-${dateStr}`}
                          style={[styles.cell, { borderLeftColor: borderColor }]}
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
                          
                          {cellData.ical.map(e => (
                            <TouchableOpacity
                              key={`${weekOffset}-${hour}-${dateStr}-${e.uid}`}
                              style={[styles.eventBlock, {
                                backgroundColor: e.source === 'L2' ? '#6366f133' : '#10b98133'
                              }]}
                              onPress={() => onIcalEventPress?.(e)}
                            >
                              <ThemedText
                                style={[styles.eventTitle, {
                                  color: e.source === 'L2' ? '#6366f1' : '#10b981'
                                }]}
                                numberOfLines={1}
                              >
                                {e.title}
                              </ThemedText>
                              {e.location && (
                                <ThemedText style={[styles.eventMeta, { color: e.source === 'L2' ? '#6366f1' : '#10b981' }]} numberOfLines={1}>
                                  📍 {e.location}
                                </ThemedText>
                              )}
                              {e.prof && (
                                <ThemedText style={[styles.eventMeta, { color: e.source === 'L2' ? '#6366f1' : '#10b981' }]} numberOfLines={1}>
                                  👤 {e.prof}
                                </ThemedText>
                              )}
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
  todayCircle: { backgroundColor: Palette.primary.light },
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
  eventMeta: { fontSize: 8, opacity: 0.8 },
})