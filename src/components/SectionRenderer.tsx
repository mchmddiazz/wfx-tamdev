import { lazy } from 'react';
import { SiteSection } from '../types/cms';

const Hero = lazy(() => import('./Hero'));
const About = lazy(() => import('./About'));
const Background = lazy(() => import('./Background'));
const Work = lazy(() => import('./Work'));
const Contact = lazy(() => import('./Contact'));
const Value = lazy(() => import('./Value'));
const CustomSection = lazy(() => import('./CustomSection'));

interface SectionRendererProps {
  section: SiteSection;
  mode?: 'published' | 'draft';
}

export function SectionRenderer({ section, mode = 'published' }: SectionRendererProps) {
  const settings =
    mode === 'draft' ? section.draft_settings : section.published_settings;

  switch (section.type) {
    case 'hero':
      return <Hero id={section.anchor_id} settings={settings} />;
    case 'about':
      return <About id={section.anchor_id} />;
    case 'background':
      return <Background id={section.anchor_id} settings={settings} />;
    case 'work':
      return <Work id={section.anchor_id} />;
    case 'contact':
      return <Contact id={section.anchor_id} settings={settings} />;
    case 'values':
      return <Value id={section.anchor_id} />;
    case 'custom_cta':
      return <CustomSection id={section.anchor_id} settings={settings} />;
    default:
      return null;
  }
}
