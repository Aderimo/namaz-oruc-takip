import { AnimatePresence, motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export default function AnimatedNumber({ value, className = '' }: AnimatedNumberProps) {
  const display = String(value).padStart(2, '0');

  return (
    <div className={`relative overflow-hidden ${className}`} aria-live="polite">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={display}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="inline-block tabular-nums"
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
