# Uygulama Planı: Namaz ve Oruç Takip Uygulaması

## Genel Bakış

React + Vite + TypeScript ile tamamen istemci tarafında çalışan, GitHub Pages uyumlu statik bir web uygulaması geliştirilecektir. Uygulama, namaz vakitleri, oruç takibi, dini günler ve resmi tatilleri gösterecektir. Geliştirme, temel altyapıdan başlayarak katman katman ilerleyecek ve her adımda önceki adımların üzerine inşa edilecektir.

## Görevler

- [x] 1. Proje altyapısı ve temel konfigürasyon
  - [x] 1.1 Vite + React + TypeScript projesi oluştur ve temel bağımlılıkları kur
    - `npm create vite@latest` ile proje oluştur
    - Bağımlılıklar: `zustand`, `i18next`, `react-i18next`, `date-fns`, `framer-motion`, `fast-check` (dev), `vitest` (dev), `@testing-library/react` (dev), `msw` (dev)
    - Tailwind CSS v4 kur ve yapılandır
    - `vite.config.ts` içinde `base` ayarını GitHub Pages için yapılandır
    - `tsconfig.json` strict mode aktif et
    - _Gereksinimler: 9.2, 9.4_

  - [x] 1.2 Tip tanımlarını ve proje dizin yapısını oluştur
    - `src/types/index.ts` dosyasında `LocationData`, `PrayerTimes`, `HijriDate`, `ReligiousDay`, `Holiday`, `CacheEntry` arayüzlerini tanımla
    - Tasarım dokümanındaki dizin yapısını oluştur (components/, services/, stores/, utils/, i18n/, data/, hooks/)
    - _Gereksinimler: 1.1, 2.1, 4.4, 5.1_

  - [x] 1.3 Çoklu dil dosyalarını (i18n) oluştur ve yapılandır
    - `src/i18n/tr.json` ve `src/i18n/en.json` dosyalarını oluştur (namaz isimleri, UI metinleri, hata mesajları)
    - `src/i18n/index.ts` içinde i18next yapılandırmasını yaz (tarayıcı dili tespiti, varsayılan TR)
    - _Gereksinimler: 8.1, 8.2, 8.4, 8.5_

  - [ ]* 1.4 Çeviri anahtarları tutarlılığı property testi yaz
    - **Özellik 14: Çeviri Anahtarları Tutarlılığı**
    - **Doğrular: Gereksinim 8.2**

  - [ ]* 1.5 Tarayıcı dili tespiti property testi yaz
    - **Özellik 15: Tarayıcı Dili Tespiti**
    - **Doğrular: Gereksinim 8.4, 8.5**

- [x] 2. Önbellek servisi ve API istemcisi
  - [x] 2.1 Önbellek servisini (`cacheService.ts`) uygula
    - `get<T>`, `set<T>`, `isValid`, `clear`, `clearAll` metodlarını yaz
    - TTL (Time-To-Live) tabanlı önbellek geçerlilik kontrolü
    - localStorage erişim hatalarını sessizce yakala
    - _Gereksinimler: 6.1, 6.2_

  - [ ]* 2.2 Önbellek servisi round-trip property testi yaz
    - **Özellik 11: Önbellek Servisi Round-Trip**
    - **Doğrular: Gereksinim 6.1**

  - [x] 2.3 API istemcisini (`apiClient.ts`) uygula
    - Rate limiting mantığı (token bucket veya sliding window)
    - Genel fetch wrapper: hata yakalama, timeout, retry
    - API bazlı rate limit konfigürasyonu
    - _Gereksinimler: 6.4_

  - [ ]* 2.4 API hız sınırlaması property testi yaz
    - **Özellik 12: API Hız Sınırlaması**
    - **Doğrular: Gereksinim 6.4**

- [x] 3. Kontrol noktası - Altyapı testleri
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

