import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useDeleteEvent } from '@/src/features/calendar/useEvents'
import dayjs from '@/src/lib/day'
import { CalendarEvent } from '@/src/types/events'
import Ionicons from '@expo/vector-icons/Ionicons'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { forwardRef } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'

interface Props {
  event: CalendarEvent | null
}

// eslint-disable-next-line react/display-name
export const EventDetailModal = forwardRef<BottomSheet, Props>(({ event }, ref) => {
  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const { mutate: deleteEvent, isPending } = useDeleteEvent()

  if (!event) return null

  const start = dayjs(event.start_at)
  const end = dayjs(event.end_at)
  const duration = end.diff(start, 'minute')
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  const handleDelete = () => {
    Alert.alert('Supprimer', 'Supprimer cet événement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          deleteEvent(event.id, {
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
        {/* Header avec couleur */}
        <View style={styles.header}>
          <View style={[styles.colorBar, { backgroundColor: event.color }]} />
          <View style={styles.headerText}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {event.title}
            </ThemedText>
            {event.description ? (
              <ThemedText style={[styles.description, { color: mutedColor }]}>
                {event.description}
              </ThemedText>
            ) : null}
          </View>
          <TouchableOpacity onPress={handleDelete} disabled={isPending}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Infos */}
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
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14 },
})