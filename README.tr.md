<div align="center">

# Namaz ve Oruç Takip

**Günlük ibadet rehberiniz — namaz vakitleri, oruç bilgileri, hicri takvim.**

[![Canlı Demo](https://img.shields.io/badge/canlı%20demo-aderimo.github.io%2Fnamaz--oruc--takip-5B7CFF)](https://aderimo.github.io/namaz-oruc-takip/)
[![Lisans](https://img.shields.io/badge/lisans-MIT-4ADE80)](LICENSE)
[![Altyapı](https://img.shields.io/badge/React_19_%2B_TypeScript_%2B_Tailwind_4-6B7280)](#teknolojiler)
[![PWA](https://img.shields.io/badge/PWA-hazır-4ADE80)](#özellikler)

Namaz vakitleri (Diyanet metodu), bir sonraki namaza ve iftar/sahura canlı geri
sayım, hicri takvim, dini günler ve resmi tatiller — tek bir koyu, hızlı PWA'da.

[Türkçe](README.tr.md) · [English](README.md)

</div>

---

## Özellikler

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

## Kurulum

```bash
git clone https://github.com/Aderimo/namaz-oruc-takip.git
cd namaz-oruc-takip
npm install
npm run dev
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm test` | Testleri çalıştır |
| `npm run lint` | Lint kontrolü |

## Teknolojiler

| Teknoloji | Kullanım |
| --- | --- |
| React 19 | UI framework |
| TypeScript | Tip güvenliği |
| Tailwind CSS 4 | Stil |
| Zustand | State yönetimi |
| i18next | Çoklu dil |
| Framer Motion | Animasyonlar |
| Vite | Build tool |
| Vitest | Test framework |

## API kaynakları

- [Aladhan API](https://aladhan.com/prayer-times-api) — Namaz vakitleri (Diyanet metodu)
- [ipapi.co](https://ipapi.co/) — IP tabanlı konum tespiti
- [Nager.Date](https://date.nager.at/) — Resmi tatil verileri

## Proje yapısı

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

## Lisans

[MIT](LICENSE)

---

<div align="center">

Made by [Aderimo](https://gitgit.me/aderimo)

</div>