- [x] 4. Konum servisi
  - [x] 4.1 Konum servisini (`locationService.ts`) uygula
    - `detectLocation()`: ip-api.com'dan konum tespiti
    - `getDefaultLocation()`: İstanbul varsayılan konumu
    - `searchCity()`: Şehir arama (basit liste tabanlı)
    - API yanıt parse fonksiyonu
    - Önbellek servisi entegrasyonu
    - _Gereksinimler: 1.1, 1.3, 1.4_

  - [ ]* 4.2 Konum API yanıt parse property testi yaz
    - **Özellik 1: Konum API Yanıt Parse Doğruluğu**
    - **Doğrular: Gereksinim 1.1**

  - [x] 4.3 Konum store'unu (`locationStore.ts`) uygula
    - Zustand store: location, isLoading, error state
    - `setLocation`, `detectLocation` aksiyonları
    - localStorage'a konum kaydetme
    - _Gereksinimler: 1.2, 1.5_

  - [ ]* 4.4 Konum/Tema/Dil ayarları localStorage round-trip property testi yaz
    - **Özellik 2: Ayarlar localStorage Round-Trip**
    - **Doğrular: Gereksinim 1.5, 7.4, 8.3**

- [x] 5. Namaz vakitleri servisi ve oruç modülü
  - [x] 5.1 Namaz servisini (`prayerService.ts`) uygula
    - `getDailyPrayerTimes()`: Aladhan API'den günlük vakitler
    - `getMonthlyPrayerTimes()`: Aylık vakitler
    - `getNextPrayer()`: Sonraki namaz vakti hesaplama
    - API yanıt parse fonksiyonu (6 vakit çıkarma ve kronolojik sıralama)
    - Sahur/iftar vakti türetme (sahur = fajr, iftar = maghrib)
    - Önbellek servisi entegrasyonu, fallback JSON desteği
    - _Gereksinimler: 2.1, 2.2, 2.5, 3.1, 3.5, 6.2, 6.3_

  - [x] 5.2 Yedek namaz vakitleri JSON dosyasını oluştur (`fallbackPrayerTimes.json`)
    - İstanbul için örnek aylık namaz vakitleri verisi
    - _Gereksinimler: 6.3_

  - [ ]* 5.3 Namaz vakitleri parse property testi yaz
    - **Özellik 3: Namaz Vakitleri Parse - Altı Vakit İnvariantı**
    - **Doğrular: Gereksinim 2.1**

  - [ ]* 5.4 Sonraki vakit hesaplama property testi yaz
    - **Özellik 4: Sonraki Vakit Hesaplama Doğruluğu**
    - **Doğrular: Gereksinim 2.2, 3.5**

  - [ ]* 5.5 Sahur/İftar vakti türetme property testi yaz
    - **Özellik 5: Sahur/İftar Vakti Türetme**
    - **Doğrular: Gereksinim 3.1**

  - [x] 5.6 Namaz store'unu (`prayerStore.ts`) uygula
    - Zustand store: todayTimes, nextPrayer, isLoading, dataSource
    - `fetchPrayerTimes` aksiyonu
    - _Gereksinimler: 2.1, 6.5_

