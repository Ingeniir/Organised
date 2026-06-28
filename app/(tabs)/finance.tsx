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
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const cardBg = useThemeColor({ light: '#f9f9f9', dark: '#1c1c1e' }, 'background')

  const isIncome = transaction.type === 'income'
  const isTransfer = transaction.type === 'transfer'
  const amountColor = isIncome ? '#10b981' : isTransfer ? '#6366f1' : '#ef4444'
  const icon = CATEGORY_ICONS[transaction.category] ?? 'ellipse-outline'
  const { mutate: deleteTransaction, isPending } = useDeleteTransaction()
  const toast = useToastStore();
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
                  message: `-${Number(transaction.amount).toFixed(2)}€`
                })
              },
              onError: (error) => {
                Alert.alert('Erreur', 'Impossible de supprimer la transaction')
              }
            })
          },
        },
      ]
    )
  }

  return (
    <TouchableOpacity
      onLongPress={handleDelete}
      delayLongPress={400}
      disabled={isPending}
    >
      <View style={[styles.badge, { backgroundColor: cardBg }]}>
        <View style={[styles.badgeIcon, { backgroundColor: amountColor + '20' }]}>
          <ThemedIcon
            name={icon as any}
            size={18}
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
            {isIncome ? '+' : isTransfer ? '↔' : '-'}{Math.abs(transaction.account_id === accounts[1].id ? transaction.amount * 2 : transaction.amount).toFixed(2)}€
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
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const cardBg = useThemeColor({ light: '#f9f9f9', dark: '#1c1c1e' }, 'background')

  const bottomSheetRef = useRef<BottomSheet>(null)

  const mainAccount = accounts.find(a => a.type === 'main')
  const pocketAccount = accounts.find(a => a.type === 'pocket')

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.account_id === accounts[1].id ? Number(t.amount) * 2 : Number(t.amount)), 0)

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <ThemedText type="defaultSemiBold" style={styles.topbarTitle}>Finances</ThemedText>
        <ThemedTouchable variant="ghost" onPress={() => bottomSheetRef.current?.expand()}>
          <ThemedIcon name="add-circle-outline" size={26} lightColor="#6366f1" darkColor="#6366f1" />
        </ThemedTouchable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Compte principal */}
        {mainAccount && (
          <ThemedView lightColor='#f9f6f0' style={styles.mainCard}>
            <ThemedText style={styles.mainCardLabel}>Compte principal</ThemedText>
            <ThemedView lightColor='#f9f6f0' style={styles.mainCardBalance}>
              <ThemedText lightColor='#0a7ea4' darkColor='#f9f9f9' style={styles.mainCardBalanceText}>
                {Number(mainAccount.balance).toFixed(2)}
              </ThemedText>
              <ThemedIcon lightColor='#0a7ea4' darkColor='#f9f9f9' name="logo-euro" size={18} />
            </ThemedView>
            <View style={styles.mainCardStats}>
              <View style={styles.mainCardStat}>
                <ThemedIcon name="arrow-down-outline" size={14} lightColor='#00000090' darkColor='#ffffffcc' />
                <ThemedText lightColor='#00000090' darkColor='#ffffffcc' style={styles.mainCardStatText}>+{totalIncome.toFixed(2)}€</ThemedText>
              </View>
              <View style={styles.mainCardStat}>
                <ThemedIcon name="arrow-up-outline" size={14} lightColor='#00000090' darkColor='#ffffffcc' />
                <ThemedText lightColor='#00000090' darkColor='#ffffffcc' style={styles.mainCardStatText}>-{totalExpenses.toFixed(2)}€</ThemedText>
              </View>
            </View>
          </ThemedView>
        )}

        {/* Argent de poche */}
        {pocketAccount && (
          <View style={[styles.pocketCard, { backgroundColor: cardBg }]}>
            <View style={styles.pocketLeft}>
              <ThemedIcon name="wallet-outline" size={18} lightColor="#10b981" darkColor="#10b981" />
              <ThemedText style={[styles.pocketLabel, { color: mutedColor }]}>Argent de poche</ThemedText>
            </View>
            <ThemedText style={styles.pocketBalance}>
              {Number(pocketAccount.balance).toFixed(2)}€
            </ThemedText>
          </View>
        )}

        {/* Transactions */}
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
  topbarTitle: { fontSize: 24 },
  scroll: { padding: 16, gap: 12 },

  // Compte principal
  mainCard: {
    borderWidth: 2,
    borderColor: '#0a7ea4',
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  mainCardLabel: { fontSize: 13 },
  mainCardBalance: { position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 4, height: 28 },
  mainCardBalanceText: { fontSize: 24, fontWeight: 'bold', letterSpacing: -1 },
  mainCardStats: { flexDirection: 'row', gap: 16, marginTop: 4 },
  mainCardStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mainCardStatText: { fontSize: 13 },

  // Argent de poche
  pocketCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pocketLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pocketLabel: { fontSize: 14 },
  pocketBalance: { fontSize: 18, fontWeight: '600' },

  // Transactions
  sectionTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 },
  transactionList: { gap: 8 },
  badge: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContent: { flex: 1, gap: 2 },
  badgeCategory: { fontSize: 14, fontWeight: '500' },
  badgeDesc: { fontSize: 12 },
  badgeRight: { alignItems: 'flex-end', gap: 2 },
  badgeAmount: { fontSize: 15, fontWeight: '600' },
  badgeDate: { fontSize: 11 },
  empty: { textAlign: 'center', marginTop: 40, opacity: 0.4 },
})