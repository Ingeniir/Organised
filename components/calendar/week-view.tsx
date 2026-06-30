import { HOLIDAYS } from '@/constants/holidays'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Palette } from '@/src/constants/colors'
import { useEvents } from '@/src/features/calendar/useEvents'
import { extractProf } from '@/src/features/ical/parser'
import { usePresences, useSyncPresence } from '@/src/features/presence/usePresence'
import { useProfs } from '@/src/features/profs/useProf'
import dayjs from '@/src/lib/day'
import { useSettingsStore } from '@/src/stores/settingsStore'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../themed-text'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SCREEN_WIDTH = Dimensions.get('window').width
const ROW_HEIGHT = 56 
const DEFAULT_SCROLL_Y = 7 * ROW_HEIGHT 

interface Props {
  onLongPressDate?: (date: string, hour: number) => void
  onEventPress?: (event: any) => void
  onIcalEventPress?: (event: any) => void
  icalEvents?: any[]
  onRangeChange?: (firstDate: string, lastDate: string, offset: number) => void
}

interface UnifiedEvent {
  id: string
  title: string
  start: dayjs.Dayjs
  end: dayjs.Dayjs
  isLocal: boolean
  color?: string
  type?: 'CM' | 'TD' | 'CTE' | 'CC'
  location?: string
  description?: string
  prof?: string
  original: any
  colIndex?: number
  totalCols?: number
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
  const [now, setNow] = useState(dayjs())
  const { showIcal } = useSettingsStore()
  const { data: profs = [] } = useProfs()
  
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
    