- [x] 6. Takvim servisi ve Hicri dönüştürücü
  - [x] 6.1 Hicri dönüştürücüyü (`hijriConverter.ts`) uygula
    - `gregorianToHijri()`: Kuwaiti algoritması ile Miladi → Hicri
    - `hijriToGregorian()`: Hicri → Miladi dönüşüm
    - `formatHijri()`: Hicri tarih formatlama (locale desteği)
    - _Gereksinimler: 4.4_

  - [ ]* 6.2 Hicri-Miladi round-trip property testi yaz
    - **Özellik 7: Hicri-Miladi Takvim Round-Trip**
    - **Doğrular: Gereksinim 4.4**

  - [x] 6.3 Takvim servisini (`calendarService.ts`) uygula
    - `getReligiousDays()`: Hicri tarihlerden dini günleri hesapla
    - `getUpcomingReligiousDays()`: Yaklaşan dini günleri tarihe göre sırala
    - `getRamadanInfo()`: Ramazan durumu, gün sayısı, kalan gün
    - Dini günler ve kandil tarihleri veri dosyası (`religiousDays.json`)
    - _Gereksinimler: 4.1, 4.2, 4.3, 3.2, 3.4_

  - [ ]* 6.4 Ramazan gün hesaplama property testi yaz
    - **Özellik 6: Ramazan Gün Hesaplama**
    - **Doğrular: Gereksinim 3.2, 3.4**

  - [ ]* 6.5 Yaklaşan etkinlik sıralaması property testi yaz
    - **Özellik 8: Yaklaşan Etkinlik Sıralaması**
    - **Doğrular: Gereksinim 4.3, 5.4**

- [x] 7. Tatil servisi
  - [x] 7.1 Tatil servisini (`holidayService.ts`) uygula
    - `getHolidays()`: Nager.Date API'den ülke tatilleri
    - `getTurkeyHolidays()`: Sabit Türkiye ulusal bayramları (yerel JSON)
    - `getUpcomingHolidays()`: Yaklaşan tatilleri sırala
    - Türkiye bayramlarını her zaman listeye ekle
    - Yedek tatil JSON dosyası (`turkeyHolidays.json`)
    - _Gereksinimler: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 7.2 Tatil API parse property testi yaz
    - **Özellik 9: Tatil API Parse Doğruluğu**
    - **Doğrular: Gereksinim 5.1**

  - [ ]* 7.3 Türkiye bayramları invariant property testi yaz
    - **Özellik 10: Türkiye Bayramları İnvariantı**
    - **Doğrular: Gereksinim 5.2**

- [x] 8. Kontrol noktası - Servis katmanı testleri
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

- [x] 9. Tema yönetimi ve ayarlar store
  - [x] 9.1 Ayarlar store'unu (`settingsStore.ts`) ve tema yönetimini uygula
    - Zustand store: theme, language, toggleTheme, setLanguage
    - localStorage'a tema ve dil kaydetme/okuma
    - Tailwind dark mode entegrasyonu (class stratejisi)
    - _Gereksinimler: 7.1, 7.4, 8.3_

  - [ ]* 9.2 Tema toggle idempotans property testi yaz
    - **Özellik 13: Tema Toggle İdempotansı**
    - **Doğrular: Gereksinim 7.1**

- [x] 10. Custom hook'lar
  - [x] 10.1 `useCountdown`, `usePrayerTimes` ve `useLocation` hook'larını uygula
    - `useCountdown(targetTime)`: Hedef zamana geri sayım (saat, dakika, saniye)
    - `usePrayerTimes()`: Konum store'dan konum al, namaz store'dan vakitleri çek
    - `useLocation()`: Konum tespiti ve değiştirme mantığı
    - _Gereksinimler: 2.2, 2.3, 3.3, 3.5_

- [x] 11. Ortak UI bileşenleri ve layout
  - [x] 11.1 Temel UI bileşenlerini oluştur
    - `Card.tsx`: Glassmorphism efektli kart bileşeni (backdrop-blur, border, shadow)
    - `CountdownTimer.tsx`: Animasyonlu geri sayım (Framer Motion)
    - `AnimatedNumber.tsx`: Sayı değişim animasyonu
    - _Gereksinimler: 7.2, 10.1, 10.3_

  - [x] 11.2 Layout bileşenlerini oluştur
    - `Layout.tsx`: Ana sayfa düzeni, gradyan arka plan, yıldız/parıltı efektleri
    - `Header.tsx`: Logo, konum gösterimi, tema/dil değiştirici
    - `Footer.tsx`: Minimal footer
    - _Gereksinimler: 7.2, 7.3, 7.5_

