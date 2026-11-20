import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_HEADLINE = `Design.
Deploy.
Connect.
Engineering
functional digital
experiences that drive
real results.`;

export default function Hero() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    async function loadHero() {
      const { data, error } = await supabase
        .from('site_profile')
        .select('headline')
        .eq('id', 1)
        .single();

      if (!error && data?.headline) {
        setHeadline(data.headline);
      }
    }
    loadHero();

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  // Render newlines as <br /> and periods "." in orange-600
  const renderFormattedHeadline = (text: string) =>
    text.split('\n').map((line, lineIdx, arr) => (
      <span key={lineIdx}>
        {line.split('.').map((part, partIdx, parts) => (
          <span key={partIdx}>
            {part}
            {partIdx < parts.length - 1 && (
              <span className="text-orange-600">.</span>
            )}
          </span>
        ))}
        {lineIdx < arr.length - 1 && <br />}
      </span>
    ));

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
          {renderFormattedHeadline(headline)}
        </h1>
      </motion.div>
    </section>
  );
}