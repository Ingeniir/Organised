import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useTasks } from '@/src/features/tasks/useTasks'
import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet, View } from 'react-native'

interface Props {
  width: number
  height: number
}

export function TasksPreview({ width, height}: Props) {
  const { data: tasks = [] } = useTasks()
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const chipBg = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background')

  const SCALE = 1.2
  const innerWidth = width / SCALE
  const innerHeight = height / SCALE

  return (
    <View style={[styles.clipBox, { width, height }]}>
        <View style={[styles.inner, { width: innerWidth, height: innerHeight, transform: [{ scale: SCALE }] }]}>
        {tasks.length === 0 ? (
            <ThemedText style={[styles.empty, { color: mutedColor }]}>Aucune tâche</ThemedText>
        ) : (
            tasks.slice(0, 4).map(task => (
            <View key={task.id} style={[styles.taskRow, { backgroundColor: chipBg }]}>
                <View style={styles.taskHeader}>
                <ThemedIcon
                    name={task.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    lightColor={task.is_completed ? '#6366f1' : mutedColor}
                    darkColor={task.is_completed ? '#6366f1' : mutedColor}
                />
                <View style={styles.titleRow}>
                    <ThemedText style={[styles.taskTitle, task.is_completed && styles.completed]} numberOfLines={1}>
                    {task.title}
                    </ThemedText>
                    {task.duration_minutes && (
                    <ThemedText style={[styles.metaText, { color: mutedColor }]}>
                        <Ionicons name="time-outline" size={11} /> {task.duration_minutes}min
                    </ThemedText>
                    )}
                </View>
                </View>
                {task.subtasks && task.subtasks.length > 0 && (
                <View style={styles.subtasks}>
                    {task.subtasks.slice(0, 2).map(s => (
                    <View key={s.id} style={styles.subtaskRow}>
                        <ThemedIcon
                        name={s.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
                        size={10}
                        lightColor={s.is_completed ? '#6366f1' : mutedColor}
                        darkColor={s.is_completed ? '#6366f1' : mutedColor}
                        />
                        <ThemedText style={[styles.subtaskTitle, { color: mutedColor }, s.is_completed && styles.completed]} numberOfLines={1}>
                        {s.title}
                        </ThemedText>
                    </View>
                    ))}
                </View>
                )}
            </View>
            ))
        )}
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
  clipBox: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  inner: {
    transformOrigin: 'top left',
    padding: 16,
    gap: 10,
  },
  empty: { fontSize: 14 },
  taskRow: {
    flexDirection: 'column',
    gap: 6,
    borderRadius: 10,
    padding: 10
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  meta: { flexDirection: 'row', gap: 10 },
  metaText: { fontSize: 11 },
  taskContent: { flex: 1, gap: 4 },
  taskTitle: { fontSize: 14, fontWeight: '500' },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 4 },
  subtaskTitle: { fontSize: 12, flex: 1 },
  completed: { textDecorationLine: 'line-through', opacity: 0.5 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    gap: 8,
    },
    subtasks: {
        paddingLeft: 22,
        gap: -1
    }
})