import { create } from "zustand";

interface CalendarState {
    mode: 'week' | 'month'
    setMode: (mode: 'week' | 'month') => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
    mode: 'week',
    setMode: (mode) => set({ mode: mode })
}))