import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

/** Deterministic star positions — no re-randomization on re-render. */
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: `${(i * 7 + 13) % 100}%`,
  left: `${(i * 11 + 3) % 100}%`,
  delay: `${(i * 0.4) % 4}s`,
  duration: `${2 + (i % 4)}s`,
  large: i % 7 === 0,
}));

export default function Layout({ children }: LayoutProps) {
  return (
    <div
      className="
        relative min-h-screen overflow-hidden
        bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
        dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950
      "
    >
      {/* Stars — visible only in dark mode */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block" aria-hidden="true">
        {STARS.map((s) => (
          <span
            key={s.id}
            className={`star ${s.large ? 'star--large' : ''}`}
            style={{
              top: s.top,
              left: s.left,
              '--delay': s.delay,
              '--duration': s.duration,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Nebula gradient overlay — dark mode only */}
      <div
        className="nebula-bg pointer-events-none absolute inset-0 hidden dark:block"
        aria-hidden="true"
      />

      {/* Decorative crescent moon */}
      <div
        className="
          crescent-moon pointer-events-none absolute top-12 right-[10%]
          text-5xl opacity-10 dark:opacity-20 sm:text-7xl
        "
        aria-hidden="true"
      >
        🌙
      </div>

      {/* Page structure */}
      <Header />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>

      <Footer />
    </div>
  );
}
