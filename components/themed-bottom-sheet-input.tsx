import { useThemeColor } from '@/hooks/use-theme-color'
import { withOpacity } from '@/src/lib/colors'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { StyleSheet, type TextInputProps } from 'react-native'

export type ThemedBottomSheetInputProps = TextInputProps & {
  lightColor?: string
  darkColor?: string
  lightBorderColor?: string
  darkBorderColor?: string
}

export function ThemedBottomSheetInput({
  style,
  lightColor,
  darkColor,
  lightBorderColor,
  darkBorderColor,
  ...rest
}: ThemedBottomSheetInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
  const backgroundColor = useThemeColor({}, 'background')
  const borderColor = useThemeColor(
    { light: lightBorderColor ?? '#ddd', dark: darkBorderColor ?? '#444' },
    'text'
  )

  return (
    <BottomSheetTextInput
      style={[styles.input, { color, backgroundColor, borderColor }, style]}
      placeholderTextColor={withOpacity(color, 0.5)}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
})