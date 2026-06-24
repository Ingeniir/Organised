import { useThemeColor } from '@/hooks/use-theme-color'
import { StyleSheet, TouchableOpacity, type TouchableOpacityProps } from 'react-native'

export type ThemedTouchableProps = TouchableOpacityProps & {
  lightColor?: string
  darkColor?: string
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
}

export function ThemedTouchable({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...rest
}: ThemedTouchableProps) {
  const defaultBg = useThemeColor({ light: lightColor ?? '#f0f0f0', dark: darkColor ?? '#2c2c2e' }, 'background')

  const variantStyle = {
    default: { backgroundColor: defaultBg },
    primary: { backgroundColor: '#6366f1' },
    danger: { backgroundColor: '#ef444420' },
    ghost: { backgroundColor: 'transparent' },
  }[variant]

  return (
    <TouchableOpacity
      style={[styles.base, variantStyle, style]}
      activeOpacity={0.7}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})