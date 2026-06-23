import { useThemeColor } from "@/hooks/use-theme-color"
import dayjs from '@/src/lib/day'
import { useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from "../themed-text"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = Array.from({ length: 7}, (_, i) => dayjs().startOf('isoWeek').add(i, 'day'))

export function WeekView() {
    const [selected, setSelected] = useState<string | null>(null)
    const borderColor = useThemeColor({ light: '#e5e5e5', dark: '#2c2c2e' }, 'text')
    const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, "text")

    return (
        <View style={styles.container}>
            <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
                <View style={styles.timeGutter}>
                    {DAYS.map((day) => {
                    const isToday = dayjs().isSame(day, 'day')
                    const isSelected = selected === day.format('YYYY-MM-DD') && !isToday

                    return (
                        <TouchableOpacity
                        key={day.toString()}
                        style={styles.dayHeader}
                        onPress={() => setSelected(day.format('YYYY-MM-DD'))}
                        >
                        <ThemedText style={[styles.dayName, { color: mutedColor }]}>
                            {day.format('ddd')}
                        </ThemedText>
                        <View style={[
                            styles.dayCircle,
                            isToday && styles.todayCircle,
                            isSelected && styles.selectedCircle,
                        ]}>
                            <ThemedText style={[styles.dayNumber, isToday && styles.todayText]}>
                            {day.format('D')}
                            </ThemedText>
                        </View>
                        </TouchableOpacity>
                    )
                    })}
                </View>

                <ScrollView showsHorizontalScrollIndicator={false}>
                    {HOURS.map((hour) => (
                        <View 
                            key={hour} 
                            style={[styles.hourRow, { borderTopColor: borderColor }]}
                        >
                            <ThemedText style={[styles.hourLabel, { borderTopColor: borderColor }]}>
                                {hour === 0 ? '' : `${hour}h`}
                            </ThemedText>
                            {DAYS.map((day) => (
                                <View 
                                    key={day.toString()} 
                                    style={[styles.cell, { borderLeftColor: borderColor }]}
                                />
                            ))}
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  timeGutter: { width: 44 },
  dayHeader: { flex: 1, alignItems: 'center', gap: 2 },
  dayName: { fontSize: 11, textTransform: 'uppercase' },
  dayNumber: { fontSize: 16, fontWeight: '500' },
  hourRow: {
    flexDirection: 'row',
    height: 56,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  hourLabel: {
    width: 44,
    fontSize: 11,
    textAlign: 'right',
    paddingRight: 8,
    marginTop: -8,
  },
  cell: {
    flex: 1,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  dayCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    },
    todayCircle: { backgroundColor: '#6366f1' },
    todayText: { color: '#fff', fontWeight: '700' },
    selectedCircle: {
    borderWidth: 1.5,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 16,
    },
})