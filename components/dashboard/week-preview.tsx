import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useEvents } from '@/src/features/calendar/useEvents'
import { useICalEvents } from '@/src/features/ical/useICalEvents'
import dayjs from '@/src/lib/day'
import { useSettingsStore } from '@/src/stores/settingsStore'
import { StyleSheet, View } from 'react-native'

interface Props {
  width: number
  height: number
}

const DAYS = Array.from({ length: 7 }, (_, i) =>
  dayjs().startOf('isoWeek').add(i, 'day')
)

// Collecte tous les events et construit les créneaux uniques
function buildSlots(events: any[], icalEvents: any[]) {
  const slots: { hour: number; day: string; local: any[]; ical: any[] }[] = []
  const keys = new Set<string>()

  const addKey = (dateStr: string, hour: number) => {
    const k = `${dateStr}-${hour}`
    if (!keys.has(k)) {
      keys.add(k)
      slots.push({ hour, day: dateStr, local: [], ical: [] })
    }
  }

  events.forEach(e => {
    const d = dayjs(e.start_at)
    addKey(d.format('YYYY-MM-DD'), d.hour())
  })
  icalEvents.forEach(e => {
    const d = dayjs(e.start)
    addKey(d.format('YYYY-MM-DD'), d.hour())
  })

  slots.sort((a, b) => a.hour - b.hour)

  slots.forEach(slot => {
    slot.local = events.filter(e =>
      dayjs(e.start_at).format('YYYY-MM-DD') === slot.day &&
      dayjs(e.start_at).hour() === slot.hour
    )
    slot.ical = icalEvents.filter(e =>
      dayjs(e.start).format('YYYY-MM-DD') === slot.day &&
      dayjs(e.start).hour() === slot.hour
    )
  })

  // Dédoublonne par heure unique pour la grille
  const hourSet = new Set<number>()
  const hours: number[] = []
  slots.forEach(s => {
    if (!hourSet.has(s.hour)) {
      hourSet.add(s.hour)
      hours.push(s.hour)
    }
  })

  return { slots, hours }
}

export function WeekPreview({ width, height }: Props) {
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'text')
  const todayBg = useThemeColor({ light: '#6366f115', dark: '#6366f115' }, 'background')
  const { showIcal, showICalL2, showICalL3 } = useSettingsStore()

  const from = dayjs().startOf('isoWeek').toISOString()
  const to = dayjs().endOf('isoWeek').toISOString()
  const { data: events = [] } = useEvents(from, to)
  const { data: icalL2 = [] } = useICalEvents('L2', '', '', showICalL2)
  const { data: icalL3 = [] } = useICalEvents('L3', '', '', showICalL3)

  const icalEvents = showIcal
    ? [...(showICalL2 ? icalL2 : []), ...(showICalL3 ? icalL3 : [])]
    : []

  const { hours } = buildSlots(events, icalEvents)

  // Si pas d'events, affiche les heures de cours classiques
  const displayHours = hours.length > 0 ? hours : [8, 9, 10, 11, 12, 13, 14]

  const ROW_H = 44
  const HEADER_H = 52
  const GUTTER_W = 28
  const colW = (width - GUTTER_W) / 7

  return (
    <View style={[styles.clipBox, { width, height }]}>

      {/* Header jours */}
      <View style={[styles.headerRow, { height: HEADER_H, borderBottomColor: borderColor }]}>
        <View style={{ width: GUTTER_W }} />
        {DAYS.map((day) => {
          const isToday = dayjs().isSame(day, 'day')
          return (
            <View key={day.toString()} style={[styles.dayCol, { width: colW }]}>
              <ThemedText style={[styles.dayName, { color: mutedColor }]}>
                {day.format('dd')[0]}
              </ThemedText>
              <View style={[styles.dayCircle, isToday && { backgroundColor: '#6366f1' }]}>
                <ThemedText style={[styles.dayNum, isToday && styles.todayNum]}>
                  {day.format('D')}
                </ThemedText>
              </View>
            </View>
          )
        })}
      </View>

      {/* Grille compacte */}
      <View style={styles.grid}>
        {displayHours.map((hour) => (
          <View key={hour} style={[styles.hourRow, { height: ROW_H, borderTopColor: borderColor }]}>
            {/* Label heure */}
            <ThemedText style={[styles.hourLabel, { width: GUTTER_W, color: mutedColor }]}>
              {hour}h
            </ThemedText>

            {/* Colonnes jours */}
            {DAYS.map((day) => {
              const dateStr = day.format('YYYY-MM-DD')
              const isToday = dayjs().isSame(day, 'day')
              const localEvts = events.filter(e =>
                dayjs(e.start_at).format('YYYY-MM-DD') === dateStr &&
                dayjs(e.start_at).hour() === hour
              )
              const icalEvts = icalEvents.filter(e =>
                dayjs(e.start).format('YYYY-MM-DD') === dateStr &&
                dayjs(e.start).hour() === hour
              )
              const hasEvents = localEvts.length > 0 || icalEvts.length > 0

              return (
                <View
                  key={dateStr}
                  style={[
                    styles.cell,
                    { width: colW, height: '100%', borderLeftColor: borderColor },
                    isToday && { backgroundColor: todayBg },
                  ]}
                >
                  {localEvts.map(e => (
                    <View
                      key={e.id}
                      style={[styles.eventPill, { backgroundColor: e.color }]}
                    >
                      <ThemedText style={styles.eventText} numberOfLines={1}>
                        {e.title}
                      </ThemedText>
                    </View>
                  ))}
                  {icalEvts.map(e => (
                    <View
                      key={e.uid}
                      style={[styles.eventPill, { backgroundColor: '#10b981' }]}
                    >
                      <ThemedText style={styles.eventText} numberOfLines={1}>
                        {e.title}
                      </ThemedText>
                    </View>
                  ))}
                  {!hasEvents && isToday && (
                    <View style={styles.todayDot} />
                  )}
                </View>
              )
            })}
          </View>
        ))}
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  clipBox: { overflow: 'hidden', borderRadius: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayCol: { alignItems: 'center', gap: 2 },
  dayName: { fontSize: 9, textTransform: 'uppercase' },
  dayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: { fontSize: 11, fontWeight: '500' },
  todayNum: { color: '#fff', fontWeight: '700' },
  grid: { flex: 1 },
  hourRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  hourLabel: {
    fontSize: 9,
    textAlign: 'right',
    paddingRight: 4,
    paddingTop: 2,
  },
  cell: {
    flex: 1,
    borderLeftWidth: StyleSheet.hairlineWidth,
    padding: 1,
    gap: 1,
  },
  eventPill: {
    borderRadius: 3,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  eventText: {
    fontSize: 7,
    color: '#fff',
    fontWeight: '600',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6366f130',
    alignSelf: 'center',
    marginTop: 4,
  },
})