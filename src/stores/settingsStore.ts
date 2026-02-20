import { create } from 'zustand';
import * as cacheService from '../services/cacheService';
import i18n, { detectBrowserLanguage } from '../i18n';
import type { SupportedLanguage } from '../i18n';

const SETTINGS_KEY = 'settings';
const SETTINGS_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 yıl

interface PersistedSettings {
  theme: 'dark' | 'light';
  language: SupportedLanguage;
}

interface SettingsState {
  theme: 'dark' | 'light';
  language: SupportedLanguage;
  toggleTheme: () => void;
  setLanguage: (lang: SupportedLanguage) => void;
}

function loadSettings(): PersistedSettings {
  const saved = cacheService.get<PersistedSettings>(SETTINGS_KEY);
  return {
    theme: 'dark',
    language: saved?.language ?? detectBrowserLanguage(),
  };
}

function persistSettings(settings: PersistedSettings): void {
  cacheService.set(SETTINGS_KEY, settings, SETTINGS_TTL_MS);
}

function applyThemeClass(theme: 'dark' | 'light'): void {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

// Başlangıçta tema sınıfını uygula
const initialSettings = loadSettings();
applyThemeClass(initialSettings.theme);

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: initialSettings.theme,
  language: initialSettings.language,

  toggleTheme: () => {
    const current = get().theme;
    const newTheme = current === 'dark' ? 'light' : 'dark';

    // Enable smooth theme transition temporarily
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('theme-transitioning');
    }

    applyThemeClass(newTheme);
    persistSettings({ theme: newTheme, language: get().language });
    set({ theme: newTheme });

    // Remove transition class after animation completes
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 350);
    }
  },

  setLanguage: (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    persistSettings({ theme: get().theme, language: lang });
    set({ language: lang });
  },
}));
