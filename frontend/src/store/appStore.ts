import { create } from 'zustand';

interface AppState {
    mode: 'crypto' | 'rwa';
    toggleMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    mode: 'crypto',
    toggleMode: () => set((state) => ({
        mode: state.mode === 'crypto' ? 'rwa' : 'crypto'
    })),
}));
