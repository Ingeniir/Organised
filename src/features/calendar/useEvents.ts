import { supabase } from "@/src/lib/supabase"
import { CalendarEvent, NewEvent } from "@/src/types/events"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from "../auth/authStore"

const fetchEvents = async (userId: string, from: string, to: string) => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_at', from)
        .lte('start_at', to)
        .order('start_at')

    if (error) throw error
    return data as CalendarEvent[]
}

export function useEvents(from: string, to: string) {
    const { user } = useAuthStore()

    return useQuery({
        queryKey: ['events', user?.id, from, to],
        queryFn: () => fetchEvents(user!.id, from, to),
        enabled: !!user,
    })
}

export function useCreateEvent() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (event: NewEvent) => {
            const { data, error } = await supabase
                .from('events')
                .insert({ ...event, user_id: user!.id})
                .select()
                .single()
            if (error) throw error
            return data
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    })
}

export function useDeleteEvent() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('events').delete().eq('id', id)

            if (error) throw error
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] })
    })
}