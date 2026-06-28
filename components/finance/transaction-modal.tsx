import { ThemedBottomSheetInput } from '@/components/themed-bottom-sheet-input'
import { ThemedIcon } from '@/components/themed-icon'
import { ThemedText } from '@/components/themed-text'
import { ThemedTouchable } from '@/components/themed-touchable'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useBankAccounts, useCreateTransaction } from '@/src/features/finance/useFinance'
import Ionicons from '@expo/vector-icons/Ionicons'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { forwardRef, useEffect, useState } from 'react'
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

export const TransactionModal = forwardRef<BottomSheet, {}>((_, ref) => {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Autre')
  const [description, setDescription] = useState('')

  const { data: accounts = [] } = useBankAccounts()
  const [accountId, setAccountId] = useState<string | null>(null)
  const { mutate: createTransaction, isPending } = useCreateTransaction()

  const bg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background')
  const handleColor = useThemeColor({ light: '#e5e5e5', dark: '#3a3a3c' }, 'text')
  const mutedColor = useThemeColor({ light: '#8e8e93', dark: '#8e8e93' }, 'text')
  const chipBg = useThemeColor({ light: '#f2f2f7', dark: '#2c2c2e' }, 'background')
  const borderTheme = useThemeColor({ light: '#e5e5ea', dark: '#3a3a3c' }, 'border')

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id)
    }
  }, [accounts])

  const reset = () => {
    setType('expense')
    setAmount('')
    setCategory(CATEGORIES['expense'][0])
    setDescription('')
    if (accounts.length > 0) {
      setAccountId(accounts[0].id)
    }
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
      snapPoints={['75%', '95%']}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: handleColor }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.amountRow}>
          <ThemedBottomSheetInput
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={[styles.amountInput, { color: TYPE_LABELS[type].color, borderBottomColor: TYPE_LABELS[type].color }]}
          />
          <Ionicons name="logo-euro" size={32} style={[styles.currency, { color: TYPE_LABELS[type].color }]}/>
        </View>

        <View style={[styles.typeRow, { backgroundColor: chipBg }]}>
          {(Object.keys(TYPE_LABELS) as TransactionType[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeBtn,
                type === t && { backgroundColor: TYPE_LABELS[t].color },
              ]}
              onPress={() => handleTypeChange(t)}
              activeOpacity={0.9}
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

        <ThemedText style={[styles.label, { color: mutedColor }]}>Compte</ThemedText>
        {accounts.length === 0 ? (
          <ThemedText style={[styles.emptyHint, { color: mutedColor }]}>
            Aucun compte disponible.
          </ThemedText>
        ) : (
          <View style={styles.chips}>
            {accounts.map(a => {
              const isSelected = accountId === a.id
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.chip,
                    { backgroundColor: chipBg, borderColor: borderTheme, borderWidth: StyleSheet.hairlineWidth },
                    isSelected && { backgroundColor: '#10b98115', borderColor: '#10b981', borderWidth: 1 },
                  ]}
                  onPress={() => setAccountId(a.id)}
                  activeOpacity={0.8}
                >
                  <ThemedIcon
                    name={a.type === 'main' ? 'card-outline' : 'wallet-outline'}
                    size={14}
                    lightColor={isSelected ? '#10b981' : mutedColor}
                    darkColor={isSelected ? '#10b981' : mutedColor}
                  />
                  <ThemedText style={[
                    styles.chipText,
                    { color: isSelected ? '#10b981' : mutedColor, fontWeight: isSelected ? '600' : '500' }
                  ]}>
                    {a.name}
                  </ThemedText>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        <ThemedText style={[styles.label, { color: mutedColor }]}>Catégorie</ThemedText>
        <View style={styles.chips}>
          {CATEGORIES[type].map(c => {
            const isSelected = category === c
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.chip,
                  { backgroundColor: chipBg, borderColor: borderTheme, borderWidth: StyleSheet.hairlineWidth },
                  isSelected && { backgroundColor: TYPE_LABELS[type].color + '15', borderColor: TYPE_LABELS[type].color, borderWidth: 1 },
                ]}
                onPress={() => setCategory(c)}
                activeOpacity={0.8}
              >
                <ThemedText style={[
                  styles.chipText,
                  { color: isSelected ? TYPE_LABELS[type].color : mutedColor, fontWeight: isSelected ? '600' : '500' }
                ]}>
                  {c}
                </ThemedText>
              </TouchableOpacity>
            )
          })}
        </View>

        <ThemedText style={[styles.label, { color: mutedColor }]}>Informations</ThemedText>
        <ThemedBottomSheetInput
          placeholder="Description (optionnel)"
          value={description}
          onChangeText={setDescription}
          style={[styles.descInput, { borderColor: borderTheme, backgroundColor: chipBg }]}
        />

        <ThemedTouchable
          variant="primary"
          onPress={handleSubmit}
          disabled={isPending}
          style={[styles.submitBtn, { backgroundColor: TYPE_LABELS[type].color }]}
        >
          <ThemedText style={styles.submitText}>
            {isPending ? 'Enregistrement...' : `Ajouter la ${TYPE_LABELS[type].label.toLowerCase()}`}
          </ThemedText>
        </ThemedTouchable>
      </BottomSheetScrollView>
    </BottomSheet>
  )
})

TransactionModal.displayName = 'TransactionModal'

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  currency: { fontSize: 36, fontWeight: '400' },
  amountInput: {
    fontSize: 52,
    fontWeight: '700',
    minWidth: 140,
    textAlign: 'center',
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingVertical: 4,
    borderBottomWidth: 2,
  },
  typeRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  typeBtnText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontSize: 14 },
  descInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  emptyHint: { fontSize: 14, fontStyle: 'italic', paddingVertical: 4 },
  submitBtn: { marginTop: 12, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})