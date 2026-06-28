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
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)

  const { mutate: createTask, isPending } = useCreateTask()

  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text')
  const chipBg = useThemeColor({ light: '#f2f2f7', dark: '#2c2c2e' }, 'background')

  const reset = () => {
    setTitle('')
    setDescription('')
    setDueDate(null)
    setDurationMinutes('')
    setSubtasks([])
    setSubtaskInput('')
    setShowDatePicker(false)
    setIsAddingSubtask(false)
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
      snapPoints={['65%', '93%']}
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

        {/* Champ Titre */}
        <View style={[styles.inputRowContainer, { backgroundColor: chipBg }]}>
          <ThemedIcon name="document-text-outline" size={20} lightColor={mutedColor} darkColor={mutedColor} />
          <ThemedBottomSheetInput
            placeholder="Titre de la tâche"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={mutedColor}
            style={[styles.embeddedInput, { color: textColor }]}
          />
        </View>

        {/* Champ Description */}
        <View style={[styles.inputRowContainer, styles.textareaContainer, { backgroundColor: chipBg }]}>
          <ThemedIcon name="reader-outline" size={20} lightColor={mutedColor} darkColor={mutedColor} />
          <ThemedBottomSheetInput
            placeholder="Description (optionnel)"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={mutedColor}
            multiline
            numberOfLines={3}
            style={[styles.embeddedInput, styles.textarea, { color: textColor }]}
          />
        </View>

        {/* Champ Durée */}
        <View style={[styles.inputRowContainer, { backgroundColor: chipBg }]}>
          <ThemedIcon name="time-outline" size={20} lightColor={mutedColor} darkColor={mutedColor} />
          <ThemedBottomSheetInput
            placeholder="Durée (en minutes)"
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            placeholderTextColor={mutedColor}
            keyboardType="numeric"
            style={[styles.embeddedInput, { color: textColor }]}
          />
        </View>

        {/* Date d'échéance */}
        <TouchableOpacity
          style={[styles.inputRowContainer, { backgroundColor: chipBg }]}
          onPress={() => setShowDatePicker(v => !v)}
          activeOpacity={0.7}
        >
          <ThemedIcon name="calendar-outline" size={20} lightColor={mutedColor} darkColor={mutedColor} />
          <ThemedText style={[styles.dateBtnText, { color: dueDate ? textColor : mutedColor }]}>
            {dueDate ? dayjs(dueDate).format('D MMMM YYYY') : "Date d'échéance (optionnel)"}
          </ThemedText>
          {dueDate && (
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); setDueDate(null); }}>
              <ThemedIcon name="close-circle" size={18} lightColor={mutedColor} darkColor={mutedColor} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
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
          </View>
        )}

        {/* Section Sous-tâches */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Sous-tâches
        </ThemedText>

        {/* Liste des sous-tâches ajoutées */}
        {subtasks.map((s, i) => (
          <View key={i} style={[styles.subtaskRow, { borderBottomColor: handleColor }]}>
            <ThemedIcon name="checkmark-circle-outline" size={18} lightColor="#6366f1" darkColor="#6366f1" />
            <ThemedText style={[styles.subtaskLabel, { color: textColor }]}>{s}</ThemedText>
            <TouchableOpacity onPress={() => handleRemoveSubtask(i)} style={styles.deleteSubtaskBtn}>
              <ThemedIcon name="trash-outline" size={18} lightColor="#ef4444" darkColor="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Input dynamique ou Bouton d'ajout */}
        {isAddingSubtask ? (
          <View style={[styles.inputRowContainer, { backgroundColor: chipBg, marginTop: 4 }]}>
            <ThemedIcon name="ellipse-outline" size={16} lightColor={mutedColor} darkColor={mutedColor} />
            <ThemedBottomSheetInput
              placeholder="Nom de la sous-tâche..."
              value={subtaskInput}
              onChangeText={setSubtaskInput}
              placeholderTextColor={mutedColor}
              onSubmitEditing={handleAddSubtask} // Ajoute et reste ouvert pour la suivante
              returnKeyType="next"
              autoFocus
              style={[styles.embeddedInput, { color: textColor }]}
            />
            <TouchableOpacity onPress={() => setIsAddingSubtask(false)} style={styles.closeInputBtn}>
              <ThemedIcon name="close" size={18} lightColor={mutedColor} darkColor={mutedColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addSubtaskBtn, { borderColor: handleColor }]}
            onPress={() => setIsAddingSubtask(true)}
            activeOpacity={0.6}
          >
            <ThemedIcon name="add-circle-outline" size={18} lightColor="#10b981" darkColor="#10b981" />
            <ThemedText lightColor="#10b981" darkColor="#10b981" style={styles.addSubtaskText}>Ajouter une sous-tâche</ThemedText>
          </TouchableOpacity>
        )}

        {/* Bouton Soumettre la Tâche Principale */}
        <ThemedTouchable
          variant="primary"
          onPress={handleSubmit}
          disabled={isPending}
          style={styles.submitBtn}
          lightColor="#10b981" 
          darkColor="#10b981"
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
  container: { padding: 20, gap: 14, paddingBottom: 40 },
  sheetTitle: { fontSize: 20, marginBottom: 4 },
  sectionTitle: { fontSize: 15, marginTop: 10, marginBottom: 2 },
  
  // Conteneur de ligne d'input partagé (icône + input)
  inputRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  textareaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  iconTop: {
    marginTop: 2,
  },
  embeddedInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    // Reset les styles par défaut si necessaire
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  textarea: { 
    minHeight: 30, 
    textAlignVertical: 'top' 
  },
  dateBtnText: { 
    flex: 1, 
    fontSize: 15 
  },

  // Design des lignes de sous-tâches de la liste
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subtaskLabel: { 
    flex: 1, 
    fontSize: 15 
  },
  deleteSubtaskBtn: {
    padding: 4,
  },

  // Bouton pour déclencher l'apparition de l'input sous-tâche
  addSubtaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  addSubtaskText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeInputBtn: {
    padding: 4,
  },

  // Bouton principal de soumission
  submitBtn: { 
    marginTop: 20, 
    paddingVertical: 14, 
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor:"#10b981"
  },
  submitText: { 
    fontWeight: '600', 
    fontSize: 16, 
    color: '#fff' 
  },
})