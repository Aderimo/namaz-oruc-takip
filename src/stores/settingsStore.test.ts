import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock cacheService
vi.mock('../services/cacheService', () => ({
  get: vi.fn(),
  set: vi.fn(),
}));

// Mock i18n
vi.mock('../i18n', () => ({
  default: { changeLanguage: vi.fn() },
  detectBrowserLanguage: vi.fn(() => 'tr'),
}));

// settingsStore'u her testten önce temiz yüklemek için dinamik import kullanıyoruz
async function loadStore() {
  // Modül önbelleğini temizle
  vi.resetModules();

  // Mock'ları yeniden tanımla (resetModules sonrası gerekli)
  vi.doMock('../services/cacheService', () => ({
    get: vi.fn(),
    set: vi.fn(),
  }));
  vi.doMock('../i18n', () => ({
    default: { changeLanguage: vi.fn() },
    detectBrowserLanguage: vi.fn(() => 'tr'),
  }));

  const mod = await import('./settingsStore');
  const cacheMod = await import('../services/cacheService');
  const i18nMod = await import('../i18n');
  return { useSettingsStore: mod.useSettingsStore, cacheService: cacheMod, i18n: i18nMod.default };
}

describe('useSettingsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // document.documentElement sınıflarını temizle
    document.documentElement.classList.remove('dark');
  });

  it('varsayılan tema "dark" ve dil "tr" olmalı (cache boşken)', async () => {
    const { useSettingsStore } = await loadStore();
    const state = useSettingsStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.language).toBe('tr');
  });

  it('başlangıçta dark tema sınıfı document.documentElement üzerine eklenmeli', async () => {
    await loadStore();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('localStorage\'dan kayıtlı ayarları yüklemeli', async () => {
    vi.resetModules();
    vi.doMock('../services/cacheService', () => ({
      get: vi.fn(() => ({ theme: 'light', language: 'en' })),
      set: vi.fn(),
    }));
    vi.doMock('../i18n', () => ({
      default: { changeLanguage: vi.fn() },
      detectBrowserLanguage: vi.fn(() => 'tr'),
    }));

    const mod = await import('./settingsStore');
    const state = mod.useSettingsStore.getState();
    expect(state.theme).toBe('light');
    expect(state.language).toBe('en');
  });

  describe('toggleTheme', () => {
    it('dark → light geçişi yapmalı', async () => {
      const { useSettingsStore } = await loadStore();
      useSettingsStore.getState().toggleTheme();

      const state = useSettingsStore.getState();
      expect(state.theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('light → dark geçişi yapmalı', async () => {
      const { useSettingsStore } = await loadStore();
      // Önce light'a geç
      useSettingsStore.getState().toggleTheme();
      expect(useSettingsStore.getState().theme).toBe('light');

      // Tekrar toggle → dark
      useSettingsStore.getState().toggleTheme();
      expect(useSettingsStore.getState().theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('tema değişikliğini localStorage\'a kaydetmeli', async () => {
      const { useSettingsStore, cacheService: cs } = await loadStore();
      useSettingsStore.getState().toggleTheme();

      expect(cs.set).toHaveBeenCalledWith(
        'settings',
        expect.objectContaining({ theme: 'light' }),
        expect.any(Number),
      );
    });

    it('çift toggle orijinal temayı geri getirmeli (idempotans)', async () => {
      const { useSettingsStore } = await loadStore();
      const original = useSettingsStore.getState().theme;

      useSettingsStore.getState().toggleTheme();
      useSettingsStore.getState().toggleTheme();

      expect(useSettingsStore.getState().theme).toBe(original);
    });
  });

  describe('setLanguage', () => {
    it('dili değiştirmeli', async () => {
      const { useSettingsStore } = await loadStore();
      useSettingsStore.getState().setLanguage('en');
      expect(useSettingsStore.getState().language).toBe('en');
    });

    it('i18next.changeLanguage çağırmalı', async () => {
      const { useSettingsStore, i18n: i18nInstance } = await loadStore();
      useSettingsStore.getState().setLanguage('en');
      expect(i18nInstance.changeLanguage).toHaveBeenCalledWith('en');
    });

    it('dil değişikliğini localStorage\'a kaydetmeli', async () => {
      const { useSettingsStore, cacheService: cs } = await loadStore();
      useSettingsStore.getState().setLanguage('en');

      expect(cs.set).toHaveBeenCalledWith(
        'settings',
        expect.objectContaining({ language: 'en' }),
        expect.any(Number),
      );
    });
  });
});
