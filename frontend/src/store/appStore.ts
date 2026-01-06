import { create } from 'zustand';

type Mode = 'crypto' | 'rwa';
type Theme = 'dark' | 'light';

interface AppState {
    mode: Mode;
    theme: Theme;
    toggleMode: () => void;
    setMode: (mode: Mode) => void;
    toggleTheme: () => void;
}

// Load initial mode from localStorage, default to 'rwa'
const getInitialMode = (): Mode => {
    const stored = localStorage.getItem('orbit-mode');
    return (stored === 'rwa' || stored === 'crypto') ? stored : 'rwa';
};

export const useAppStore = create<AppState>((set) => ({
    mode: getInitialMode(),
    theme: 'dark',
    toggleMode: () => set((state) => {
        const newMode = state.mode === 'crypto' ? 'rwa' : 'crypto';
        localStorage.setItem('orbit-mode', newMode);
        return { mode: newMode };
    }),
    setMode: (mode) => {
        localStorage.setItem('orbit-mode', mode);
        set({ mode });
    },
    toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
