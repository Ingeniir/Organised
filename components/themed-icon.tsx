import { useThemeColor } from '@/hooks/use-theme-color'
import Ionicons from '@expo/vector-icons/Ionicons'
import type { ComponentProps } from 'react'

type IoniconsName = ComponentProps<typeof Ionicons>['name']

export type ThemedIconProps = {
  name: IoniconsName
  size?: number
  lightColor?: string
  darkColor?: string
}

export function ThemedIcon({ name, size = 24, lightColor, darkColor }: ThemedIconProps) {
  const color = useThemeColor({ light: lightColor ?? '#000000', dark: darkColor ?? '#ffffff' }, 'text')

  return <Ionicons name={name} size={size} color={color} />
}