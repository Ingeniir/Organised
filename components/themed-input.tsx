import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  lightBorderColor,
  darkBorderColor,
  ...rest
}: ThemedInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor(
    { light: lightBorderColor ?? '#ddd', dark: darkBorderColor ?? '#444' },
    'text'
  );

  return (
    <TextInput
      style={[styles.input, { color, backgroundColor, borderColor }, style]}
      placeholderTextColor={color + '80'}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
});