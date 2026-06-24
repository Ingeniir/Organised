import { CalendarPreview } from '@/components/dashboard/calendar-preview'
import { TasksPreview } from '@/components/dashboard/tasks-preview'
import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useAuthStore } from '@/src/features/auth/authStore'
import { supabase } from '@/src/lib/supabase'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const MODULES = [
  {
    id: 'planning',
    label: 'Planning',
    icon: 'calendar-outline',
    color: '#6366f1',
    route: '/(tabs)/planning',
  },
  {
    id: 'tasks',
    label: 'Tâches',
    icon: 'checkmark-circle-outline',
    color: '#10b981',
    route: '/(tabs)/tasks',
  },
] as const

export default function DashboardScreen() {
  const [cardWidth, setCardWidth] = useState<number>(0)

  const { user } = useAuthStore()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const displayName = user?.user_metadata?.display_name ?? user?.email
  const cardBg = useThemeColor({ light: '#f9f9f9', dark: '#1c1c1e' }, 'background')

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <ThemedText type="defaultSemiBold" style={styles.name}>{displayName}</ThemedText>
        <TouchableOpacity onPress={handleLogout}>
          <ThemedIcon name="log-out-outline" size={24} lightColor="#6366f1" darkColor="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        <View
          style={styles.row}
          onLayout={e => setCardWidth((e.nativeEvent.layout.width - 12) / 2)}
        >
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: cardBg }]}
            onPress={() => router.push('/(tabs)/planning')}
          >
            {cardWidth > 0 && <CalendarPreview width={cardWidth} height={cardWidth} />}
            <ThemedText type="defaultSemiBold" style={styles.cardLabel}>Planning</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: cardBg }]}
            onPress={() => router.push('/(tabs)/tasks')}
          >
            {cardWidth > 0 && <TasksPreview width={cardWidth} height={cardWidth} />}
            <ThemedText type="defaultSemiBold" style={styles.cardLabel}>Tâches</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  name: { fontSize: 24 },
  grid: {
    padding: 16
  },
  card: {
    borderRadius: 16, overflow: 'hidden'
  },
  row: { flexDirection: 'row', gap: 12 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: { fontSize: 14, padding: 12, paddingTop: 8 },
})