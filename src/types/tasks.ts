export interface Task {
    id: string
    user_id: string
    title: string
    description?: string
    is_completed: boolean
    duration_minutes?: number
    due_date?: string
    due_time?: string
    created_at: string
}

export interface SubTask {
    id: string
    task_id: string
    title: string
    is_completed: boolean
}

export type NewTask = Omit<Task, 'id' | 'user_id' | 'created_at'> & {
  subtasks?: { title: string }[]
}