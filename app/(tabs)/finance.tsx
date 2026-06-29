import { TransactionModal } from '@/components/finance/transaction-modal'
import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { ThemedTouchable } from '@/components/themed-touchable'
import { ThemedView } from '@/components/themed-view'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useBankAccounts, useDeleteTransaction, useTransactions } from '@/src/features/finance/useFinance'
import dayjs from '@/src/lib/day'
import { useToastStore } from '@/src/stores/toastStore'
import { Transaction } from '@/src/types/finance'
import BottomSheet from '@gorhom/bottom-sheet'
import { useRef } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CATEGORY_ICONS: Record<string, string> = {
  'Alimentation': 'fast-food-outline',
  'Transport': 'car-outline',
  'Loisirs': 'game-controller-outline',
  'Santé': 'medical-outline',
  'Salaire': 'cash-outline',
  'Virement': 'swap-horizontal-outline',
  'Abonnement': 'repeat-outline',
  'Shopping': 'bag-outline',
  'Autre': 'ellipse-outline',
}

function TransactionBadge({ transaction }: { transaction: Transaction }) {
  const mutedColor = useThemeColor({ light: '#8e8e93', dark: '#8e8e93' }, 'text')
  const cardBg = useThemeColor({ light: '#f2f2f7', dark: '#1c1c1e' }, 'background')
  const borderTheme = useThemeColor({ light: '#e5e5ea', dark: '#2c2c2e' }, 'border')

  const isIncome = transaction.type === 'income'
  const isTransfer = transaction.type === 'transfer'
  const amountColor = isIncome ? '#10b981' : isTransfer ? '#6366f1' : '#ef4444'
  const icon = CATEGORY_ICONS[transaction.category] ?? 'ellipse-outline'
  const { mutate: deleteTransaction, isPending } = useDeleteTransaction()
  const toast = useToastStore()
  const { data: accounts = [] } = useBankAccounts()

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la transaction',
      'Êtes-vous sûr de vouloir supprimer cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteTransaction(transaction.id, {
              onSuccess: () => {
                toast.show({
                  variant: 'message',
                  icon: 'wallet',
                  message: `-${Number(transaction.amount).toFixed(2)}€`,
                  duration: 1500
                })
              },
              onError: () => {
                Alert.alert('Erreur', 'Impossible de supprimer la transaction')
              }
            })
          },
        },
      ]
    )
  }

  const displayAmount = transaction.amount

  return (
    <TouchableOpacity
      onLongPress={handleDelete}
      delayLongPress={400}
      disabled={isPending}
      activeOpacity={0.7}
    >
      <View style={[styles.badge, { backgroundColor: cardBg, borderColor: borderTheme }]}>
        <View style={[styles.badgeIcon, { backgroundColor: amountColor + '15' }]}>
          <ThemedIcon
            name={icon as any}
            size={20}
            lightColor={amountColor}
            darkColor={amountColor}
          />
        </View>
        <View style={styles.badgeContent}>
          <ThemedText style={styles.badgeCategory}>{transaction.category}</ThemedText>
          {transaction.description && (
            <ThemedText style={[styles.badgeDesc, { color: mutedColor }]} numberOfLines={1}>
              {transaction.description}
            </ThemedText>
          )}
        </View>
        <View style={styles.badgeRight}>
          <ThemedText style={[styles.badgeAmount, { color: amountColor }]}>
            {isIncome ? '+' : isTransfer ? '↔' : '-'}{Math.abs(displayAmount).toFixed(2)}€
          </ThemedText>
          <ThemedText style={[styles.badgeDate, { color: mutedColor }]}>
            {dayjs(transaction.created_at).format('D MMM')}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function FinanceScreen() {
  const insets = useSafeAreaInsets()
  const { data: accounts = [] } = useBankAccounts()
  const { data: transactions = [] } = useTransactions()
  const mutedColor = useThemeColor({ light: '#8e8e93', dark: '#8e8e93' }, 'text')
  const cardBg = useThemeColor({ light: '#f2f2f7', dark: '#1c1c1e' }, 'background')
  const mainCardBg = useThemeColor({ light: '#f9f6f0', dark: '#1e1b14' }, 'background')
  const mainCardText = useThemeColor({ light: '#0a7ea4', dark: '#4fc3f7' }, 'text')
  const statLabelColor = useThemeColor({ light: '#555555', dark: '#cccccc' }, 'text')

  const bottomSheetRef = useRef<BottomSheet>(null)

  const mainAccount = accounts.find(a => a.type === 'main')
  const pocketAccount = accounts.find(a => a.type === 'pocket')

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <ThemedText type="defaultSemiBold" style={styles.topbarTitle}>Finances</ThemedText>
        <ThemedTouchable variant="ghost" onPress={() => bottomSheetRef.current?.expand()}>
          <ThemedIcon name="add-circle-outline" size={28} lightColor="#10b981" darkColor="#10b981" />
        </ThemedTouchable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {mainAccount && (
          <View style={[styles.mainCard, { backgroundColor: mainCardBg }]}>
            <ThemedText style={[styles.mainCardLabel, { color: statLabelColor }]}>Compte principal</ThemedText>
            <View style={styles.mainCardBalance}>
              <ThemedText style={[styles.mainCardBalanceText, { color: mainCardText }]}>
                {Number(mainAccount.balance).toFixed(2)} €
              </ThemedText>
            </View>
            <View style={styles.mainCardStats}>
              <View style={styles.mainCardStat}>
                <ThemedIcon name="arrow-down-outline" size={14} lightColor="#10b981" darkColor="#10b981" />
                <ThemedText style={[styles.mainCardStatText, { color: statLabelColor }]}>+{totalIncome.toFixed(2)}€</ThemedText>
              </View>
              <View style={styles.mainCardStat}>
                <ThemedIcon name="arrow-up-outline" size={14} lightColor="#ef4444" darkColor="#ef4444" />
                <ThemedText style={[styles.mainCardStatText, { color: statLabelColor }]}>-{totalExpenses.toFixed(2)}€</ThemedText>
              </View>
            </View>
          </View>
        )}

        {pocketAccount && (
          <View style={[styles.pocketCard, { backgroundColor: cardBg }]}>
            <View style={styles.pocketLeft}>
              <ThemedIcon name="wallet-outline" size={20} lightColor="#10b981" darkColor="#10b981" />
              <ThemedText style={styles.pocketLabel}>Argent de poche</ThemedText>
            </View>
            <ThemedText style={[styles.pocketBalance, { color: '#10b981' }]}>
              {Number(pocketAccount.balance).toFixed(2)}€
            </ThemedText>
          </View>
        )}

        <ThemedText style={[styles.sectionTitle, { color: mutedColor }]}>
          Transactions récentes
        </ThemedText>

        {transactions.length === 0 ? (
          <ThemedText style={[styles.empty, { color: mutedColor }]}>
            Aucune transaction
          </ThemedText>
        ) : (
          <View style={styles.transactionList}>
            {transactions.slice(0, 20).map(t => (
              <TransactionBadge key={t.id} transaction={t} />
            ))}
          </View>
        )}
      </ScrollView>

      <TransactionModal ref={bottomSheetRef} />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  topbarTitle: { fontSize: 26, fontWeight: '700' },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  mainCard: {
    borderWidth: 1.5,
    borderColor: '#0a7ea440',
    borderRadius: 16,
    padding: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mainCardLabel: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  mainCardBalance: { flexDirection: 'row', alignItems: 'baseline' },
  mainCardBalanceText: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, paddingTop: 6 },
  mainCardStats: { flexDirection: 'row', gap: 16, marginTop: 6, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#0a7ea420' },
  mainCardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mainCardStatText: { fontSize: 13, fontWeight: '600' },
  pocketCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pocketLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pocketLabel: { fontSize: 15, fontWeight: '500' },
  pocketBalance: { fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: -4 },
  transactionList: { gap: 10 },
  badge: {
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContent: { flex: 1, gap: 2 },
  badgeCategory: { fontSize: 15, fontWeight: '600' },
  badgeDesc: { fontSize: 13 },
  badgeRight: { alignItems: 'flex-end', gap: 2 },
  badgeAmount: { fontSize: 16, fontWeight: '700' },
  badgeDate: { fontSize: 12, fontWeight: '500' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14, fontStyle: 'italic' },
})