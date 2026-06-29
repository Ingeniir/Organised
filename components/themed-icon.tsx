import { useThemeColor } from '@/hooks/use-theme-color'
import Ionicons from '@expo/vector-icons/Ionicons'
import type { ComponentProps } from 'react'

type IoniconsName = ComponentProps<typeof Ionicons>['name']

export type ThemedIconProps = {
  name: IoniconsName
  size?: number
  lightColor?: string
  darkColor?: string
  color?: string
}

export function ThemedIcon({ name, size = 24, lightColor, darkColor, color }: ThemedIconProps) {
  const colors = useThemeColor({ light: color ? color : lightColor ?? '#000000', dark: color ? color : darkColor ?? '#ffffff' }, 'text')

  return <Ionicons name={name} size={size} color={colors} />
}