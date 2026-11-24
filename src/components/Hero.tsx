import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_HEADLINE = `Design.
Deploy.
Connect.
Engineering
functional digital
experiences that drive
real results.`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const lineVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.25, 0.8, 0.25, 1],
    },
  },
};

export default function Hero() {
  const [headline, setHeadline] = useState(DEFAULT_HEADLINE);

  useEffect(() => {
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
  }, []);

  const headlineLines = headline.split('\n');

  return (
    <section
      id="intro"
      aria-label="Hero section"
      className="min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black transition-colors px-6 md:px-8 py-16"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="flex flex-col items-start justify-center text-left max-w-5xl mx-auto w-full"
      >
        <h1 className="font-gambarino text-[2.5rem] sm:text-6xl md:text-6xl leading-tight text-neutral-900 dark:text-white mb-6">
          {headlineLines.map((line, lineIdx) => (
            <motion.span
              key={lineIdx}
              variants={lineVariants}
              className="block overflow-hidden"
            >
              {line.split('.').map((part, partIdx, parts) => (
                <span key={partIdx}>
                  {part}
                  {partIdx < parts.length - 1 && (
                    <motion.span
                      className="text-orange-600 inline-block font-bold"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ delay: 0.4 + lineIdx * 0.1, duration: 0.4 }}
                    >
                      .
                    </motion.span>
                  )}
                </span>
              ))}
            </motion.span>
          ))}
        </h1>

        {/* Floating scroll cue */}
        <motion.a
          href="#about"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-6 flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors group cursor-pointer"
        >
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="inline-block"
          >
            ↓
          </motion.span>
          <span>Scroll down</span>
        </motion.a>
      </motion.div>
    </section>
  );
}