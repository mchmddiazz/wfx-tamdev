import { useEffect, useState, Suspense, lazy } from 'react';
import { SiteSection } from '../../types/cms';
import { DEFAULT_SECTIONS } from '../../lib/sectionRegistry';
import { SectionRenderer } from '../../components/SectionRenderer';
import { ScrollProgress } from '../../components/ScrollProgress';
import Copyright from '../../components/Copyright';

const Navigation = lazy(() => import('../../components/Navigation'));

export default function CustomizePreview() {
  const [sections, setSections] = useState<SiteSection[]>(DEFAULT_SECTIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (data?.type === 'TAMDEV_PREVIEW_UPDATE') {
        if (Array.isArray(data.sections)) {
          setSections(data.sections);
        }
        if ('selectedId' in data) {
          setSelectedId(data.selectedId ?? null);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'TAMDEV_PREVIEW_READY' }, window.location.origin);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const headerSection = sections.find((s) => s.type === 'header');
  const copyrightSection = sections.find((s) => s.type === 'copyright');
  const visibleSections = sections.filter(
    (s) => s.is_visible && s.type !== 'header' && s.type !== 'copyright'
  );
  const navItems = visibleSections
    .filter((s) => s.show_in_nav)
    .map((s) => ({ id: s.anchor_id, label: s.nav_label }));

  return (
    <div className="min-h-screen bg-neutral-200 dark:bg-black transition-colors relative z-0">
      <Suspense fallback={null}>
        <ScrollProgress />
        {headerSection?.is_visible !== false && (
          <Navigation items={navItems} settings={headerSection?.draft_settings} />
        )}
        <main>
          {visibleSections.length === 0 ? (
            <div className="min-h-screen flex items-center justify-center text-neutral-500 text-sm px-6 text-center">
              All sections are hidden. Toggle visibility or add a section on the left.
            </div>
          ) : (
            visibleSections.map((sec) => (
              <div
                key={sec.id}
                onClick={() =>
                  window.parent.postMessage(
                    { type: 'TAMDEV_PREVIEW_SELECT', id: sec.id },
                    window.location.origin
                  )
                }
                className={`relative cursor-pointer transition ${
                  selectedId === sec.id
                    ? 'ring-2 ring-orange-500 ring-inset'
                    : 'hover:ring-1 hover:ring-orange-500/40 ring-inset'
                }`}
              >
                <SectionRenderer section={sec} mode="draft" />
              </div>
            ))
          )}
        </main>
        {copyrightSection?.is_visible !== false &&
          (copyrightSection ? (
            <div
              onClick={() =>
                window.parent.postMessage(
                  { type: 'TAMDEV_PREVIEW_SELECT', id: copyrightSection.id },
                  window.location.origin
                )
              }
              className={`relative cursor-pointer transition ${
                selectedId === copyrightSection.id
                  ? 'ring-2 ring-orange-500 ring-inset'
                  : 'hover:ring-1 hover:ring-orange-500/40 ring-inset'
              }`}
            >
              <Copyright settings={copyrightSection.draft_settings} />
            </div>
          ) : (
            <Copyright />
          ))}
      </Suspense>
    </div>
  );
}
