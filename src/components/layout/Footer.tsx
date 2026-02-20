import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative z-10 py-4 px-4 text-center">
      <p className="text-xs text-indigo-400/50 dark:text-white/30">
        {t('ui.footer.disclaimer')}
      </p>
      <p className="mt-1 text-xs text-indigo-400/40 dark:text-white/20">
        🌙 {t('ui.footer.text')}
      </p>
    </footer>
  );
}
