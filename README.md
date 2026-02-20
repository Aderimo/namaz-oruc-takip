# 🌙 Namaz ve Oruç Takip

Günlük ibadet rehberiniz — namaz vakitleri, oruç bilgileri, hicri takvim ve dini günler tek bir yerde.

**[🔗 Canlı Demo](https://aderimo.github.io/namaz-oruc-takip/)**

![Dark Theme](https://img.shields.io/badge/tema-karanlık-1a1a2e?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss)

---

## ✨ Özellikler

- **Namaz Vakitleri** — Diyanet metoduyla (Aladhan API) günlük 6 vakit
- **Geri Sayım** — Sonraki namaz ve iftar/sahur için canlı geri sayım
- **Oruç Bilgileri** — Ramazan günü, sahur/iftar vakitleri
- **Hicri Takvim** — Otomatik hicri tarih dönüşümü
- **Dini Günler** — Kandiller, bayramlar ve özel günler
- **Resmi Tatiller** — Türkiye resmi tatil takvimi
- **Konum Seçici** — Ülke → Şehir → İlçe cascading dropdown (81 il + 16 ülke)
- **Çoklu Dil** — Türkçe / English
- **Canlı Saat** — Header'da anlık saat gösterimi
- **PWA Desteği** — Mobil uyumlu, ana ekrana eklenebilir

## 🛠 Teknolojiler

| Teknoloji | Kullanım |
|-----------|----------|
| React 19 | UI framework |
| TypeScript | Tip güvenliği |
| Tailwind CSS 4 | Stil |
| Zustand | State yönetimi |
| i18next | Çoklu dil |
| Framer Motion | Animasyonlar |
| Vite | Build tool |
| Vitest | Test framework |

## 🚀 Kurulum

```bash
git clone https://github.com/Aderimo/namaz-oruc-takip.git
cd namaz-oruc-takip
npm install
npm run dev
```

## 📦 Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm test` | Testleri çalıştır |
| `npm run lint` | Lint kontrolü |

## 🌍 API Kaynakları

- [Aladhan API](https://aladhan.com/prayer-times-api) — Namaz vakitleri (Diyanet metodu)
- [ipapi.co](https://ipapi.co/) — IP tabanlı konum tespiti
- [Nager.Date](https://date.nager.at/) — Resmi tatil verileri

## 📁 Proje Yapısı

```
src/
├── components/       # React bileşenleri
│   ├── calendar/     # Takvim, dini günler, tatiller
│   ├── common/       # Ortak bileşenler (Card, CountdownTimer, LiveClock)
│   ├── fasting/      # Oruç bilgileri
│   ├── layout/       # Header, Footer, Layout
│   ├── prayer/       # Namaz vakitleri
│   └── settings/     # Konum seçici, dil değiştirici
├── data/             # Statik veri (şehirler, dini günler, tatiller)
├── hooks/            # Custom React hooks
├── i18n/             # Çoklu dil dosyaları (TR/EN)
├── services/         # API servisleri
├── stores/           # Zustand state yönetimi
├── types/            # TypeScript tipleri
└── utils/            # Yardımcı fonksiyonlar
```

## 📄 Lisans

MIT
