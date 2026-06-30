export interface Presence {
    id: string
    created_at: string
    uid: string
    status: 'present' | 'absent'
}