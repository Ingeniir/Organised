import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useEffect, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

interface Props {
  durationMinutes: number
}

const SIZE = 56
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function TaskTimer({ durationMinutes }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSeconds = durationMinutes * 60
  const progress = Math.min(elapsed / totalSeconds, 1)
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  const mutedColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const bgColor = useThemeColor({ light: '#ffffff', dark: '#2c2c2e' }, 'background')

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= totalSeconds) {
            setIsRunning(false)
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, totalSeconds])

  const formatTime = (seconds: number) => {
    const remaining = totalSeconds - seconds
    const m = Math.floor(remaining / 60).toString().padStart(2, '0')
    const s = (remaining % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const isFinished = elapsed >= totalSeconds

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => !isFinished && setIsRunning(r => !r)}
      onLongPress={() => { setElapsed(0); setIsRunning(false) }}
      delayLongPress={600}
    >
      <Svg width={SIZE} height={SIZE}>
        {/* Fond */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={mutedColor}
          strokeWidth={STROKE}
          fill={bgColor}
        />
        {/* Progression */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={isFinished ? '#10b981' : '#6366f1'}
          strokeWidth={STROKE}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>

      <View style={styles.inner}>
        {isFinished ? (
          <ThemedIcon name="checkmark" size={18} lightColor="#10b981" darkColor="#10b981" />
        ) : isRunning ? (
          <ThemedText style={styles.time}>{formatTime(elapsed)}</ThemedText>
        ) : elapsed > 0 ? (
          <ThemedText style={styles.time}>{formatTime(elapsed)}</ThemedText>
        ) : (
          <ThemedIcon name="play" size={16} lightColor="#10b981" darkColor="#10b981" />
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 10,
    fontWeight: '600',
  },
})