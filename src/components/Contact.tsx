import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SocialLink } from '../types/cms';

interface DisplaySocial {
  id?: string;
  name: string;
  href: string;
  showedName: string;
}

const DEFAULT_TITLE = "Let's\nConnect";
const DEFAULT_SUBTITLE =
  'Available for collaborations, opportunities, or just a friendly chat.';

const FALLBACK_SOCIALS: DisplaySocial[] = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/mochamad-dhias',
    showedName: 'Mochamad Dhias Ath - thariq',
  },
  {
    name: 'GitHub',
    href: 'https://www.github.com/mchmddiazz',
    showedName: '@mchmddiazz',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/mchmddiaz/',
    showedName: '@mchmddiaz',
  },
  {
    name: 'Email',
    href: 'mailto:mchmddiazz@gmail.com',
    showedName: 'mchmddiazz@gmail.com',
  },
];

export default function Contact() {
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [socialLinks, setSocialLinks] = useState<DisplaySocial[]>(FALLBACK_SOCIALS);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    async function loadContactSection() {
      const [socialsRes, profileRes] = await Promise.all([
        supabase
          .from('social_links')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        supabase
          .from('site_profile')
          .select('contact_title, contact_subtitle')
          .eq('id', 1)
          .single(),
      ]);

      if (!socialsRes.error && socialsRes.data && socialsRes.data.length > 0) {
        const mapped: DisplaySocial[] = (socialsRes.data as SocialLink[]).map((item) => ({
          id: item.id,
          name: item.platform,
          href: item.url,
          showedName: item.label,
        }));
        setSocialLinks(mapped);
      }

      if (!profileRes.error && profileRes.data) {
        if (profileRes.data.contact_title) setTitle(profileRes.data.contact_title);
        if (profileRes.data.contact_subtitle)
          setSubtitle(profileRes.data.contact_subtitle);
      }
    }

    loadContactSection();
  }, []);

  const renderFormattedTitle = (text: string) =>
    text.split('\n').map((line, index, arr) => (
      <span key={index}>
        {line}
        {index < arr.length - 1 && <br />}
      </span>
    ));

  return (
    <section
      id="contact"
      className="min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black transition-colors px-6 sm:px-8 py-12 sm:py-8"
      aria-labelledby="contact-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-start justify-center text-left max-w-4xl mx-auto w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2
            id="contact-title"
            className="font-gambarino text-4xl sm:text-5xl md:text-6xl text-orange-600 dark:text-orange-600 leading-tight"
          >
            {renderFormattedTitle(title)}
          </h2>
          <p className="mt-4 font-mono text-neutral-600 dark:text-neutral-400 text-sm sm:text-md">
            {subtitle}
          </p>
        </motion.div>

        <div className="flex flex-col gap-8 mb-16">
          {socialLinks.map((link, index) => {
            const isEmail =
              link.name === 'Email' || link.href.startsWith('mailto:');
            const cleanEmail = link.href.replace('mailto:', '');

            return (
              <motion.div
                key={link.id ?? link.name}
                className="flex items-center gap-4 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
              >
                <a
                  href={link.href}
                  target={!isEmail ? '_blank' : undefined}
                  rel={!isEmail ? 'noopener noreferrer' : undefined}
                  className="relative inline-block"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-gambarino text-2xl sm:text-3xl text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                      {link.name}
                    </span>
                    <span className="text-sm text-orange-600 dark:text-orange-600">
                      {link.showedName}
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-neutral-400 dark:text-neutral-500 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-orange-600 dark:bg-orange-600 transition-all duration-500" />
                </a>

                {isEmail && (
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(cleanEmail)}
                    aria-label="Copy email address"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-neutral-300/50 dark:hover:bg-neutral-800 transition-colors relative cursor-pointer"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span
                          key="copied"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-mono"
                        >
                          <Check size={14} /> Copied!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        >
                          <Copy size={15} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="w-full mt-24 font-mono text-center px-4 text-xs sm:text-base text-neutral-500 dark:text-neutral-400 font-medium tracking-tight">
          &nbsp;Build with Passion, Tamdev © 2026
        </div>
      </motion.div>
    </section>
  );
}