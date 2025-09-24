import { create } from 'zustand';

export type ViewMode = 'grid' | 'list' | 'map';

interface ViewModeStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewMode = create<ViewModeStore>((set) => ({
  viewMode: 'grid',
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
}));