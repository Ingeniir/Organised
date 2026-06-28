import { ThemedText } from '@/components/themed-text';
import { HOLIDAYS } from '@/constants/holidays';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEvents } from '@/src/features/calendar/useEvents';
import { useICalEvents } from '@/src/features/ical/useICalEvents';
import dayjs from '@/src/lib/day';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { StyleSheet, View } from 'react-native';

interface Props {
  width: number
  height: number
}

const DAYS = Array.from({ length: 7 }, (_, i) =>
  dayjs().startOf('isoWeek').add(i, 'day')
)

function getContinuousHours(events: any[], icalEvents: any[]) {
  let minHour = 8
  let maxHour = 16 

  const allHours: number[] = []
  events.forEach(e => allHours.push(dayjs(e.start_at).hour()))
  icalEvents.forEach(e => allHours.push(dayjs(e.start).hour()))

  if (allHours.length > 0) {
    minHour = Math.min(...allHours, 8)
    maxHour = Math.max(...allHours, 17) 
  }

  return Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i)
}

const TYPE_COLORS: Record<string, { background: string; foreground: string }> = {
  CM: { background: '#10b98115', foreground: '#10b981' },
  TD: { background: '#b0b91018', foreground: '#b0b910' },
  CTE: { background: '#ef444418', foreground: '#ef4444' },
  CC: { background: '#3b82f618', foreground: '#3b82f6' }
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

export function WeekPreview({ width, height }: Props) {
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'text')
  const todayBg = useThemeColor({ light: '#10b98108', dark: '#10b98110' }, 'background')
  const gridBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  
  const { showIcal, showICalL2, showICalL3 } = useSettingsStore()

  const from = dayjs().startOf('isoWeek').toISOString()
  const to = dayjs().endOf('isoWeek').toISOString()
  
  const { data: events = [] } = useEvents(from, to)

  const fromDate = dayjs().startOf('isoWeek').format('YYYY-MM-DD')
  const toDate = dayjs().endOf('isoWeek').format('YYYY-MM-DD')

  const { data: icalL2 = [] } = useICalEvents('L2', fromDate, toDate, showICalL2)
  const { data: icalL3 = [] } = useICalEvents('L3', fromDate, toDate, showICalL3)

  const icalEvents = showIcal
    ? [...(showICalL2 ? icalL2 : []), ...(showICalL3 ? icalL3 : [])]
    : []

  const displayHours = getContinuousHours(events, icalEvents)
  const minHour = displayHours[0] || 8

  const ROW_H = 38 
  const HEADER_H = 48
  const GUTTER_W = 28
  const colW = (width - GUTTER_W) / 7

  const getEventLayout = (startAt: string, endAt: string) => {
    const start = dayjs(startAt)
    const end = dayjs(endAt)
    
    const gridStart = start.startOf('day').add(minHour, 'hour')
    const minutesFromStart = start.diff(gridStart, 'minute')
    const durationMinutes = end.diff(start, 'minute')

    return {
      top: (minutesFromStart / 60) * ROW_H,
      height: (durationMinutes / 60) * ROW_H,
    }
  }

  return (
    <View style={[styles.clipBox, { width, height, backgroundColor: gridBg }]}>

      <View style={[styles.headerRow, { height: HEADER_H, borderBottomColor: borderColor }]}>
        <View style={{ width: GUTTER_W }} />
        {DAYS.map((day) => {
          const dateStr = day.format('YYYY-MM-DD')
          const isToday = dayjs().isSame(day, 'day')
          const holiday = HOLIDAYS[dateStr]
          const isWeekend = day.isoWeekday() >= 6

          return (
            <View key={day.toString()} style={[styles.dayCol, { width: colW }]}>
              <ThemedText 
                style={[
                  styles.dayName, 
                  { color: holiday ? '#f59e0b' : mutedColor }
                ]}
                numberOfLines={1}
              >
                {holiday ? 'Férié' : day.format('dd')[0]}
              </ThemedText>
              <View style={[styles.dayCircle, isToday && { backgroundColor: '#10b981' }]}>
                <ThemedText style={[styles.dayNum, isToday && styles.todayNum, isWeekend && !isToday && { color: mutedColor }]}>
                  {day.format('D')}
                </ThemedText>
              </View>
            </View>
          )
        })}
      </View>

      <View style={styles.gridContainer}>
        {displayHours.map((hour, index) => (
          <View key={hour} style={[styles.absoluteHourRow, { top: index * ROW_H, height: ROW_H, borderTopColor: borderColor }]}>
            <ThemedText style={[styles.hourLabel, { width: GUTTER_W, color: mutedColor }]}>
              {hour}h
            </ThemedText>
          </View>
        ))}

        <View style={[styles.columnsWrapper, { left: GUTTER_W }]}>
          {DAYS.map((day, dayIndex) => {
            const dateStr = day.format('YYYY-MM-DD')
            const isToday = dayjs().isSame(day, 'day')
            const isWeekend = day.isoWeekday() >= 6
            const isHoliday = !!HOLIDAYS[dateStr]

            const localEvts = events.filter(e => dayjs(e.start_at).format('YYYY-MM-DD') === dateStr)
            const icalEvts = icalEvents.filter(e => dayjs(e.start).format('YYYY-MM-DD') === dateStr)

            return (
              <View
                key={dateStr}
                style={[
                  styles.dayColumn,
                  { width: colW, left: dayIndex * colW, borderLeftColor: borderColor },
                  isToday && { backgroundColor: todayBg },
                  isWeekend && !isToday && { backgroundColor: '#6366f104' },
                  isHoliday && !isToday && { backgroundColor: '#f59e0b04' },
                ]}
              >
                {localEvts.map(e => {
                  const { top, height } = getEventLayout(e.start_at, e.end_at)
                  return (
                    <View
                      key={e.id}
                      style={[
                        styles.eventPill, 
                        styles.localPill, 
                        { top, height: height - 2, width: colW - 4, borderLeftColor: e.color || '#6366f1' }
                      ]}
                    >
                      <ThemedText style={[styles.eventText, { color: e.color || '#6366f1' }]} numberOfLines={1}>
                        {e.title}
                      </ThemedText>
                    </View>
                  )
                })}

                {icalEvts.map(e => {
                  const { top, height } = getEventLayout(e.start, e.end)
                  const colors = getEventColors(e.type ?? 'CM', e.title)
                  const isExam = e.type === 'CC' || e.type === 'CTE'

                  return (
                    <View
                      key={e.uid}
                      style={[
                        styles.eventPill, 
                        { 
                          top, 
                          height: height - 2, 
                          width: colW - 4, 
                          backgroundColor: colors.background,
                          zIndex: 2
                        },
                        isExam && { borderWidth: 0.5, borderColor: colors.foreground, borderStyle: 'solid' }
                      ]}
                    >
                      <ThemedText style={[styles.eventText, { color: colors.foreground }]} numberOfLines={1}>
                        {isExam ? `⚠️ ${e.title}` : e.title}
                      </ThemedText>
                      {e.location && (
                        <ThemedText style={[styles.eventMeta, { color: colors.foreground }]} numberOfLines={1}>
                          📍 {e.location}
                        </ThemedText>
                      )}
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  clipBox: { overflow: 'hidden', borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e5e520' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayCol: { alignItems: 'center', gap: 1 },
  dayName: { fontSize: 8, textTransform: 'uppercase', fontWeight: '600' },
  dayCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: { fontSize: 10, fontWeight: '600' },
  todayNum: { color: '#fff', fontWeight: '700' },
  gridContainer: { 
    flex: 1, 
    position: 'relative' 
  },
  absoluteHourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  hourLabel: {
    fontSize: 8,
    textAlign: 'right',
    paddingRight: 4,
    paddingTop: 1,
    fontWeight: '500',
  },
  columnsWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row',
  },
  dayColumn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  eventPill: {
    position: 'absolute',
    left: 2,
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  localPill: {
    backgroundColor: '#6366f108',
    borderLeftWidth: 2,
    borderRadius: 2,
  },
  eventText: {
    fontSize: 7,
    fontWeight: '700',
  },
  eventMeta: {
    fontSize: 6,
    opacity: 0.8,
    fontWeight: '500',
  },
})