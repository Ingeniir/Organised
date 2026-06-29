// components/tasks/task-detail-modal.tsx
import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { ThemedTouchable } from '@/components/themed-touchable'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useDeleteTask, useUpdateTask } from '@/src/features/tasks/useTasks'
import dayjs from '@/src/lib/day'
import { SubTask, Task } from '@/src/types/tasks'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import DateTimePicker from '@react-native-community/datetimepicker'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedBottomSheetInput } from '../themed-bottom-sheet-input'

interface TaskDetailModalProps {
  onClose?: () => void
}

export interface TaskDetailModalRef {
  open: (task: Task & { subtasks: SubTask[] }) => void
  close: () => void
}

// eslint-disable-next-line react/display-name
export const TaskDetailModal = forwardRef<TaskDetailModalRef, TaskDetailModalProps>(({ onClose }, ref) => {
  const [task, setTask] = useState<Task & { subtasks: SubTask[] } | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [dueTime, setDueTime] = useState<Date | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState('')
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)

  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask()
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask()

  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text')
  const chipBg = useThemeColor({ light: '#f2f2f7', dark: '#2c2c2e' }, 'background')

  const bottomSheetRef = useRef<BottomSheet>(null)

  useImperativeHandle(ref, () => ({
    open: (t) => {
      setTask(t)
      setTitle(t.title)
      setDescription(t.description || '')
      setDueDate(t.due_date ? dayjs(t.due_date).toDate() : null)
      setDueTime(t.due_time ? dayjs(`1970-01-01T${t.due_time}`).toDate() : null)
      setDurationMinutes(t.duration_minutes?.toString() || '')
      setSubtasks(t.subtasks || [])
      setSubtaskInput('')
      setIsAddingSubtask(false)
      setShowPicker(false)
      bottomSheetRef.current?.expand()
    },
    close: () => {
      bottomSheetRef.current?.close()
      if (onClose) onClose()
    },
  }))

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return
    // Simuler un nouvel ID local
    const newSubtask: SubTask = {
      id: `temp-${Date.now()}`,
      task_id: task?.id || '',
      title: subtaskInput.trim(),
      is_completed: false,
    }
    setSubtasks(prev => [...prev, newSubtask])
    setSubtaskInput('')
  }

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index))
  }

  const handleToggleSubtask = (index: number) => {
    setSubtasks(prev => prev.map((s, i) =>
      i === index ? { ...s, is_completed: !s.is_completed } : s
    ))
  }

  const handleSave = () => {
    if (!task) return
    if (!title.trim()) return Alert.alert('Erreur', 'Le titre est obligatoire')

    const updatedTask = {
      id: task.id,
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate ? dayjs(dueDate).format('YYYY-MM-DD') : undefined,
      due_time: dueTime ? dayjs(dueTime).format('HH:mm') : undefined,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : undefined,
      subtasks: subtasks.map(s => ({
        id: s.id,
        title: s.title,
        is_completed: s.is_completed,
      })),
    }

    updateTask(updatedTask, {
      onSuccess: () => {
        ;(ref as any).current?.close()
        if (onClose) onClose()
      },
    })
  }

  const handleDelete = () => {
    if (!task) return
    Alert.alert(
      'Supprimer',
      `Supprimer "${task.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteTask(task.id, {
              onSuccess: () => {
                ;(ref as any).current?.close()
                if (onClose) onClose()
              },
            })
          },
        },
      ]
    )
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) setDueDate(selectedDate)
  }

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) setDueTime(selectedTime)
  }

  const confirmDateTime = () => setShowPicker(false)
  const clearDateTime = () => {
    setDueDate(null)
    setDueTime(null)
    setShowPicker(false)
  }

  if (!task) return null

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['65%', '93%']}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
            Modifier la tâche
          </ThemedText>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <ThemedIcon name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={[styles.inputRow, { backgroundColor: chipBg }]}>
          <ThemedIcon name="document-text-outline" size={20} color={mutedColor} />
          <ThemedBottomSheetInput
            placeholder="Titre de la tâche"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={mutedColor}
            style={[styles.input, { color: textColor }]}
          />
        </View>

        <View style={[styles.inputRow, styles.textareaRow, { backgroundColor: chipBg }]}>
          <ThemedIcon name="reader-outline" size={20} color={mutedColor} />
          <ThemedBottomSheetInput
            placeholder="Description (optionnel)"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={mutedColor}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textarea, { color: textColor }]}
          />
        </View>

        <View style={[styles.inputRow, { backgroundColor: chipBg }]}>
          <ThemedIcon name="time-outline" size={20} color={mutedColor} />
          <ThemedBottomSheetInput
            placeholder="Durée (minutes)"
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            placeholderTextColor={mutedColor}
            keyboardType="numeric"
            style={[styles.input, { color: textColor }]}
          />
        </View>

        <TouchableOpacity
          style={[styles.inputRow, { backgroundColor: chipBg }]}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <ThemedIcon name="calendar-outline" size={20} color={mutedColor} />
          <ThemedText style={[styles.dateText, { color: dueDate ? textColor : mutedColor }]}>
            {dueDate
              ? `${dayjs(dueDate).format('D MMMM YYYY')}${dueTime ? ` à ${dayjs(dueTime).format('HH:mm')}` : ''}`
              : 'Date d\'échéance'}
          </ThemedText>
          {dueDate && (
            <TouchableOpacity onPress={clearDateTime}>
              <ThemedIcon name="close-circle" size={18} color={mutedColor} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {showPicker && (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerRow}>
              <View style={styles.pickerCol}>
                <ThemedText style={[styles.pickerLabel, { color: mutedColor }]}>Date</ThemedText>
                <DateTimePicker
                  value={dueDate ?? new Date()}
                  mode="date"
                  display="spinner"
                  locale="fr-FR"
                  onChange={onDateChange}
                />
              </View>
              <View style={styles.pickerCol}>
                <ThemedText style={[styles.pickerLabel, { color: mutedColor }]}>Heure</ThemedText>
                <DateTimePicker
                  value={dueTime ?? new Date()}
                  mode="time"
                  is24Hour
                  display="spinner"
                  locale="fr-FR"
                  onChange={onTimeChange}
                />
              </View>
            </View>
            <View style={styles.pickerActions}>
              <TouchableOpacity onPress={clearDateTime} style={styles.pickerBtn}>
                <ThemedText style={{ color: '#ef4444' }}>Effacer</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDateTime} style={[styles.pickerBtn, styles.confirmBtn]}>
                <ThemedText style={{ color: '#10b981', fontWeight: '600' }}>Confirmer</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Sous-tâches
          </ThemedText>

          {subtasks.map((s, i) => (
            <View key={s.id} style={[styles.subtaskRow, { borderBottomColor: handleColor }]}>
              <TouchableOpacity onPress={() => handleToggleSubtask(i)}>
                <ThemedIcon
                  name={s.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={s.is_completed ? '#10b981' : '#6366f1'}
                />
              </TouchableOpacity>
              <ThemedText
                style={[
                  styles.subtaskLabel,
                  { color: textColor },
                  s.is_completed && styles.completed,
                ]}
              >
                {s.title}
              </ThemedText>
              <TouchableOpacity onPress={() => handleRemoveSubtask(i)} style={styles.deleteBtn}>
                <ThemedIcon name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}

          {isAddingSubtask ? (
            <View style={[styles.inputRow, { backgroundColor: chipBg, marginTop: 6 }]}>
              <ThemedIcon name="ellipse-outline" size={16} color={mutedColor} />
              <ThemedBottomSheetInput
                placeholder="Nom de la sous-tâche..."
                value={subtaskInput}
                onChangeText={setSubtaskInput}
                placeholderTextColor={mutedColor}
                onSubmitEditing={handleAddSubtask}
                returnKeyType="next"
                autoFocus
                style={[styles.input, { color: textColor }]}
              />
              <TouchableOpacity onPress={() => setIsAddingSubtask(false)} style={styles.closeBtn}>
                <ThemedIcon name="close" size={18} color={mutedColor} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addSubtaskBtn, { borderColor: handleColor }]}
              onPress={() => setIsAddingSubtask(true)}
              activeOpacity={0.6}
            >
              <ThemedIcon name="add-circle-outline" size={18} color="#10b981" />
              <ThemedText style={styles.addSubtaskText} color="#10b981">
                Ajouter une sous-tâche
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <ThemedTouchable
          variant="primary"
          onPress={handleSave}
          disabled={isUpdating}
          style={styles.submitBtn}
          lightColor="#10b981"
          darkColor="#10b981"
        >
          <ThemedText style={styles.submitText}>
            {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
          </ThemedText>
        </ThemedTouchable>
      </BottomSheetScrollView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 20,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ef444410',
  },
  sectionTitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  textareaRow: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  iconTop: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  textarea: {
    minHeight: 30,
    textAlignVertical: 'top',
  },
  dateText: {
    flex: 1,
    fontSize: 15,
  },
  pickerContainer: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pickerCol: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  pickerBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmBtn: {
    backgroundColor: '#10b98110',
  },
  section: {
    gap: 6,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subtaskLabel: {
    flex: 1,
    fontSize: 15,
  },
  completed: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  addSubtaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 4,
  },
  addSubtaskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  submitBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#10b981',
  },
  submitText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
})