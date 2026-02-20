import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './tr.json';
import en from './en.json';

export type SupportedLanguage = 'tr' | 'en';

/**
 * Tarayıcı dilini tespit eder ve desteklenen bir dil kodu döndürür.
 * - 'tr' ile başlayan diller → 'tr'
 * - 'en' ile başlayan diller → 'en'
 * - Diğer tüm diller → 'tr' (varsayılan)
 */
export function detectBrowserLanguage(): SupportedLanguage {
  const browserLang =
    typeof navigator !== 'undefined' ? navigator.language || '' : '';
  const lang = browserLang.toLowerCase();

  if (lang.startsWith('tr')) return 'tr';
  if (lang.startsWith('en')) return 'en';
  return 'tr';
}

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: detectBrowserLanguage(),
  fallbackLng: 'tr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
