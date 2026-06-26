import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useDeleteEvent } from '@/src/features/calendar/useEvents'
import dayjs from '@/src/lib/day'
import { CalendarEvent } from '@/src/types/events'
import { ICalEvent } from '@/src/types/ical'
import Ionicons from '@expo/vector-icons/Ionicons'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { forwardRef } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'

interface Props {
  event: CalendarEvent | ICalEvent | null
}

function isICalEvent(event: CalendarEvent | ICalEvent): event is ICalEvent {
  return 'uid' in event
}

// eslint-disable-next-line react/display-name
export const EventDetailModal = forwardRef<BottomSheet, Props>(({ event }, ref) => {
  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const { mutate: deleteEvent, isPending } = useDeleteEvent()

  if (!event) return null

  const ical = isICalEvent(event)
  const start = dayjs(ical ? event.start : event.start_at)
  const end = dayjs(ical ? event.end : event.end_at)
  const duration = end.diff(start, 'minute')
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  const color = ical
    ? event.source === 'L2' ? '#6366f1' : '#10b981'
    : event.color

  const handleDelete = () => {
    if (ical) return
    Alert.alert('Supprimer', 'Supprimer cet événement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteEvent((event as CalendarEvent).id, {
            onSuccess: () => (ref as any)?.current?.close(),
          })
        },
      },
    ])
  }

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['40%']}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.colorBar, { backgroundColor: color }]} />
          <View style={styles.headerText}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {ical ? event.title : event.title}
            </ThemedText>
            {ical && event.source && (
              <ThemedText style={[styles.badge, { backgroundColor: color + '20', color }]}>
                {event.source}
              </ThemedText>
            )}
            {!ical && event.description ? (
              <ThemedText style={[styles.description, { color: mutedColor }]}>
                {event.description}
              </ThemedText>
            ) : null}
          </View>
          {!ical && (
            <TouchableOpacity onPress={handleDelete} disabled={isPending}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Date & heure */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={mutedColor} />
          <ThemedText style={[styles.infoText, { color: mutedColor }]}>
            {start.format('dddd D MMMM YYYY')}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={mutedColor} />
          <ThemedText style={[styles.infoText, { color: mutedColor }]}>
            {start.format('HH:mm')} → {end.format('HH:mm')}
            {'  ·  '}
            {hours > 0 ? `${hours}h` : ''}{minutes > 0 ? `${minutes}min` : ''}
          </ThemedText>
        </View>

        {/* Salle (iCal) */}
        {ical && event.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={mutedColor} />
            <ThemedText style={[styles.infoText, { color: mutedColor }]}>
              {event.location}
            </ThemedText>
          </View>
        )}

        {/* Prof (iCal) */}
        {ical && event.prof && (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={mutedColor} />
            <ThemedText style={[styles.infoText, { color: mutedColor }]}>
              {event.prof}
            </ThemedText>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  colorBar: { width: 4, borderRadius: 2, alignSelf: 'stretch', minHeight: 40 },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: 18 },
  description: { fontSize: 14 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14 },
})