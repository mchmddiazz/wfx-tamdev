export default function Copyright({ settings }: { settings?: Record<string, any> }) {
  const text = settings?.text || 'Build with Passion, Tamdev © 2026';

  return (
    <footer className="w-full bg-neutral-200 dark:bg-black transition-colors py-8 px-4 font-mono text-center text-xs sm:text-base text-neutral-500 dark:text-neutral-400 font-medium tracking-tight">
      {text}
    </footer>
  );
}
