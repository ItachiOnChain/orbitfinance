import { create } from 'zustand';

interface AppState {
    mode: 'crypto' | 'rwa';
    theme: 'light' | 'dark';
    toggleMode: () => void;
    toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    mode: 'crypto',
    theme: 'dark',
    toggleMode: () => set((state) => ({
        mode: state.mode === 'crypto' ? 'rwa' : 'crypto'
    })),
    toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
    })),
}));
