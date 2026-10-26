import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Hero() {
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
      id="intro"
      aria-label="Hero section: I code. I design. I adapt. I create digital experiences that feel alive."
      className="min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black transition-colors px-4 px-6 md:py-auto"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-start justify-center text-left max-w-5xl mx-auto"
      >
        <h1 className="font-gambarino text-[2.5rem] sm:text-6xl md:text-6xl leading-tight text-neutral-900 dark:text-white mb-8">
          Design<span className="text-orange-600">.</span><br />
          Deploy<span className="text-orange-600">.</span><br />
          Connect<span className="text-orange-600">.</span><br />
          Engineering<br/>
          functional digital<br/>
          experiences that drive<br/>
          real results<span className="text-orange-600">.</span>
        </h1>
      </motion.div>
    </section>
  );
}