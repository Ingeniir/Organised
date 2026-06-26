import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useCreateEvent } from '@/src/features/calendar/useEvents'
import dayjs from '@/src/lib/day'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import DateTimePicker from '@react-native-community/datetimepicker'
import { forwardRef, useEffect, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedBottomSheetInput } from '../themed-bottom-sheet-input'

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

interface Props {
  selectedDate?: string | null
  selectedHour?: number | null
}

// eslint-disable-next-line react/display-name
export const EventModal = forwardRef<BottomSheet, Props>(({ selectedDate, selectedHour }, ref) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [color, setColor] = useState(COLORS[0])

  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const { mutate: createEvent, isPending } = useCreateEvent()

  const handleSubmit = () => {
    if (!title.trim()) return Alert.alert('Erreur', 'Le titre est obligatoire')

    const base = selectedDate ?? dayjs().format('YYYY-MM-DD')

    const start_at = dayjs(base)
      .hour(startTime.getHours())
      .minute(startTime.getMinutes())
      .second(0)
      .toISOString()

    const end_at = dayjs(base)
      .hour(endTime.getHours())
      .minute(endTime.getMinutes())
      .second(0)
      .toISOString()

    if (dayjs(end_at).isBefore(dayjs(start_at))) {
      return Alert.alert('Erreur', 'L\'heure de fin doit être après le début')
    }

    createEvent(
      { title, description, start_at, end_at, color },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          ;(ref as any)?.current?.close()
        },
      }
    )
  }

  useEffect(() => {
    if (selectedHour !== null && selectedHour !== undefined) {
      const start = new Date()
      start.setHours(selectedHour, 0, 0, 0)
      const end = new Date()
      end.setHours(selectedHour + 1, 0, 0, 0)
      setStartTime(start)
      setEndTime(end)
    }
  }, [selectedHour])

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['60%', '85%']}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <BottomSheetView style={styles.container}>
        <ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
          Nouvel événement - {dayjs(selectedDate).format('dddd D MMMM YYYY')}
        </ThemedText>

        <ThemedBottomSheetInput
          placeholder="Titre"
          value={title}
          onChangeText={setTitle}
        />
        <ThemedBottomSheetInput
          placeholder="Description (optionnel)"
          value={description}
          onChangeText={setDescription}
        />

        {/* Horaires */}
        <View style={styles.timeRow}>
          <View style={styles.timeGroup}>
            <ThemedText style={styles.timeLabel}>Début</ThemedText>
            <DateTimePicker
              value={startTime}
              mode="time"
              display="spinner"
              onChange={(_, date) => date && setStartTime(date)}
              locale="fr-FR"
              style={styles.timePicker}
            />
          </View>

          <View style={styles.timeGroup}>
            <ThemedText style={styles.timeLabel}>Fin</ThemedText>
            <DateTimePicker
              value={endTime}
              mode="time"
              display="spinner"
              onChange={(_, date) => date && setEndTime(date)}
              locale="fr-FR"
              style={styles.timePicker}
            />
          </View>
        </View>

        {/* Couleurs */}
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                color === c && styles.colorSelected,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: color }]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          <ThemedText style={styles.submitText}>
            {isPending ? 'Enregistrement...' : 'Ajouter'}
          </ThemedText>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  sheetTitle: { fontSize: 18, marginBottom: 4 },
  timeRow: { flexDirection: 'row', gap: 8 },
  timeGroup: { flex: 1, alignItems: 'center', gap: 4 },
  timeLabel: { fontSize: 12, opacity: 0.6 },
  timePicker: { flex: 1, height: 120 },
  timeInputs: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeInput: { flex: 1, textAlign: 'center' },
  timeSep: { fontSize: 18, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorSelected: { borderWidth: 3, borderColor: '#fff', transform: [{ scale: 1.15 }] },
  submitBtn: { borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})