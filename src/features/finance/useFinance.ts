import { useAuthStore } from '@/src/features/auth/authStore'
import { supabase } from '@/src/lib/supabase'
import { BankAccount, NewBankAccount, NewTransaction, Transaction } from '@/src/types/finance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// ─── Fetch ───────────────────────────────────────────────────────────────────

const fetchAccounts = async (userId: string) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
  if (error) throw error
  return data as BankAccount[]
}

const fetchTransactions = async (userId: string, accountId?: string) => {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (accountId) query = query.eq('account_id', accountId)

  const { data, error } = await query
  if (error) throw error
  return data as Transaction[]
}

// ─── Hooks query ─────────────────────────────────────────────────────────────

const ensureAccounts = async (userId: string) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')

  if (error) throw error

  if (!data || data.length === 0) {
    const { data: newAccounts, error: createError } = await supabase
      .from('bank_accounts')
      .insert([
        { user_id: userId, name: 'Compte Principal', type: 'main', balance: 0 },
        { user_id: userId, name: 'Argent de Poche', type: 'pocket', balance: 0 },
      ])
      .select()

    if (createError) throw createError
    return newAccounts as BankAccount[]
  }

  return data as BankAccount[]
}

export function useBankAccounts() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['bank_accounts', user?.id],
    queryFn: () => ensureAccounts(user!.id),
    enabled: !!user,
  })
}

export function useTransactions(accountId?: string) {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['transactions', user?.id, accountId],
    queryFn: () => fetchTransactions(user!.id, accountId),
    enabled: !!user,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateBankAccount() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (account: NewBankAccount) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({ ...account, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bank_accounts'] }),
  })
}

export function useCreateTransaction() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transaction: NewTransaction) => {
    const { error } = await supabase.rpc('add_transaction', {
        p_account_id: transaction.account_id,
        p_user_id: user!.id,
        p_amount: transaction.amount,
        p_type: transaction.type,
        p_category: transaction.category,
        p_description: transaction.description ?? null,
    })
    if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] }) // balance se met à jour via trigger
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] })
    },
  })
}