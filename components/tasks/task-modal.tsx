import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { ThemedTouchable } from '@/components/themed-touchable'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useCreateTask } from '@/src/features/tasks/useTasks'
import dayjs from '@/src/lib/day'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import DateTimePicker from '@react-native-community/datetimepicker'
import { forwardRef, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedBottomSheetInput } from '../themed-bottom-sheet-input'

// eslint-disable-next-line react/display-name
export const TaskModal = forwardRef<BottomSheet, {}>((_, ref) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState('')
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')

  const { mutate: createTask, isPending } = useCreateTask()

  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const chipBg = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background')

  const reset = () => {
    setTitle('')
    setDescription('')
    setDueDate(null)
    setDurationMinutes('')
    setSubtasks([])
    setSubtaskInput('')
    setShowDatePicker(false)
  }

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return
    setSubtasks(prev => [...prev, subtaskInput.trim()])
    setSubtaskInput('')
  }

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!title.trim()) return Alert.alert('Erreur', 'Le titre est obligatoire')

    createTask(
      {
        title,
        description: description || undefined,
        due_date: dueDate ? dayjs(dueDate).format('YYYY-MM-DD') : undefined,
        duration_minutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        is_completed: false,
        subtasks: subtasks.map(t => ({ title: t })),
      },
      {
        onSuccess: () => {
          reset()
          ;(ref as any)?.current?.close()
        },
      }
    )
  }

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['60%', '90%']}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
          Nouvelle tâche
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
          multiline
          numberOfLines={3}
          style={styles.textarea}
        />

        {/* Durée */}
        <ThemedBottomSheetInput
          placeholder="Durée (en minutes)"
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          keyboardType="numeric"
        />

        {/* Date d'échéance */}
        <TouchableOpacity
          style={[styles.dateBtn, { backgroundColor: chipBg }]}
          onPress={() => setShowDatePicker(v => !v)}
        >
          <ThemedIcon name="calendar-outline" size={16} lightColor={mutedColor} darkColor={mutedColor} />
          <ThemedText style={[styles.dateBtnText, { color: mutedColor }]}>
            {dueDate ? dayjs(dueDate).format('D MMMM YYYY') : 'Date d\'échéance (optionnel)'}
          </ThemedText>
          {dueDate && (
            <TouchableOpacity onPress={() => setDueDate(null)}>
              <ThemedIcon name="close-circle" size={16} lightColor={mutedColor} darkColor={mutedColor} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="date"
            display="spinner"
            locale="fr-FR"
            onChange={(_, date) => {
              setDueDate(date ?? null)
              setShowDatePicker(false)
            }}
          />
        )}

        {/* Sous-tâches */}
        <View style={styles.subtaskInput}>
          <ThemedBottomSheetInput
            placeholder="Ajouter une sous-tâche"
            value={subtaskInput}
            onChangeText={setSubtaskInput}
            onSubmitEditing={handleAddSubtask}
            returnKeyType="done"
            style={styles.subtaskField}
            />
          <ThemedTouchable variant="primary" style={styles.addBtn} onPress={handleAddSubtask}>
            <ThemedIcon name="add" size={20} lightColor="#fff" darkColor="#fff" />
          </ThemedTouchable>
        </View>

        {subtasks.map((s, i) => (
          <View key={i} style={[styles.subtaskChip, { backgroundColor: chipBg }]}>
            <ThemedIcon name="ellipse" size={8} lightColor="#6366f1" darkColor="#6366f1" />
            <ThemedText style={styles.subtaskLabel}>{s}</ThemedText>
            <TouchableOpacity onPress={() => handleRemoveSubtask(i)}>
              <ThemedIcon name="close" size={16} lightColor={mutedColor} darkColor={mutedColor} />
            </TouchableOpacity>
          </View>
        ))}

        <ThemedTouchable
          variant="primary"
          onPress={handleSubmit}
          disabled={isPending}
          style={styles.submitBtn}
        >
          <ThemedText style={styles.submitText}>
            {isPending ? 'Enregistrement...' : 'Ajouter la tâche'}
          </ThemedText>
        </ThemedTouchable>
      </BottomSheetScrollView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  sheetTitle: { fontSize: 18, marginBottom: 4 },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 14,
  },
  dateBtnText: { flex: 1, fontSize: 16 },
  subtaskInput: { flexDirection: 'row', gap: 8 },
  subtaskField: { flex: 1 },
  addBtn: { padding: 14, borderRadius: 10 },
  subtaskChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subtaskLabel: { flex: 1, fontSize: 14 },
  submitBtn: { marginTop: 8, paddingVertical: 12 },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})