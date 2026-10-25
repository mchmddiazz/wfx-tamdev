import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function About() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <section
      id="about"
      className="min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black text-neutral-900 dark:text-white transition-colors px-6 sm:px-8 py-12 sm:py-8"
      aria-labelledby="about-title"
    >
      <div className="flex flex-col w-full max-w-7xl mx-auto py-24">
        {/* Center: Bio */}
        <div className="w-full flex items-start justify-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-2xl text-sm sm:text-base font-mono text-justify leading-relaxed"
          >
            <p>
              Computer Science / Software Engineering graduate and experienced Freelance Network Engineer with proven hands-on expertise in deploying enterprise SD-WAN for large-scale retail networks (PT Indomarco Prismatama). Successfully managed and led multi-phase network installations across Bandung Raya, Priangan Timur, Sumedang, and Sukabumi. Strong background in TCP/IP and Routing & Switching, with high field flexibility for ISP operations.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}