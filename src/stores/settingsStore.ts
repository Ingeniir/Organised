import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface SettingsState {
  showIcal: boolean
  showICalL2: boolean
  showICalL3: boolean
  profs: string[]
  addProf: (name: string) => void
  removeProf: (name: string) => void
  toggleICalL: () => void
  onShowICal: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showIcal: true,
      showICalL2: true,
      showICalL3: false,
      
      // Initialisation de la liste vide
      profs: [],

      // Action pour ajouter un prof (en évitant les doublons et en nettoyant les espaces)
      addProf: (name) => set((state) => {
        const cleanedName = name.trim()
        if (!cleanedName || state.profs.includes(cleanedName)) return state
        return { profs: [...state.profs, cleanedName] }
      }),

      // Action pour supprimer un prof
      removeProf: (name) => set((state) => ({
        profs: state.profs.filter((p) => p !== name)
      })),

      toggleICalL: () => set((state) => ({ showICalL2: !state.showICalL2, showICalL3: !state.showICalL3 })),
      onShowICal: () => set((state) => ({ showIcal: !state.showIcal })),
    }),
    {
      name: 'settings-storage', // Clé unique pour AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)