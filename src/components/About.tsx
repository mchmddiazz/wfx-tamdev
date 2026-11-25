import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import profileImage from '../assets/img/profile.webp';
import { supabase } from '../lib/supabase';

const DEFAULT_GREETING = "Hi, I'm Diaz";
const DEFAULT_BIO =
  'Network Engineer with a 5+ year background in Digital Marketing Agencies, managing Shopify platforms for major brands like Atmos Indonesia, Persebaya Store, Woodka Watch, and 15+ client projects. Now leveraging strong technical and problem-solving skills into enterprise network engineering. Hands-on experience at Digiserve by Telkom Indonesia delivering large-scale SD-WAN configurations for PT Indomarco Prismatama, including leading Phase 2 rollout across Greater Bandung, Sumedang, and Sukabumi. Bringing strong TCP/IP fundamentals and high field adaptability to ISP operations.';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function About({ id = 'about', settings }: { id?: string; settings?: Record<string, any> }) {
  const [legacyProfile, setLegacyProfile] = useState<{
    subheadline?: string;
    bio?: string;
    profile_image_url?: string | null;
  } | null>(null);

  const isUnseeded =
    settings?.bio === undefined && settings?.subheadline === undefined;

  useEffect(() => {
    if (!isUnseeded) return;

    let cancelled = false;
    async function loadAbout() {
      const { data, error } = await supabase
        .from('site_profile')
        .select('subheadline, bio, profile_image_url')
        .eq('id', 1)
        .single();

      if (!cancelled && !error && data) {
        setLegacyProfile(data);
      }
    }
    loadAbout();

    return () => {
      cancelled = true;
    };
  }, [isUnseeded]);

  const greeting =
    typeof settings?.subheadline === 'string' && settings.subheadline.trim().length > 0
      ? settings.subheadline
      : legacyProfile?.subheadline || DEFAULT_GREETING;

  const bio =
    typeof settings?.bio === 'string' && settings.bio.trim().length > 0
      ? settings.bio
      : legacyProfile?.bio || DEFAULT_BIO;

  const avatarUrl =
    typeof settings?.profileImageUrl === 'string' && settings.profileImageUrl.trim().length > 0
      ? settings.profileImageUrl
      : legacyProfile?.profile_image_url || profileImage;

  return (
    <section
      id={id}
      className="min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black text-neutral-900 dark:text-white transition-colors px-6 sm:px-8 py-16"
      aria-labelledby="about-title"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-14 w-full max-w-7xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <motion.img
            src={avatarUrl}
            alt="Profile"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-2xl object-cover shadow-xl border border-neutral-300 dark:border-neutral-800"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.8, 0.25, 1] }}
          className="max-w-2xl text-sm sm:text-base font-mono text-justify leading-relaxed"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-4 font-gambarino text-orange-600 dark:text-orange-500">
            {greeting}
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {bio}
          </p>
        </motion.div>
      </div>
    </section>
  );
}