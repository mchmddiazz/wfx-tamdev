import { useReducedMotion, Variants, Transition } from 'framer-motion';

/**
 * Common physics-based spring configurations
 */
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 24,
};

export const bouncySpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
};

export const smoothEase: Transition = {
  duration: 0.6,
  ease: [0.25, 0.8, 0.25, 1], // easeOutCubic
};

/**
 * Standard reusable animation variants
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothEase,
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * Accessible motion helper hook:
 * Returns true if the user prefers reduced motion.
 */
export function useAccessibleMotion() {
  const shouldReduceMotion = useReducedMotion();
  return {
    shouldReduceMotion,
    // Return gentle fade transition if reduced motion is requested
    safeTransition: (fallback: Transition = smoothEase): Transition =>
      shouldReduceMotion ? { duration: 0.2 } : fallback,
  };
}
