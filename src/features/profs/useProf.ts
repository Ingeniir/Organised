import { supabase } from "@/src/lib/supabase"
import { Prof } from "@/src/types/prof"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../auth/authStore"

const fetchProfs = async (userId: string) => {
    const { data, error } = await supabase
        .from('profs')
        .select('*')
        .eq('user_id', userId)
    
    if (error) throw error
    return data as Prof[]
}

export function useProfs() {
    const { user } = useAuthStore()
    return useQuery({
        queryKey: ['profs', user?.id],
        queryFn: () => fetchProfs(user!.id),
        enabled: !!user
    })
}

export function useAddProf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.rpc("add_prof", {
        p_name: name
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profs'] })
    }
  })
}

export function useDeleteProf() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { error } = await supabase
        .from('profs')
        .delete()
        .eq('user_id', user!.id)
        .eq('name', name)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profs'] })
    },
  })
}