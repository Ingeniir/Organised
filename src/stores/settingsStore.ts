import { create } from 'zustand'

interface SettingsState {
  showICalL2: boolean
  showICalL3: boolean
  showIcal: boolean
  toggleICalL: () => void
  onShowICal: () => void
}

export const useSettingsStore = create<SettingsState>((set, state) => ({
    showIcal: true,
  showICalL2: true,
  showICalL3: false,
  toggleICalL: () => set(s => ({ showICalL2: !s.showICalL2, showICalL3: !s.showICalL3 })),
  onShowICal: () => set(s => ({ showIcal: !s.showICalL2 }))
}))