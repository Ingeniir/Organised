import { useToastStore, type ToastItem } from '@/src/stores/toastStore'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { ThemedText } from './themed-text'

const VARIANT_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  success: { bg: '#10b981', color: '#fff', icon: 'check-circle' },
  warn:    { bg: '#f59e0b', color: '#fff', icon: 'warning' },
  error:   { bg: '#ef4444', color: '#fff', icon: 'error' },
  message: { bg: '#1c1c1e', color: '#fff', icon: 'info' },
}

function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateX = useRef(new Animated.Value(300)).current
  const duration = item.duration ?? 3000
  const variant = VARIANT_STYLES[item.variant]
  const iconName = item.icon ?? variant.icon

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 300, duration: 300, useNativeDriver: true }),
      ]).start(() => onRemove(item.id))
    }, duration)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Animated.View style={[styles.card, { backgroundColor: variant.bg, opacity, transform: [{ translateX }] }]}>
      <MaterialIcons name={iconName as any} size={18} color={variant.color} />
      <ThemedText style={[styles.message, { color: variant.color }]}>
        {item.message}
      </ThemedText>
    </Animated.View>
  )
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} item={t} onRemove={dismiss} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    gap: 8,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  message: { fontSize: 13, fontWeight: '500', flexShrink: 1 },
})