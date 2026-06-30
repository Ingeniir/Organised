import { supabase } from "@/src/lib/supabase";
import { Presence } from "@/src/types/presence";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../auth/authStore";

const fetchPresences = async (userId: string) => {
    const { data, error } = await supabase
        .from('presences')
        .select('*')
        .eq('user_id', userId)

    if (error) throw error
    return data as Presence[]
}

export function usePresences() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['presences', user?.id],
    queryFn: () => fetchPresences(user!.id),
    enabled: !!user,
  })
}

export function useSyncPresence() {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (events: any[]) => {
            if (!user || events.length === 0) return

            const newRows = events.map(e => ({
                user_id: user.id,
                uid: e.uid,
                status: 'absent',
            }))

            const { error } = await supabase
                .from('presences')
                .upsert(newRows, { 
                    onConflict: 'user_id,uid', 
                    ignoreDuplicates: true 
                })
            
            if (error) throw error
        },
        onError: (error) => {
            console.error("Erreur Supabase RLS ou Insertion :", error)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presences', user?.id] })
        }
    })
}

export function useUpdatePresence() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async ({ uid, status}: { uid: string, status: "present" | "absent" }) => {
            const { error } = await supabase
                .from('presences')
                .update({ status: status })
                .eq('uid', uid)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presences'] })
        }
    })
}