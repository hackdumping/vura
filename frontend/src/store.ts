import { create } from 'zustand';
import translations, { type Language, type TranslationKeys } from './i18n';

interface User {
    id: number;
    username: string;
    email: string;
    is_premium: boolean;
    plan: 'free' | 'pro' | 'enterprise';
}

interface AppState {
    themeMode: 'light' | 'dark';
    toggleTheme: () => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationKeys;
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

const savedLang = (localStorage.getItem('vura_lang') as Language) || 'fr';
const savedUser = localStorage.getItem('user');
const userInitial = savedUser ? JSON.parse(savedUser) : null;

export const useAppStore = create<AppState>((set) => ({
    themeMode: (localStorage.getItem('vura_theme') as 'light' | 'dark') || 'dark',
    toggleTheme: () =>
        set((state) => {
            const next = state.themeMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('vura_theme', next);
            return { themeMode: next };
        }),
    language: savedLang,
    setLanguage: (lang: Language) => {
        localStorage.setItem('vura_lang', lang);
        set({ language: lang, t: translations[lang] });
    },
    t: translations[savedLang],
    user: userInitial,
    token: localStorage.getItem('token'),
    setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
    },
}));
