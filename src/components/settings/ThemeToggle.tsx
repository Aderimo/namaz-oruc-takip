import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settingsStore';

export default function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        relative rounded-lg px-3 py-1.5 text-xs font-medium
        bg-indigo-100/50 text-indigo-800 border border-indigo-200/40
        dark:bg-white/10 dark:text-white/70 dark:border-white/10
        hover:bg-indigo-200/50 dark:hover:bg-white/20 transition-colors
        flex items-center gap-1.5 overflow-hidden
      "
      aria-label={
        isDark ? t('settings.themeLight') : t('settings.themeDark')
      }
      title={isDark ? t('settings.themeLight') : t('settings.themeDark')}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -16, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 16, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="inline-block text-sm"
        >
          {isDark ? '🌙' : '☀️'}
        </motion.span>
      </AnimatePresence>
      <span>{isDark ? t('settings.themeDark') : t('settings.themeLight')}</span>
    </button>
  );
}
