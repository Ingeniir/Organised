import { useThemeColor } from "@/hooks/use-theme-color"
import { Palette } from "@/src/constants/colors"
import { ICalEvent } from "@/src/types/ical"
import Ionicons from "@expo/vector-icons/Ionicons"
import { StyleSheet, View } from "react-native"
import { ThemedText } from "../themed-text"

// ── Colors from week-view ──────────────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  CM:  { bg: '#10b98118', fg: '#10b981' },
  TD:  { bg: '#b0b91018', fg: '#b0b910' },
  CTE: { bg: '#b93a1018', fg: '#b93a10' },
  CC:  { bg: '#3b82f618', fg: '#3b82f6' },
}






// ── Event card ─────────────────────────────────────────────────────
export function EventCard({ event }: { event: ICalEvent }) {
  const colors = TYPE_COLORS[event.type ?? "CM"] || TYPE_COLORS.CM
  const duration = `${event.start} – ${event.end}`
  const borderColor = useThemeColor({}, 'border')

  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderLeftColor: colors.fg }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <ThemedText style={[styles.cardTitle, { color: colors.fg }]} numberOfLines={1}>
            {event.title}
          </ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: colors.fg + '22' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: colors.fg }]}>
              {event.type}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.cardTime, { color: colors.fg }]} lightColor={Palette.textMuted.light} darkColor={Palette.textMuted.dark}>
          {duration}
        </ThemedText>
      </View>

      {event.description ? (
        <ThemedText style={styles.cardDesc} numberOfLines={2} lightColor={Palette.textSecondary.light} darkColor={Palette.textSecondary.dark}>
          {event.description}
        </ThemedText>
      ) : null}

      <View style={styles.cardMeta}>
        {event.location ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={colors.fg} />
            <ThemedText style={styles.metaText} lightColor={Palette.textSecondary.light} darkColor={Palette.textSecondary.dark}>
              {event.location}
            </ThemedText>
          </View>
        ) : null}
        {event.prof ? (
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={13} color={colors.fg} />
            <ThemedText style={styles.metaText} lightColor={Palette.textSecondary.light} darkColor={Palette.textSecondary.dark}>
              {event.prof}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  )
}

// ── Section header ──────────────────────────────────────────────────
export const DateHeader = ({ label }: { label: string }) => {
  const borderColor = useThemeColor({}, 'border')

  return (
    <View style={[styles.dateHeader, { borderBottomColor: borderColor }]}>
      <ThemedText style={styles.dateHeaderText} lightColor={Palette.textPrimary.light} darkColor={Palette.textPrimary.dark}>
        {label}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
    // Date header
    dateHeader: {
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: 10,
        marginTop: 6,
    },
    dateHeaderText: {
        fontSize: 15,
        fontWeight: '600',
        textTransform: 'capitalize',
    },

    // Card
    card: {
        borderRadius: 10,
        borderLeftWidth: 3.5,
        padding: 12,
        gap: 6,
    },
    cardHeader: {
        gap: 2,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    cardTime: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.75,
    },
    typeBadge: {
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cardDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    cardMeta: {
        flexDirection: 'row',
        gap: 14,
        marginTop: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
})