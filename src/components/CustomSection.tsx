import { motion } from 'framer-motion';

interface CustomSectionProps {
  id?: string;
  settings?: Record<string, string | boolean>;
}

export default function CustomSection({ id = 'highlight', settings = {} }: CustomSectionProps) {
  const eyebrow = typeof settings.eyebrow === 'string' ? settings.eyebrow : 'FEATURED';
  const heading =
    typeof settings.heading === 'string'
      ? settings.heading
      : 'Available for Network & Web Projects';
  const body =
    typeof settings.body === 'string'
      ? settings.body
      : 'Need help with enterprise SD-WAN deployments, routing setups, or custom web applications? Let’s collaborate.';
  const ctaLabel = typeof settings.ctaLabel === 'string' ? settings.ctaLabel : 'Get in Touch';
  const ctaHref = typeof settings.ctaHref === 'string' ? settings.ctaHref : '#contact';

  return (
    <section
      id={id}
      className="min-h-[70vh] w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black transition-colors px-6 sm:px-8 py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="max-w-4xl mx-auto w-full space-y-5"
      >
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-widest text-orange-600 dark:text-orange-500">
            {eyebrow}
          </p>
        )}
        <h2 className="font-gambarino text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 dark:text-white leading-tight">
          {heading}
        </h2>
        {body && (
          <p className="font-mono text-sm sm:text-base text-neutral-700 dark:text-neutral-300 max-w-2xl leading-relaxed">
            {body}
          </p>
        )}
        {ctaLabel && (
          <div className="pt-2">
            <a
              href={ctaHref || '#contact'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-mono font-medium transition-colors"
            >
              {ctaLabel} ↗
            </a>
          </div>
        )}
      </motion.div>
    </section>
  );
}
