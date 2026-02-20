import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '../../hooks/useLocation';
import { COUNTRIES, TURKEY_CITIES, INTERNATIONAL_CITIES } from '../../data/turkeyLocations';
import type { LocationData } from '../../types';

/** Ülke koduna göre timezone döndürür */
const COUNTRY_TIMEZONES: Record<string, string> = {
  TR: 'Europe/Istanbul', DE: 'Europe/Berlin', FR: 'Europe/Paris',
  GB: 'Europe/London', US: 'America/New_York', SA: 'Asia/Riyadh',
  EG: 'Africa/Cairo', NL: 'Europe/Amsterdam', BE: 'Europe/Brussels',
  AT: 'Europe/Vienna', SE: 'Europe/Stockholm', NO: 'Europe/Oslo',
  DK: 'Europe/Copenhagen', CH: 'Europe/Zurich', CA: 'America/Toronto',
  AU: 'Australia/Sydney',
};

export default function LocationPicker() {
  const { t } = useTranslation();
  const { location, isLoading, setLocation } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Şehir listesi — ülkeye göre
  const cities = selectedCountry === 'TR'
    ? TURKEY_CITIES
    : INTERNATIONAL_CITIES[selectedCountry] ?? [];

  // İlçe listesi — sadece TR için
  const districts = selectedCountry === 'TR'
    ? TURKEY_CITIES.find((c) => c.name === selectedCity)?.districts ?? []
    : [];

  const handleCountryChange = useCallback((code: string) => {
    setSelectedCountry(code);
    setSelectedCity('');
    setSelectedDistrict('');
  }, []);

  const handleCityChange = useCallback((cityName: string) => {
    setSelectedCity(cityName);
    setSelectedDistrict('');

    // TR dışı ülkelerde şehir seçince direkt konum ayarla
    if (selectedCountry !== 'TR') {
      const city = (INTERNATIONAL_CITIES[selectedCountry] ?? []).find((c) => c.name === cityName);
      if (city) {
        const country = COUNTRIES.find((c) => c.code === selectedCountry);
        const loc: LocationData = {
          country: country?.name ?? '',
          countryCode: selectedCountry,
          city: city.name,
          latitude: city.lat,
          longitude: city.lng,
          timezone: COUNTRY_TIMEZONES[selectedCountry] ?? 'UTC',
        };
        setLocation(loc);
        setIsOpen(false);
      }
      return;
    }

    // TR'de ilçesi olmayan şehir seçilince direkt ayarla
    const trCity = TURKEY_CITIES.find((c) => c.name === cityName);
    if (trCity && (!trCity.districts || trCity.districts.length === 0)) {
      const loc: LocationData = {
        country: 'Türkiye',
        countryCode: 'TR',
        city: trCity.name,
        latitude: trCity.lat,
        longitude: trCity.lng,
        timezone: 'Europe/Istanbul',
      };
      setLocation(loc);
      setIsOpen(false);
    }
  }, [selectedCountry, setLocation]);

  const handleDistrictChange = useCallback((districtName: string) => {
    setSelectedDistrict(districtName);
    const trCity = TURKEY_CITIES.find((c) => c.name === selectedCity);
    const district = trCity?.districts?.find((d) => d.name === districtName);
    if (district) {
      const loc: LocationData = {
        country: 'Türkiye',
        countryCode: 'TR',
        city: `${selectedCity} / ${district.name}`,
        latitude: district.lat,
        longitude: district.lng,
        timezone: 'Europe/Istanbul',
      };
      setLocation(loc);
      setIsOpen(false);
    }
  }, [selectedCity, setLocation]);

  const selectStyle: React.CSSProperties = { colorScheme: 'dark' };

  const selectClass = `
    w-full rounded-lg px-3 py-2 text-sm cursor-pointer
    bg-gray-800 border border-white/10 text-white
    hover:bg-gray-700 focus:ring-1 focus:ring-indigo-400/50 outline-none
    transition-colors
  `;

  const optionClass = "bg-gray-800 text-white";

  return (
    <div ref={containerRef} className="relative">
      {/* Mevcut konum butonu */}
      {location && !isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="
            flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
            bg-white/10 text-white/70 border border-white/10
            hover:bg-white/20 transition-colors
          "
          aria-label={t('settings.locationChange')}
        >
          <span className="text-sm">📍</span>
          <span className="max-w-[140px] truncate">
            {location.city}, {location.country}
          </span>
        </button>
      )}

      {/* Loading */}
      {isLoading && !isOpen && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/50">
          <span className="animate-spin text-sm">⏳</span>
          {t('ui.label.loading')}
        </span>
      )}

      {/* Dropdown paneli */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="
              absolute right-0 top-10 z-50 w-72
              rounded-xl p-4 space-y-3
              bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl
            "
          >
            {/* Başlık + kapat */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                📍 {t('settings.location')}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-white/40 hover:text-white/70"
                aria-label={t('ui.button.close')}
              >✕</button>
            </div>

            {/* Ülke dropdown */}
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={selectClass}
              style={selectStyle}
            >
              <option value="" disabled className={optionClass}>{t('settings.selectCountry')}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className={optionClass}>{c.name}</option>
              ))}
            </select>

            {/* Şehir dropdown */}
            {selectedCountry && cities.length > 0 && (
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className={selectClass}
                style={selectStyle}
              >
                <option value="" disabled className={optionClass}>{t('settings.selectCity')}</option>
                {cities.map((c) => (
                  <option key={c.name} value={c.name} className={optionClass}>{c.name}</option>
                ))}
              </select>
            )}

            {/* İlçe dropdown — sadece TR ve ilçesi olan şehirler */}
            {selectedCountry === 'TR' && districts.length > 0 && (
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className={selectClass}
                style={selectStyle}
              >
                <option value="" disabled className={optionClass}>{t('settings.selectDistrict')}</option>
                {districts.map((d) => (
                  <option key={d.name} value={d.name} className={optionClass}>{d.name}</option>
                ))}
              </select>
            )}

            {/* Mevcut konum bilgisi */}
            {location && (
              <p className="text-[10px] text-white/30 truncate pt-1 border-t border-white/5">
                {t('settings.locationCurrent', { city: location.city, country: location.country })}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
