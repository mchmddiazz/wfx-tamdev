import { SectionType, SiteSection } from '../types/cms';

export type FieldType = 'text' | 'textarea' | 'toggle';

export interface SectionFieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

export interface SectionDefinition {
  type: SectionType;
  name: string;
  category: 'portfolio' | 'custom';
  description: string;
  defaultNavLabel: string;
  defaultAnchorId: string;
  defaultSettings: Record<string, string | boolean>;
  fields: SectionFieldSchema[];
}

export const SECTION_REGISTRY: Record<SectionType, SectionDefinition> = {
  hero: {
    type: 'hero',
    name: 'Hero Banner',
    category: 'portfolio',
    description: 'Full-height intro headline with online status indicator.',
    defaultNavLabel: 'Intro',
    defaultAnchorId: 'intro',
    defaultSettings: {
      headline: '',
      statusText: 'Online',
      showStatusDot: true,
    },
    fields: [
      {
        key: 'headline',
        label: 'Headline (optional override)',
        type: 'textarea',
        placeholder: 'Leave blank to use Profile headline...',
      },
      { key: 'statusText', label: 'Status Badge Text', type: 'text', placeholder: 'Online' },
      { key: 'showStatusDot', label: 'Show Status Dot', type: 'toggle' },
    ],
  },
  about: {
    type: 'about',
    name: 'About / Bio',
    category: 'portfolio',
    description: '2-column profile photo and personal introduction.',
    defaultNavLabel: 'About',
    defaultAnchorId: 'about',
    defaultSettings: {},
    fields: [],
  },
  background: {
    type: 'background',
    name: 'Work Experience',
    category: 'portfolio',
    description: 'Vertical career timeline powered by Work Experience CMS.',
    defaultNavLabel: 'Background',
    defaultAnchorId: 'background',
    defaultSettings: {
      heading: 'WORK EXPERIENCE',
    },
    fields: [
      { key: 'heading', label: 'Section Heading', type: 'text', placeholder: 'WORK EXPERIENCE' },
    ],
  },
  work: {
    type: 'work',
    name: 'Projects Carousel',
    category: 'portfolio',
    description: 'Interactive project showcase powered by Projects CMS.',
    defaultNavLabel: 'Work',
    defaultAnchorId: 'work',
    defaultSettings: {},
    fields: [],
  },
  contact: {
    type: 'contact',
    name: 'Contact & Socials',
    category: 'portfolio',
    description: 'Email copy action, social links, and footer.',
    defaultNavLabel: 'Contact',
    defaultAnchorId: 'contact',
    defaultSettings: {},
    fields: [],
  },
  values: {
    type: 'values',
    name: 'Core Values',
    category: 'custom',
    description: '3-column Innovation, Quality, and Collaboration grid.',
    defaultNavLabel: 'Values',
    defaultAnchorId: 'values',
    defaultSettings: {},
    fields: [],
  },
  custom_cta: {
    type: 'custom_cta',
    name: 'Custom Text / CTA',
    category: 'custom',
    description: 'Flexible announcement, service highlight, or call-to-action block.',
    defaultNavLabel: 'Highlight',
    defaultAnchorId: 'highlight',
    defaultSettings: {
      eyebrow: 'FEATURED',
      heading: 'Available for Network & Web Projects',
      body: 'Need help with enterprise SD-WAN deployments, MikroTik/routing setups, or custom Shopify/React applications? Let’s collaborate.',
      ctaLabel: 'Get in Touch',
      ctaHref: '#contact',
    },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow Label', type: 'text', placeholder: 'FEATURED' },
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Section heading...' },
      { key: 'body', label: 'Body Text', type: 'textarea', placeholder: 'Write your message...' },
      { key: 'ctaLabel', label: 'Button Label', type: 'text', placeholder: 'Get in Touch' },
      { key: 'ctaHref', label: 'Button Link / Anchor', type: 'text', placeholder: '#contact' },
    ],
  },
};

export const DEFAULT_SECTIONS: SiteSection[] = [
  {
    id: 'default-hero',
    type: 'hero',
    nav_label: 'Intro',
    anchor_id: 'intro',
    show_in_nav: true,
    is_visible: true,
    sort_order: 0,
    draft_settings: {},
    published_settings: {},
    has_unpublished_changes: false,
  },
  {
    id: 'default-about',
    type: 'about',
    nav_label: 'About',
    anchor_id: 'about',
    show_in_nav: true,
    is_visible: true,
    sort_order: 1,
    draft_settings: {},
    published_settings: {},
    has_unpublished_changes: false,
  },
  {
    id: 'default-background',
    type: 'background',
    nav_label: 'Background',
    anchor_id: 'background',
    show_in_nav: true,
    is_visible: true,
    sort_order: 2,
    draft_settings: {},
    published_settings: {},
    has_unpublished_changes: false,
  },
  {
    id: 'default-work',
    type: 'work',
    nav_label: 'Work',
    anchor_id: 'work',
    show_in_nav: true,
    is_visible: true,
    sort_order: 3,
    draft_settings: {},
    published_settings: {},
    has_unpublished_changes: false,
  },
  {
    id: 'default-contact',
    type: 'contact',
    nav_label: 'Contact',
    anchor_id: 'contact',
    show_in_nav: true,
    is_visible: true,
    sort_order: 4,
    draft_settings: {},
    published_settings: {},
    has_unpublished_changes: false,
  },
];
