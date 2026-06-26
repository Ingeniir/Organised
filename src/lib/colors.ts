export function withOpacity(hex: string, opacity: number): string {
  const normalized = hex.length === 4
    ? '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
    : hex
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
  return normalized + alpha
}