import { create } from 'zustand'

interface SettingsState {
  showICalL2: boolean
  showICalL3: boolean
  toggleICalL: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  showICalL2: true,
  showICalL3: false,
  toggleICalL: () => set(s => ({ showICalL2: !s.showICalL2, showICalL3: !s.showICalL3 })),
}))