import { ThemedBottomSheetInput } from '@/components/themed-bottom-sheet-input'
import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { ThemedTouchable } from '@/components/themed-touchable'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useBankAccounts, useCreateTransaction } from '@/src/features/finance/useFinance'
import Ionicons from '@expo/vector-icons/Ionicons'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { forwardRef, useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'

const CATEGORIES = {
  expense: ['Alimentation', 'Transport', 'Loisirs', 'Santé', 'Shopping', 'Abonnement', 'Autre'],
  income: ['Salaire', 'Virement', 'Remboursement', 'Autre'],
  transfer: ['Virement'],
}

const TYPE_LABELS = {
  expense: { label: 'Dépense', color: '#ef4444', icon: 'arrow-up-outline' },
  income: { label: 'Revenu', color: '#10b981', icon: 'arrow-down-outline' },
  transfer: { label: 'Virement', color: '#6366f1', icon: 'swap-horizontal-outline' },
} as const

type TransactionType = keyof typeof TYPE_LABELS

// eslint-disable-next-line react/display-name
export const TransactionModal = forwardRef<BottomSheet, {}>((_, ref) => {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Autre')
  const [description, setDescription] = useState('')

  const { data: accounts = [] } = useBankAccounts()
  const [accountId, setAccountId] = useState<string | null>(accounts[0].id)
  const { mutate: createTransaction, isPending } = useCreateTransaction()

  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const mutedColor = useThemeColor({ light: '#999', dark: '#666' }, 'text')
  const chipBg = useThemeColor({ light: '#f0f0f0', dark: '#2c2c2e' }, 'background')

  const reset = () => {
    setType('expense')
    setAmount('')
    setCategory('Autre')
    setDescription('')
    setAccountId(null)
  }

  const handleTypeChange = (t: TransactionType) => {
    setType(t)
    setCategory(CATEGORIES[t][0])
  }

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount))) {
      return Alert.alert('Erreur', 'Montant invalide')
    }
    if (!accountId) {
      return Alert.alert('Erreur', 'Sélectionne un compte')
    }

    console.log('Montant: ', amount)

    createTransaction(
      {
        account_id: accountId,
        amount: parseFloat(amount),
        type,
        category,
        description: description || undefined,
      },
      {
        onSuccess: () => {
          reset()
          ;(ref as any)?.current?.close()
        },
      }
    )
  }

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={['70%', '90%']}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.container}>

        {/* Montant */}
        <View style={styles.amountRow}>
          <ThemedBottomSheetInput
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={[styles.amountInput, { color: TYPE_LABELS[type].color, borderBottomColor: TYPE_LABELS[type].color }]}
          />
          <Ionicons name="logo-euro" size={28} style={[styles.currency, { color: TYPE_LABELS[type].color }]}/>
        </View>

        {/* Type */}
        <View style={[styles.typeRow, { backgroundColor: chipBg }]}>
          {(Object.keys(TYPE_LABELS) as TransactionType[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeBtn,
                type === t && { backgroundColor: TYPE_LABELS[t].color },
              ]}
              onPress={() => handleTypeChange(t)}
            >
              <ThemedIcon
                name={TYPE_LABELS[t].icon as any}
                size={14}
                lightColor={type === t ? '#fff' : mutedColor}
                darkColor={type === t ? '#fff' : mutedColor}
              />
              <ThemedText style={[
                styles.typeBtnText,
                { color: type === t ? '#fff' : mutedColor }
              ]}>
                {TYPE_LABELS[t].label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Compte */}
        <ThemedText style={[styles.label, { color: mutedColor }]}>Compte</ThemedText>
        {accounts.length === 0 ? (
          <ThemedText style={[styles.emptyHint, { color: mutedColor }]}>
            Aucun compte disponible. Réouvre le modal.
          </ThemedText>
        ) : (
        <View style={styles.chips}>
          {accounts.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[
                styles.chip,
                { backgroundColor: chipBg },
                accountId === a.id && { backgroundColor: '#6366f120', borderColor: '#6366f1', borderWidth: 1 },
              ]}
              onPress={() => setAccountId(a.id)}
            >
              <ThemedIcon
                name={a.type === 'main' ? 'card-outline' : 'wallet-outline'}
                size={14}
                lightColor={accountId === a.id ? '#6366f1' : mutedColor}
                darkColor={accountId === a.id ? '#6366f1' : mutedColor}
              />
              <ThemedText style={[
                styles.chipText,
                { color: accountId === a.id ? '#6366f1' : mutedColor }
              ]}>
                {a.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        )}

        {/* Catégorie */}
        <ThemedText style={[styles.label, { color: mutedColor }]}>Catégorie</ThemedText>
        <View style={styles.chips}>
          {CATEGORIES[type].map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.chip,
                { backgroundColor: chipBg },
                category === c && { backgroundColor: TYPE_LABELS[type].color + '20', borderColor: TYPE_LABELS[type].color, borderWidth: 1 },
              ]}
              onPress={() => setCategory(c)}
            >
              <ThemedText style={[
                styles.chipText,
                { color: category === c ? TYPE_LABELS[type].color : mutedColor }
              ]}>
                {c}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <ThemedBottomSheetInput
          placeholder="Description (optionnel)"
          value={description}
          onChangeText={setDescription}
        />

        <ThemedTouchable
          variant="primary"
          onPress={handleSubmit}
          disabled={isPending}
          style={[styles.submitBtn, { backgroundColor: TYPE_LABELS[type].color }]}
        >
          <ThemedText style={styles.submitText}>
            {isPending ? 'Enregistrement...' : `Ajouter ${TYPE_LABELS[type].label.toLowerCase()}`}
          </ThemedText>
        </ThemedTouchable>

      </BottomSheetScrollView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  container: { padding: 20, gap: 18 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: -1,
    paddingVertical: 8,
  },
  currency: { fontSize: 32, fontWeight: '300' },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    minWidth: 120,
    textAlign: 'center',
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingVertical: 4,
    borderBottomWidth: 2,
  },
  typeRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  typeBtnText: { fontSize: 13, fontWeight: '500' },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontSize: 13 },
  emptyHint: { fontSize: 13, fontStyle: 'italic', paddingVertical: 4 },
  submitBtn: { marginTop: 4, paddingVertical: 12, borderRadius: 8 },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})