import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: vi.fn(), language: 'tr' } }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...filterMotionProps(props)}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...filterMotionProps(props)}>{children}</section>,
    span: ({ children, ...props }: any) => <span {...filterMotionProps(props)}>{children}</span>,
    li: ({ children, ...props }: any) => <li {...filterMotionProps(props)}>{children}</li>,
    header: ({ children, ...props }: any) => <header {...filterMotionProps(props)}>{children}</header>,
    nav: ({ children, ...props }: any) => <nav {...filterMotionProps(props)}>{children}</nav>,
    button: ({ children, ...props }: any) => <button {...filterMotionProps(props)}>{children}</button>,
    p: ({ children, ...props }: any) => <p {...filterMotionProps(props)}>{children}</p>,
    h2: ({ children, ...props }: any) => <h2 {...filterMotionProps(props)}>{children}</h2>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView: () => true,
}));

function filterMotionProps(props: Record<string, any>) {
  const motionKeys = ['variants', 'initial', 'animate', 'exit', 'whileHover', 'whileTap', 'transition', 'layout', 'layoutId'];
  const filtered: Record<string, any> = {};
  for (const [key, val] of Object.entries(props)) {
    if (!motionKeys.includes(key)) filtered[key] = val;
  }
  return filtered;
}

// Mock child components to isolate App rendering
vi.mock('./components/layout/Layout', () => ({
  default: ({ children }: any) => <div data-testid="layout">{children}</div>,
}));
vi.mock('./components/prayer/PrayerCountdown', () => ({
  default: () => <div data-testid="prayer-countdown" />,
}));
vi.mock('./components/prayer/PrayerTimesCard', () => ({
  default: () => <div data-testid="prayer-times-card" />,
}));
vi.mock('./components/fasting/FastingCountdown', () => ({
  default: () => <div data-testid="fasting-countdown" />,
}));
vi.mock('./components/fasting/FastingInfoCard', () => ({
  default: () => <div data-testid="fasting-info-card" />,
}));
vi.mock('./components/calendar/ReligiousDaysCard', () => ({
  default: () => <div data-testid="religious-days-card" />,
}));
vi.mock('./components/calendar/HolidayCard', () => ({
  default: () => <div data-testid="holiday-card" />,
}));
vi.mock('./components/calendar/CalendarView', () => ({
  default: () => <div data-testid="calendar-view" />,
}));

// Mock useLocation hook
const mockDetect = vi.fn();
vi.mock('./hooks/useLocation', () => ({
  useLocation: () => ({ detect: mockDetect, location: null, isLoading: false, error: null }),
}));

import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('layout')).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('prayer-countdown')).toBeInTheDocument();
    expect(getByTestId('prayer-times-card')).toBeInTheDocument();
    expect(getByTestId('fasting-countdown')).toBeInTheDocument();
    expect(getByTestId('fasting-info-card')).toBeInTheDocument();
    expect(getByTestId('religious-days-card')).toBeInTheDocument();
    expect(getByTestId('holiday-card')).toBeInTheDocument();
    expect(getByTestId('calendar-view')).toBeInTheDocument();
  });

  it('calls detect on mount', () => {
    render(<App />);
    expect(mockDetect).toHaveBeenCalled();
  });
});
