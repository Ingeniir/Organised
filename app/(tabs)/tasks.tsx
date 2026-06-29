import { TaskDetailModal, TaskDetailModalRef } from '@/components/tasks/task-detail-modal'
import { TaskModal } from '@/components/tasks/task-modal'
import { TaskTimer } from '@/components/tasks/task-timer'
import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { ThemedTouchable } from '@/components/themed-touchable'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import { scheduleTaskNotifications } from '@/src/features/notifications/useNotifications'
import { useDeleteTask, useTasks, useToggleTask } from '@/src/features/tasks/useTasks'
import { SubTask, Task } from '@/src/types/tasks'
import Ionicons from '@expo/vector-icons/Ionicons'
import BottomSheet from '@gorhom/bottom-sheet'
import { RefObject, useEffect, useRef } from 'react'
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SubTaskProps {
  task: Task
  subtask: SubTask
  handleToggleTask: (id: string, is_completed: boolean, type: 'task' | 'subtask') => void
}

function SubTaskItem({ task, subtask, handleToggleTask }: SubTaskProps) {
  const { mutate: toggle } = useToggleTask()
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'text')

  const handleToggleSubTask = (id: string, is_completed: boolean, type: 'task' | 'subtask') => {
    if (is_completed && task.is_completed) {
      handleToggleTask(task.id, task.is_completed, 'task')
    }
    toggle({ id, is_completed, type })
  }

  return (
    <TouchableOpacity
      style={[styles.subtaskRow, { borderLeftColor: borderColor }]}
      onPress={() => handleToggleSubTask(subtask.id, subtask.is_completed, 'subtask')}
    >
      <Ionicons
        name={subtask.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={subtask.is_completed ? '#10b981' : mutedColor}
      />
      <ThemedText style={[styles.subtaskTitle, subtask.is_completed && styles.completed]}>
        {subtask.title}
      </ThemedText>
    </TouchableOpacity>
  )
}

function TaskItem({ task, detailModalRef }: { task: Task & { subtasks: SubTask[] }, detailModalRef: RefObject<TaskDetailModalRef | null> }) {
  const { mutate: toggle } = useToggleTask()
  const { mutate: remove } = useDeleteTask()
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const cardBg = useThemeColor({ light: '#f9f9f9', dark: '#1c1c1e' }, 'background')

  const handleToggleTask = (id: string, is_completed: boolean, type: 'task' | 'subtask') => {
    if (task.subtasks && task.subtasks.length > 0) {
      const hasIncomplete = task.subtasks.some(s => !s.is_completed)
      if (hasIncomplete) {
        Alert.alert('Erreur', `Toutes les sous-tâches de "${task.title}" doivent être complétées`)
        return
      }
    }
    toggle({ id, is_completed, type })
  }

  const handleOpenDetail = (task: Task & { subtasks: SubTask[] }) => {
    detailModalRef.current?.open(task)
  }

  return (
    <TouchableOpacity onPress={() => handleOpenDetail(task)} onLongPress={() => {
      Alert.alert(
            'Supprimer',
            `Supprimer "${task.title}"`,
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: () => remove(task.id) },
            ]
          )
    }}>
      <View style={[styles.card, { backgroundColor: cardBg, position: 'relative' }, task.duration_minutes ? { paddingBottom: 44 } : null]}>
        {/* Header tâche */}
        <View style={styles.taskRow}>
          <TouchableOpacity onPress={() => handleToggleTask(task.id, task.is_completed, 'task')}>
            <Ionicons
              name={task.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={task.is_completed ? '#10b981' : mutedColor}
            />
          </TouchableOpacity>

          <View style={styles.taskContent}>
            <ThemedText style={[styles.taskTitle, task.is_completed && styles.completed]}>
              {task.title}
            </ThemedText>
            <View style={styles.meta}>
              {task.due_date && (
                <ThemedText style={[styles.metaText, { color: mutedColor }]}>
                  <Ionicons name="calendar-outline" size={11} /> {task.due_date} - {task.due_time}
                </ThemedText>
              )}
              {task.duration_minutes && (
                <ThemedText style={[styles.metaText, { color: mutedColor }]}>
                  <Ionicons name="time-outline" size={11} /> {task.duration_minutes}min
                </ThemedText>
              )}
            </View>
          </View>
        </View>

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <View style={styles.subtasks}>
            {task.subtasks.map(s => <SubTaskItem key={s.id} task={task} subtask={s} handleToggleTask={handleToggleTask} />)}
          </View>
        )}

        {task.duration_minutes && (
        <TaskTimer durationMinutes={task.duration_minutes} />
      )}
      </View>
    </TouchableOpacity>
  )
}

export default function TasksScreen() {
  const { data: tasks = [], isLoading } = useTasks()
  const insets = useSafeAreaInsets()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const detailModalRef = useRef<TaskDetailModalRef>(null)

  useEffect(() => {
    if (tasks.length > 0) {
      scheduleTaskNotifications(tasks)
    }
  }, [tasks])

  const handleNewTask = () => {
    bottomSheetRef.current?.expand()
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <ThemedText type="defaultSemiBold">Tâches</ThemedText>
        <ThemedTouchable variant='ghost' onPress={handleNewTask}>
            <ThemedIcon name="add-circle" size={28} />
        </ThemedTouchable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TaskItem task={item} detailModalRef={detailModalRef} />}
        ListEmptyComponent={
          !isLoading ? (
            <ThemedText style={styles.empty}>Aucune tâche pour l&#39;instant</ThemedText>
          ) : null
        }
      />

      <TaskModal ref={bottomSheetRef} />
      <TaskDetailModal ref={detailModalRef} onClose={() => {}} />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  list: { padding: 16, gap: 10 },
  card: { borderRadius: 12, padding: 14, gap: 8 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskContent: { flex: 1, gap: 2 },
  taskTitle: { fontSize: 15, fontWeight: '500' },
  completed: { textDecorationLine: 'line-through', opacity: 0.5 },
  meta: { flexDirection: 'row', gap: 10 },
  metaText: { fontSize: 11 },
  subtasks: { marginLeft: 32, gap: 6 },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderLeftWidth: 1.5,
    paddingLeft: 10,
  },
  subtaskTitle: { fontSize: 13 },
  empty: { textAlign: 'center', opacity: 0.4, marginTop: 60 },
})