- [x] 12. Özellik bileşenleri
  - [x] 12.1 Namaz vakitleri bileşenlerini oluştur
    - `PrayerTimesCard.tsx`: 6 vakit listesi, aktif vakit vurgusu
    - `PrayerCountdown.tsx`: Sonraki namaz vaktine geri sayım
    - _Gereksinimler: 2.1, 2.2, 2.3, 2.4_

  - [x] 12.2 Oruç bilgi bileşenlerini oluştur
    - `FastingInfoCard.tsx`: Sahur/iftar vakitleri, Ramazan gün sayısı
    - `FastingCountdown.tsx`: İftar/sahur geri sayımı
    - _Gereksinimler: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 12.3 Takvim ve dini günler bileşenlerini oluştur
    - `ReligiousDaysCard.tsx`: Yaklaşan dini günler ve kandiller listesi
    - `HolidayCard.tsx`: Yaklaşan resmi tatiller listesi
    - `CalendarView.tsx`: Aylık takvim görünümü, dini günler işaretli
    - _Gereksinimler: 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 5.3, 5.4_

  - [x] 12.4 Ayar bileşenlerini oluştur
    - `LocationPicker.tsx`: Konum gösterimi ve manuel şehir arama
    - `ThemeToggle.tsx`: Karanlık/aydınlık tema geçiş butonu
    - `LanguageSwitch.tsx`: TR/EN dil değiştirici
    - _Gereksinimler: 1.2, 1.3, 7.1, 8.1_

- [x] 13. Ana sayfa entegrasyonu ve bağlama
  - [x] 13.1 App.tsx ve ana sayfayı birleştir
    - Tüm bileşenleri Layout içinde düzenle
    - Uygulama başlangıcında konum tespiti tetikle
    - Namaz vakitlerini konum değişikliğinde yenile
    - Tema ve dil ayarlarını uygula
    - Responsive grid layout (mobil/tablet/masaüstü)
    - _Gereksinimler: 1.1, 1.2, 7.5, 9.1_

  - [ ]* 13.2 Fallback senaryoları için birim testleri yaz
    - API başarısız → önbellek fallback testi
    - API + önbellek başarısız → yerel JSON fallback testi
    - Konum tespiti başarısız → İstanbul varsayılanı testi
    - _Gereksinimler: 1.4, 6.2, 6.3_

- [x] 14. SEO, meta etiketler ve GitHub Pages yapılandırması
  - [x] 14.1 SEO ve dağıtım yapılandırmasını tamamla
    - `index.html` içinde meta etiketler, Open Graph, yapılandırılmış veri
    - GitHub Pages için `404.html` SPA yönlendirmesi
    - `vite.config.ts` build optimizasyonları
    - Favicon ve manifest dosyaları
    - _Gereksinimler: 9.3, 9.4, 9.5_

- [x] 15. Geçiş animasyonları ve son dokunuşlar
  - [x] 15.1 Animasyonları ve mikro etkileşimleri ekle
    - Sayfa yükleme animasyonları (fade-in/slide-in)
    - Tema geçiş animasyonu
    - Kart hover efektleri
    - Yıldız parıltı/shimmer arka plan animasyonu (CSS)
    - GPU hızlandırmalı CSS animasyonları (`transform`, `opacity`)
    - _Gereksinimler: 10.1, 10.2, 10.3, 10.4_

- [x] 16. Son kontrol noktası
  - Tüm testlerin geçtiğinden emin ol, sorular varsa kullanıcıya sor.

## Notlar

- `*` ile işaretli görevler isteğe bağlıdır ve hızlı MVP için atlanabilir
- Her görev, izlenebilirlik için belirli gereksinimlere referans verir
- Kontrol noktaları, artımlı doğrulama sağlar
- Property testleri evrensel doğruluk özelliklerini doğrular
- Birim testleri belirli örnekleri ve edge case'leri doğrular
