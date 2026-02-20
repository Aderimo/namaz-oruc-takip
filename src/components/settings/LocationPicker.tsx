import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '../../hooks/useLocation';
import type { LocationData } from '../../types';

export default function LocationPicker() {
  const { t } = useTranslation();
  const { location, isLoading, error, searchCity, setLocation } = useLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 2) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(() => {
        const found = searchCity(value.trim());
        setResults(found);
      }, 300);
    },
    [searchCity],
  );

  const handleSelect = useCallback(
    (city: LocationData) => {
      setLocation(city);
      setQuery('');
      setResults([]);
      setIsOpen(false);
    },
    [setLocation],
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Current location display */}
      {location && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="
            flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
            bg-indigo-100/50 text-indigo-800 border border-indigo-200/40
            dark:bg-white/10 dark:text-white/70 dark:border-white/10
            hover:bg-indigo-200/50 dark:hover:bg-white/20 transition-colors
          "
          aria-label={t('settings.locationChange')}
          title={t('settings.locationCurrent', {
            city: location.city,
            country: location.country,
          })}
        >
          <span className="text-sm">📍</span>
          <span className="max-w-[120px] truncate">
            {location.city}, {location.country}
          </span>
        </button>
      )}

      {/* Loading state */}
      {isLoading && !isOpen && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-700/70 dark:text-white/50">
          <span className="animate-spin text-sm">⏳</span>
          {t('ui.label.loading')}
        </span>
      )}

      {/* Error state */}
      {error && !location && !isOpen && (
        <span className="px-3 py-1.5 text-xs text-red-500 dark:text-red-400">
          {t('error.locationNotFound')}
        </span>
      )}

      {/* Search panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute right-0 top-0 z-50 w-64
              rounded-xl p-3
              bg-white/90 backdrop-blur-xl border border-indigo-200/40 shadow-xl
              dark:bg-gray-900/90 dark:border-white/10
            "
          >
            {/* Search input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t('ui.button.search')}
                autoFocus
                className="
                  flex-1 rounded-lg px-3 py-1.5 text-xs
                  bg-indigo-50/50 border border-indigo-200/30
                  dark:bg-white/5 dark:border-white/10 dark:text-white/90
                  placeholder:text-gray-400 dark:placeholder:text-white/30
                  outline-none focus:ring-1 focus:ring-indigo-400/50
                "
              />
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                  setResults([]);
                }}
                className="text-xs text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
                aria-label={t('ui.button.close')}
              >
                ✕
              </button>
            </div>

            {/* Current location info */}
            {location && (
              <p className="mt-2 text-[10px] text-gray-500 dark:text-white/40 truncate">
                {t('settings.locationCurrent', {
                  city: location.city,
                  country: location.country,
                })}
              </p>
            )}

            {/* Search results */}
            {results.length > 0 && (
              <ul className="mt-2 max-h-40 overflow-y-auto space-y-0.5">
                {results.map((city) => (
                  <li key={`${city.city}-${city.latitude}-${city.longitude}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(city)}
                      className="
                        w-full text-left rounded-lg px-2.5 py-1.5 text-xs
                        text-gray-700 dark:text-white/80
                        hover:bg-indigo-100/50 dark:hover:bg-white/10
                        transition-colors
                      "
                    >
                      📍 {city.city}, {city.country}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* No results */}
            {query.trim().length >= 2 && results.length === 0 && (
              <p className="mt-2 text-[10px] text-gray-400 dark:text-white/30 text-center">
                {t('error.locationNotFound')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
