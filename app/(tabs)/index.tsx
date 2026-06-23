import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuthStore } from '@/src/features/auth/authStore'
import { supabase } from '@/src/lib/supabase'
import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function DashboardScreen() {
  const { user } = useAuthStore()
  const insets = useSafeAreaInsets()
  const displayName = user?.user_metadata?.display_name ?? user?.email

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <ThemedText type="defaultSemiBold" style={{fontSize: 24 }}>{displayName}</ThemedText>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>
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
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
})