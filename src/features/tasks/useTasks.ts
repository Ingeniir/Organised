import { supabase } from "@/src/lib/supabase"
import { NewTask, SubTask, Task } from "@/src/types/tasks"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../auth/authStore"

const fetchTasks = async (userId: string) => {
    const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('user_id', userId)
        .order('created_at')

    if (error) throw error
    return data as (Task & { subtasks: SubTask[] })[]
}

export function useTasks() {
    const { user } = useAuthStore()

    return useQuery({
        queryKey: ['tasks', user?.id],
        queryFn: () => fetchTasks(user!.id),
        enabled: !!user,
    })
}

export function useCreateTask() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (task: NewTask) => {
            const { subtasks, ...taskData } = task
            
            // Création de la tâche
            const { data, error } = await supabase
                .from('tasks')
                .insert({ ...taskData, user_id: user!.id })
                .select()
                .single()
            if (error) throw error

            // Créer le subtasks si présents
            if (subtasks && subtasks.length > 0) {
                const { error: subError } = await supabase
                .from('subtasks')
                .insert(subtasks.map(s => ({ title: s.title, task_id: data.id })))
                if (subError) throw subError
            }
            return data
        },
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['tasks']
        }),
    })
}

export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('tasks').delete().eq('id', id)

            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['tasks']
        })
    })
}

export function useToggleTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({id, is_completed, type}: {id: string, is_completed: boolean, type: 'task' | 'subtask'}) => {
            if (type === 'subtask') {
                const { error } = await supabase
                    .from('subtasks')
                    .update({ is_completed: !is_completed})
                    .eq('id', id)
                
                if (error) throw error
                return
            } else {
                const { error } = await supabase
                    .from('tasks')
                    .update({ is_completed: !is_completed})
                    .eq('id', id)

                if (error) throw error
            }
        },
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['tasks']
        })
    })
}