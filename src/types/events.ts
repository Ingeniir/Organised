export interface CalendarEvent {
    id: string
    user_id: string
    title: string
    description?: string
    start_at: string
    end_at: string
    color: string
    created_at: string
}

export type NewEvent = Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>