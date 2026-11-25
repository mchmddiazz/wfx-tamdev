import { motion } from 'framer-motion';
import { ArrowUpRight, Award } from 'lucide-react';
import { CertificateBlockItem } from '../types/cms';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Certificates({ id = 'certificates', settings }: { id?: string; settings?: Record<string, any> }) {
  const heading =
    typeof settings?.heading === 'string' && settings.heading.trim().length > 0
      ? settings.heading
      : 'CERTIFICATES';

  const subtitle =
    typeof settings?.subtitle === 'string' && settings.subtitle.trim().length > 0
      ? settings.subtitle
      : '';

  const items: CertificateBlockItem[] = Array.isArray(settings?.items)
    ? (settings.items as CertificateBlockItem[]).filter((item) => item.is_active !== false)
    : [];

  if (items.length === 0) return null;

  return (
    <section
      id={id}
      className="min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black text-neutral-900 dark:text-white transition-colors px-6 sm:px-8 py-16"
      aria-labelledby={`${id}-title`}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="mb-10">
          <h2
            id={`${id}-title`}
            className="font-gambarino text-lg sm:text-xl md:text-2xl font-semibold text-orange-600 dark:text-orange-600 tracking-wide"
          >
            {heading}
          </h2>
          {subtitle && (
            <p className="mt-3 font-mono text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.article
              key={item.id || `${item.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group flex flex-col rounded-xl border border-orange-500/20 bg-white/60 dark:bg-neutral-950/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-orange-500/50"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                {item.image_url ? (
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-500">
                    <Award className="h-6 w-6" />
                  </div>
                )}

                {item.date && (
                  <span className="font-mono text-xs text-orange-600/90 dark:text-orange-400 shrink-0">
                    {item.date}
                  </span>
                )}
              </div>

              <h3 className="font-gambarino text-xl font-semibold text-neutral-900 dark:text-white leading-snug mb-1.5">
                {item.title}
              </h3>

              {item.issuer && (
                <p className="font-mono text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {item.issuer}
                </p>
              )}

              {item.credential_url && (
                <a
                  href={item.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-md border border-orange-500/30 px-3 py-1.5 font-mono text-xs text-orange-600 dark:text-orange-400 transition-colors hover:bg-orange-600 hover:text-white hover:border-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                >
                  <span>View Credential</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
