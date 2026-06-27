import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { ComponentProps } from 'react'
import { create } from 'zustand'

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name']

export type ToastVariant = 'success' | 'warn' | 'error' | 'message'

export interface ToastItem {
  id: string
  variant: ToastVariant
  message: string
  icon?: MaterialIconName
  duration?: number
}

interface ToastState {
  toasts: ToastItem[]
  show: (toast: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

let _id = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (toast) => {
    const id = `toast_${++_id}_${Date.now()}`
    const duration = toast.duration ?? 3000

    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))

    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, duration + 500) // +500 pour laisser l'animation de sortie jouer
  },

  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))
