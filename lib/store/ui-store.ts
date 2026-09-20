import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UiState {
  sidebarOpen: boolean
  activeTab: string
  activeModal: string | null
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setActiveTab: (tab: string) => void
  setActiveModal: (modal: string | null) => void
  closeModal: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeTab: 'feed',
      activeModal: null,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),
    }),
    {
      name: 'wink-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        activeTab: state.activeTab,
      }),
    }
  )
)
