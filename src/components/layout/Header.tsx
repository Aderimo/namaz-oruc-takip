import { useTranslation } from 'react-i18next';
import LocationPicker from '../settings/LocationPicker';
import LanguageSwitch from '../settings/LanguageSwitch';
import LiveClock from '../common/LiveClock';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header
      className="
        relative z-10 mx-4 mt-4 rounded-2xl px-4 py-3
        bg-indigo-900/20 backdrop-blur-xl border border-indigo-200/30 shadow-lg
        dark:bg-white/5 dark:border-white/10
        sm:mx-6 sm:px-6
      "
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo & title */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌙</span>
          <h1 className="text-lg font-bold text-indigo-900 dark:text-white/90">
            {t('ui.header.title')}
          </h1>
        </div>

        {/* Location + controls */}
        <div className="flex flex-wrap items-center gap-3">
          <LiveClock />
          <LocationPicker />
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}
