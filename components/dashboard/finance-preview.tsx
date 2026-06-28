import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useBankAccounts, useTransactions } from '@/src/features/finance/useFinance'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

interface Props {
  width: number
  height: number
}

export function FinancePreview({ width, height }: Props) {
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const chipBg = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background')

  const { data: accounts = [] } = useBankAccounts()
  const { data: transactions = [] } = useTransactions()

  const mainAccount = accounts.find(a => a.type === 'main')
  const pocketAccount = accounts.find(a => a.type === 'pocket')

  const SCALE = 1.2
  const innerWidth = width / SCALE
  const innerHeight = height / SCALE

  const totalExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }, [transactions])

  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }, [transactions])

  return (
    <View style={[styles.clipBox, { width, height }]}>
      <View style={[styles.inner, { width: innerWidth, height: innerHeight, transform: [{ scale: SCALE }] }]}>

        {/* Solde principal */}
        {mainAccount && (
          <View style={styles.balanceRow}>
            <ThemedText style={[styles.balanceLabel, { color: mutedColor }]}>
              Solde
            </ThemedText>
            <ThemedText style={styles.balanceAmount}>
              {Number(mainAccount.balance).toFixed(2)}€
            </ThemedText>
          </View>
        )}

        {/* Stats dépenses/revenus */}
        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: '#10b98120' }]}>
            <ThemedIcon name="arrow-down-outline" size={12} lightColor="#10b981" darkColor="#10b981" />
            <ThemedText style={[styles.statText, { color: '#10b981' }]}>
              +{totalIncome.toFixed(0)}€
            </ThemedText>
          </View>
          <View style={[styles.statChip, { backgroundColor: '#ef444420' }]}>
            <ThemedIcon name="arrow-up-outline" size={12} lightColor="#ef4444" darkColor="#ef4444" />
            <ThemedText style={[styles.statText, { color: '#ef4444' }]}>
              -{totalExpenses.toFixed(0)}€
            </ThemedText>
          </View>
        </View>

        {/* Argent de poche */}
        {pocketAccount && (
          <View style={[styles.pocketRow, { backgroundColor: chipBg }]}>
            <ThemedIcon name="wallet-outline" size={12} lightColor="#10b981" darkColor="#10b981" />
            <ThemedText style={[styles.pocketLabel, { color: mutedColor }]}>Poche</ThemedText>
            <ThemedText style={styles.pocketAmount}>
              {Number(pocketAccount.balance).toFixed(2)}€
            </ThemedText>
          </View>
        )}

        {/* Dernières transactions */}
        <View style={styles.transactions}>
          {transactions.slice(0, 3).map(t => {
            const isIncome = t.type === 'income'
            const color = isIncome ? '#10b981' : '#ef4444'
            return (
              <View key={t.id} style={[styles.txRow, { backgroundColor: chipBg }]}>
                <ThemedText style={[styles.txCategory, { color: mutedColor }]} numberOfLines={1}>
                  {t.category}
                </ThemedText>
                <ThemedText style={[styles.txAmount, { color }]}>
                  {isIncome ? '+' : '-'}{Math.abs(t.amount).toFixed(0)}€
                </ThemedText>
              </View>
            )
          })}
        </View>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  clipBox: { overflow: 'hidden', borderRadius: 16 },
  inner: { transformOrigin: 'top left', padding: 16, gap: 10 },
  balanceRow: { gap: 2 },
  balanceLabel: { fontSize: 11 },
  balanceAmount: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statText: { fontSize: 12, fontWeight: '600' },
  pocketRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8 },
  pocketLabel: { flex: 1, fontSize: 12 },
  pocketAmount: { fontSize: 13, fontWeight: '600' },
  transactions: { gap: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 6, borderRadius: 8 },
  txCategory: { flex: 1, fontSize: 11 },
  txAmount: { fontSize: 12, fontWeight: '600' },
})