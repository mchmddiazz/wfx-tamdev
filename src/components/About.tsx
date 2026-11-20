import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import profileImage from '../assets/img/profile.webp';
import { supabase } from '../lib/supabase';

const DEFAULT_GREETING = "Hi, I'm Diaz";
const DEFAULT_BIO =
  'Network Engineer with a 5+ year background in Digital Marketing Agencies, managing Shopify platforms for major brands like Atmos Indonesia, Persebaya Store, Woodka Watch, and 15+ client projects. Now leveraging strong technical and problem-solving skills into enterprise network engineering. Hands-on experience at Digiserve by Telkom Indonesia delivering large-scale SD-WAN configurations for PT Indomarco Prismatama, including leading Phase 2 rollout across Greater Bandung, Sumedang, and Sukabumi. Bringing strong TCP/IP fundamentals and high field adaptability to ISP operations.';

export default function About() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [avatarUrl, setAvatarUrl] = useState<string>(profileImage);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);

    async function loadAbout() {
      const { data, error } = await supabase
        .from('site_profile')
        .select('subheadline, bio, profile_image_url')
        .eq('id', 1)
        .single();

      if (!error && data) {
        if (data.subheadline) setGreeting(data.subheadline);
        if (data.bio) setBio(data.bio);
        if (data.profile_image_url) setAvatarUrl(data.profile_image_url);
      }
    }
    loadAbout();

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <section
      id="about"
      className="min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black text-neutral-900 dark:text-white transition-colors px-6 sm:px-8 py-12 sm:py-8"
      aria-labelledby="about-title"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 w-full max-w-7xl mx-auto py-24"
      >
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-full max-w-md mx-auto rounded-lg object-cover"
        />
        <div className="max-w-2xl text-sm sm:text-base font-mono text-justify leading-relaxed">
          <h3 className="text-xl md:text-2xl font-bold mb-4">{greeting}</h3>
          <p>{bio}</p>
        </div>
      </motion.div>
    </section>
  );
}