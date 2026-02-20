import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settingsStore';
import type { SupportedLanguage } from '../../i18n';

const LANGUAGES: { code: SupportedLanguage; flag: string; label: string }[] = [
  { code: 'tr', flag: '🇹🇷', label: 'TR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
];

export default function LanguageSwitch() {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const next = language === 'tr' ? 'en' : 'tr';
  const current = LANGUAGES.find((l) => l.code === language)!;
  const nextLang = LANGUAGES.find((l) => l.code === next)!;

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      className="
        rounded-lg px-3 py-1.5 text-xs font-medium
        bg-indigo-100/50 text-indigo-800 border border-indigo-200/40
        dark:bg-white/10 dark:text-white/70 dark:border-white/10
        hover:bg-indigo-200/50 dark:hover:bg-white/20 transition-colors
        flex items-center gap-1.5
      "
      aria-label={t('settings.language')}
      title={`${current.label} → ${nextLang.label}`}
    >
      <span className="text-sm">{current.flag}</span>
      <span>{current.label}</span>
    </button>
  );
}
