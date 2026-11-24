import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="p-2 rounded-lg text-orange-600 dark:text-orange-500 hover:text-orange-800 dark:hover:text-orange-400 transition-colors cursor-pointer flex items-center justify-center relative overflow-hidden"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-pressed={theme === 'dark'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -14, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 14, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="inline-block"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
