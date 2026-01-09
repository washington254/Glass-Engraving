import { create } from 'zustand'

export const useUIStore = create((set) => ({
    activePanel: null, // null | 'sticker' | 'bottom'
    setActivePanel: (panel) => set({ activePanel: panel }),
}))
