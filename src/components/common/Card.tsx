import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
}

export default function Card({ children, className = '', title, icon }: CardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`
        card-hover rounded-2xl p-6
        bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg
        dark:bg-white/5 dark:border-white/10 dark:shadow-xl
        ${className}
      `}
    >
      {(title || icon) && (
        <header className="mb-4 flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          {title && (
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h2>
          )}
        </header>
      )}
      {children}
    </motion.section>
  );
}