    onRangeChange?.(firstDate, lastDate, currentWeekOffset)
  }, [currentWeekOffset])

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

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

  const indicatorTop = (now.hour() + now.minute() / 60) * ROW_HEIGHT

  // Presences
  const { mutate: syncPresence } = useSyncPresence()
  const { data: presences } = usePresences()

  useEffect(() => {
    if (showIcal && icalEvents.length > 0) {
      syncPresence(icalEvents.filter(e => !e.title.includes("fin des enseignements à 12h15")))
    }
  }, [icalEvents, showIcal])

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
          const isCurrentWeekDisplay = days.some(d => d.isSame(now, 'day'))

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
                <View style={styles.gridBody}>
                  <View style={styles.timeGutter}>
                    {HOURS.map((hour) => (
                      <View key={hour} style={styles.hourLabelContainer}>
                        <ThemedText style={[styles.hourLabel, { color: mutedColor }]}>
                          {`${hour}h`}
                        </ThemedText>
                      </View>
                    ))}
                  </View>

                  <View style={styles.weekDaysContainer}>
                    {days.map((day) => {
                      const dateStr = day.format('YYYY-MM-DD')
                      const isWeekend = day.isoWeekday() >= 6

                      const dayLocal: UnifiedEvent[] = events
                        .filter(e => dayjs(e.start_at).format('YYYY-MM-DD') === dateStr)
                        .map(e => ({
                          id: e.id,
                          title: e.title,
                          start: dayjs(e.start_at),
                          end: dayjs(e.end_at || dayjs(e.start_at).add(1, 'hour')),
                          color: e.color,
                          isLocal: true,
                          original: e
                        }))

                      const dayIcal: UnifiedEvent[] = showIcal ? icalEvents.filter(e => dayjs(e.start).format('YYYY-MM-DD') === dateStr)
                        .map(e => ({
                          id: e.uid,
                          title: e.title,
                          start: dayjs(e.start),
                          end: dayjs(e.end || dayjs(e.start).add(1, 'hour')),
                          type: e.type,
                          location: e.location,
                          description: e.description,
                          prof: e.prof,
                          isLocal: false,
                          original: e
                        })) : []

                      const dayEvents = [...dayLocal, ...dayIcal].sort((a, b) => a.start.diff(b.start))

                      let clusters: any[][] = []
                      dayEvents.forEach(evt => {
                        let added = false
                        for (let cluster of clusters) {
                          const overlaps = cluster.some(cEvt => 
                            evt.start.isBefore(cEvt.end) && evt.end.isAfter(cEvt.start)
                          )
                          if (overlaps) {
                            cluster.push(evt)
                            added = true
                            break
                          }
                        }
                        if (!added) clusters.push([evt])
                      })

                      clusters.forEach(cluster => {
                        const columns: any[][] = []
                        cluster.forEach(evt => {
                          let placed = false
                          for (let i = 0; i < columns.length; i++) {
                            const lastEvt = columns[i][columns[i].length - 1]
                            if (!evt.start.isBefore(lastEvt.end)) {
                              columns[i].push(evt)
                              evt.colIndex = i
                              placed = true
                              break
                            }
                          }
                          if (!placed) {
                            columns.push([evt])
                            evt.colIndex = columns.length - 1
                          }
                        })
                        cluster.forEach(evt => { evt.totalCols = columns.length })
                      })

                      return (
                        <View 
                          key={`${weekOffset}-${dateStr}`} 
                          style={[
                            styles.cellColumn, 
                            { borderLeftColor: borderColor },
                            isWeekend && { backgroundColor: '#6366f105' },
                            HOLIDAYS[dateStr] && { backgroundColor: '#f59e0b05' },
                          ]}
                        >
                          {HOURS.map((hour) => (
                            <TouchableOpacity
                              key={hour}
                              style={[styles.gridSlot, { borderTopColor: borderColor }]}
                              onLongPress={() => onLongPressDate?.(dateStr, hour)}
                              delayLongPress={400}
                              activeOpacity={1}
                            />
                          ))}

                          {dayEvents.map((e) => {
                            const startHour = e.start.hour()
                            const startMin = e.start.minute()
                            const durationMin = e.end.diff(e.start, 'minute')

                            const topOffset = (startHour + startMin / 60) * ROW_HEIGHT
                            const blockHeight = (durationMin / 60) * ROW_HEIGHT

                            const widthPct = 100 / (e.totalCols || 1)
                            const leftPct = (e.colIndex || 0) * widthPct

                            if (e.isLocal) {
                              const eventColor = e.color || '#3b82f6'
                              return (
                                <TouchableOpacity
                                  key={`local-${e.id}`}
                                  style={[
                                    styles.eventBlock, 
                                    { 
                                      position: 'absolute',
                                      top: topOffset + 1,
                                      height: blockHeight - 2,
                                      left: `${leftPct}%`,
                                      width: `${widthPct}%`,
                                      backgroundColor: eventColor + '33',
                                      borderLeftWidth: 3,
                                      borderLeftColor: eventColor
                                    }
                                  ]}
                                  onPress={() => onEventPress?.(e.original)}
                                >
                                  <ThemedText style={[styles.eventTitle, { color: eventColor }]} numberOfLines={1}>
                                    {e.title}
                                  </ThemedText>
                                </TouchableOpacity>
                              )
                            } else {
                              const colors = getEventColors(e.type ?? 'CM', e.title)
                              const matchingPresence = presences?.find(p => p.uid === e.original.uid)
                              e.original.status = matchingPresence ? matchingPresence.status : 'absent'
                            
                              e.prof = extractProf(e.description || '', profs) ?? ''
                              e.original.prof = e.prof

                              return (
                                <TouchableOpacity
                                  key={`ical-${e.id}`}
                                  style={[
                                    styles.eventBlock, 
                                    { 
                                      position: 'absolute',
                                      top: topOffset + 1,
                                      height: blockHeight - 2,
                                      left: `${leftPct}%`,
                                      width: `${widthPct}%`,
                                      backgroundColor: colors.background 
                                    }
                                  ]}
                                  onPress={() => onIcalEventPress?.(e.original)}
                                >
                                  <ThemedText style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={2}>
                                    {e.title} {e.type && !e.title.includes('fin des enseignements') ? `(${e.type})` : ''}
                                  </ThemedText>
                                  
                                  {blockHeight > 35 && (
                                    <View style={styles.metaContainer}>
                                      <View style={styles.metaRow}>
                                        {/* Section Salle (à gauche) */}
                                        {e.location ? (
                                          <View style={styles.metaItem}>
                                            <Ionicons name="location" size={10} style={{ color: colors.foreground, marginRight: 2 }} />
                                            <ThemedText style={[styles.eventMeta, { color: colors.foreground }]} numberOfLines={1}>
                                              {e.location}
                                            </ThemedText>
                                          </View>
                                        ) : <View />}

                                        {/* Section Prof (à droite) */}
                                        <View style={{ position: 'absolute', right: 4, top: 10, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                          {e.prof ? (
                                            <Ionicons name="person" size={10} style={{ color: colors.foreground }} />
                                          ) : null}
                                          {e.original.status && !e.original.title.includes("fin des enseignements à 12h15") && (
                                            <Ionicons name={`${e.original.status === "present" ? 'checkmark-outline' : 'close-outline'}`} />
                                          )}
                                        </View>
                                      </View>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              )
                            }
                          })}
                        </View>
                      )
                    })}

                    {isCurrentWeekDisplay && (
                      <View style={[styles.globalTimeIndicator, { top: indicatorTop }]}>
                        <View style={styles.indicatorCircle} />
                        <View style={styles.indicatorLine} />
                      </View>
                    )}
                  </View>
                </View>
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
  gridBody: {
    flexDirection: 'row',
  },
  hourLabelContainer: {
    height: ROW_HEIGHT,
  },
  hourLabel: {
    fontSize: 11,
    textAlign: 'right',
    paddingRight: 8,
    marginTop: -6,
  },
  weekDaysContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  cellColumn: {
    flex: 1,
    borderLeftWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  gridSlot: {
    height: ROW_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  eventBlock: {
    marginHorizontal: 0.5,
    borderRadius: 4,
    padding: 3,
    overflow: 'hidden',
  },
  eventTitle: { fontSize: 9, fontWeight: '700', lineHeight: 11 },
  metaContainer: { 
    marginTop: 2
  },
  metaRow: {
    position: "relative",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  eventMeta: { fontSize: 8, opacity: 0.8 },
  globalTimeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 99,
    height: 10,
    transform: [{ translateY: -5 }],
    pointerEvents: 'none',
  },
  indicatorCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a6a6aa',
    position: 'absolute',
    left: -4,
    zIndex: 100,
  },
  indicatorLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#d1d1d6',
  },
})