import { CalendarPreview } from '@/components/dashboard/calendar-preview'
import { FinancePreview } from '@/components/dashboard/finance-preview'
import { TasksPreview } from '@/components/dashboard/tasks-preview'
import { WeekPreview } from '@/components/dashboard/week-preview'
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

export default function DashboardScreen() {
  const [cardWidth, setCardWidth] = useState(0)
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
          {/* Planning mois */}
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: cardBg }]}
            onPress={() => router.push('/(tabs)/planning')}
          >
            {cardWidth > 0 && <CalendarPreview width={cardWidth} height={cardWidth} />}
          </TouchableOpacity>

          {/* Semaine */}
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, height: '100%', backgroundColor: cardBg }]}
            onPress={() => router.push('/(tabs)/planning')}
          >
            {cardWidth > 0 && <WeekPreview width={cardWidth} height={cardWidth} />}
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          {/* Tâches */}
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: cardBg }]}
            onPress={() => router.push('/(tabs)/tasks')}
          >
            {cardWidth > 0 && <TasksPreview width={cardWidth} height={cardWidth} />}
          </TouchableOpacity>

          {/* Finances */}
          <TouchableOpacity
            style={[styles.card, { width: cardWidth, backgroundColor: cardBg }]}
            onPress={() => router.push('/(tabs)/finance')}
          >
            {cardWidth > 0 && <FinancePreview width={cardWidth} height={cardWidth} />}
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
  grid: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardLabel: { fontSize: 14, padding: 12, paddingTop: 8 },
})