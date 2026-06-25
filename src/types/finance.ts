export interface BankAccount {
    id: string
    user_id: string
    name: string
    type: 'main' | 'pocket'
    balance: number
    created_at: string
}

export interface Transaction {
    id: string
    user_id: string
    account_id: string
    amount: number
    type: 'expense' | 'income' | 'transfer'
    category: string
    description?: string
    created_at: string
}

export type NewBankAccount = Omit<BankAccount, 'id' | 'user_id' | 'created_at' | 'balance'>
export type NewTransaction = Omit<Transaction, 'id' | 'user_id' | 'created_at'>