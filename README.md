<div align="center">

# Prayer & Fasting Tracker

**Your daily worship companion — prayer times, fasting info, hijri calendar.**

[![Live Demo](https://img.shields.io/badge/live%20demo-aderimo.github.io%2Fnamaz--oruc--takip-5B7CFF)](https://aderimo.github.io/namaz-oruc-takip/)
[![License](https://img.shields.io/badge/license-MIT-4ADE80)](LICENSE)
[![Stack](https://img.shields.io/badge/React_19_%2B_TypeScript_%2B_Tailwind_4-6B7280)](#tech-stack)
[![PWA](https://img.shields.io/badge/PWA-ready-4ADE80)](#features)

Prayer times (Diyanet method), live countdowns to the next prayer and iftar/sahur,
hijri calendar, religious days and official holidays — in one dark, fast PWA.

**English** · [Türkçe](README.tr.md)

</div>

---

## Features

- **Prayer times** — 6 daily times via the Diyanet method (Aladhan API)
- **Countdown** — live countdown to the next prayer and iftar/sahur
- **Fasting info** — Ramadan day, sahur/iftar times
- **Hijri calendar** — automatic hijri date conversion
- **Religious days** — kandils, eids and special days
- **Official holidays** — Turkish public holiday calendar
- **Location picker** — cascading country → city → district dropdowns (81 provinces + 16 countries)
- **Multilingual** — Türkçe / English
- **Live clock** in the header
- **PWA support** — mobile-friendly, installable to home screen

## Setup

```bash
git clone https://github.com/Aderimo/namaz-oruc-takip.git
cd namaz-oruc-takip
npm install
npm run dev
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run lint` | Lint check |

## Tech stack

| Technology | Used for |
| --- | --- |
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| Zustand | State management |
| i18next | Internationalization |
| Framer Motion | Animations |
| Vite | Build tool |
| Vitest | Test framework |

## API sources

- [Aladhan API](https://aladhan.com/prayer-times-api) — prayer times (Diyanet method)
- [ipapi.co](https://ipapi.co/) — IP-based location detection
- [Nager.Date](https://date.nager.at/) — public holiday data

## Project structure

```
src/
├── components/       # React components
│   ├── calendar/     # Calendar, religious days, holidays
│   ├── common/       # Shared components (Card, CountdownTimer, LiveClock)
│   ├── fasting/      # Fasting info
│   ├── layout/       # Header, Footer, Layout
│   ├── prayer/       # Prayer times
│   └── settings/     # Location picker, language switcher
├── data/             # Static data (cities, religious days, holidays)
├── hooks/            # Custom React hooks
├── i18n/             # Translation files (TR/EN)
├── services/         # API services
├── stores/           # Zustand state management
├── types/            # TypeScript types
└── utils/            # Helper functions
```

## License

[MIT](LICENSE)
