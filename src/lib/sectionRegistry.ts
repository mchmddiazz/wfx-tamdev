import { SectionSettings, SectionType, SiteSection } from '../types/cms';
import { StorageFolder } from './storage';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'toggle'
  | 'select'
  | 'range'
  | 'image'
  | 'file'
  | 'block_list';

export interface SectionFieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  uploadFolder?: StorageFolder;
  blockType?: 'projects' | 'experience' | 'certificates';
}

export interface SectionDefinition {
  type: SectionType;
  name: string;
  category: 'static' | 'portfolio' | 'custom';
  isStatic?: boolean;
  description: string;
  defaultNavLabel: string;
  defaultAnchorId: string;
  defaultSettings: SectionSettings;
  fields: SectionFieldSchema[];
}

export const SECTION_REGISTRY: Record<SectionType, SectionDefinition> = {
  header: {
    type: 'header',
    name: 'Header & Navigation',
    category: 'static',
    isStatic: true,
    description: 'Top navigation bar brand display and resume link.',
    defaultNavLabel: 'Header',
    defaultAnchorId: 'header',
    defaultSettings: {
      displayMode: 'text',
      brandText: 'Tamdev.',
      logoUrl: '',
      logoSize: 28,
      logoRounded: 'lg',
      showResumeLink: true,
      resumeLabel: 'Resume*',
      resumePdfUrl: '',
    },
    fields: [
      {
        key: 'displayMode',
        label: 'Brand Display Mode',
        type: 'select',
        options: [
          { label: 'Text Only', value: 'text' },
          { label: 'Logo Only', value: 'logo' },
          { label: 'Logo + Text', value: 'logo_with_text' },
        ],
      },
      {
        key: 'brandText',
        label: 'Brand Text',
        type: 'text',
        placeholder: 'Tamdev.',
      },
      {
        key: 'logoUrl',
        label: 'Brand Logo',
        type: 'image',
        placeholder: 'https://...',
        uploadFolder: 'logos',
      },
      {
        key: 'logoSize',
        label: 'Logo Size',
        type: 'range',
        min: 16,
        max: 64,
        step: 2,
        unit: 'px',
      },
      {
        key: 'logoRounded',
        label: 'Logo Border Radius',
        type: 'select',
        options: [
          { label: 'Rounded', value: 'lg' },
          { label: 'Circle', value: 'full' },
          { label: 'Square (None)', value: 'none' },
        ],
      },
      {
        key: 'showResumeLink',
        label: 'Show Resume Link',
        type: 'toggle',
      },
      {
        key: 'resumeLabel',
        label: 'Resume Link Label',
        type: 'text',
        placeholder: 'Resume*',
      },
      {
        key: 'resumePdfUrl',
        label: 'Resume PDF',
        type: 'file',
        placeholder: 'https://...',
        uploadFolder: 'resume',
      },
    ],
  },
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
      {
        key: 'statusText',
        label: 'Status Badge Text',
        type: 'text',
        placeholder: 'Online',
      },
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
    fields: [
      {
        key: 'subheadline',
        label: 'Greeting / Subheadline',
        type: 'text',
        placeholder: "Hi, I'm Diaz",
      },
      {
        key: 'bio',
        label: 'Biography',
        type: 'textarea',
        placeholder: 'Write your personal introduction...',
      },
      {
        key: 'profileImageUrl',
        label: 'Profile Image',
        type: 'image',
        placeholder: 'https://...',
        uploadFolder: 'profile',
      },
    ],
  },
  background: {
    type: 'background',
    name: 'Work Experience',
    category: 'portfolio',
    description: 'Vertical career timeline powered by dynamic experience blocks.',
    defaultNavLabel: 'Background',
    defaultAnchorId: 'background',
    defaultSettings: {
      heading: 'WORK EXPERIENCE',
    },
    fields: [
      {
        key: 'heading',
        label: 'Section Heading',
        type: 'text',
        placeholder: 'WORK EXPERIENCE',
      },
      {
        key: 'items',
        label: 'Experience Items',
        type: 'block_list',
        blockType: 'experience',
      },
    ],
  },
  work: {
    type: 'work',
    name: 'Projects Carousel',
    category: 'portfolio',
    description: 'Interactive project showcase powered by dynamic project blocks.',
    defaultNavLabel: 'Work',
    defaultAnchorId: 'work',
    defaultSettings: {
      heading: 'Selected Work',
    },
    fields: [
      {
        key: 'heading',
        label: 'Section Heading',
        type: 'text',
        placeholder: 'Selected Work',
      },
      {
        key: 'items',
        label: 'Project Items',
        type: 'block_list',
        blockType: 'projects',
      },
    ],
  },
  certificates: {
    type: 'certificates',
    name: 'Certificates',
    category: 'portfolio',
    description: 'Showcase of professional certifications and credentials.',
    defaultNavLabel: 'Certificates',
    defaultAnchorId: 'certificates',
    defaultSettings: {
      heading: 'CERTIFICATES',
      subtitle: '',
      items: [],
    },
    fields: [
      {
        key: 'heading',
        label: 'Section Heading',
        type: 'text',
        placeholder: 'CERTIFICATES',
      },
      {
        key: 'subtitle',
        label: 'Subtitle (optional)',
        type: 'text',
        placeholder: 'Industry certifications and achievements',
      },
      {
        key: 'items',
        label: 'Certificate Items',
        type: 'block_list',
        blockType: 'certificates',
      },
    ],
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
      {
        key: 'eyebrow',
        label: 'Eyebrow Label',
        type: 'text',
        placeholder: 'FEATURED',
      },
      {
        key: 'heading',
        label: 'Heading',
        type: 'text',
        placeholder: 'Section heading...',
      },
      {
        key: 'body',
        label: 'Body Text',
        type: 'textarea',
        placeholder: 'Write your message...',
      },
      {
        key: 'ctaLabel',
        label: 'Button Label',
        type: 'text',
        placeholder: 'Get in Touch',
      },
      {
        key: 'ctaHref',
        label: 'Button Link / Anchor',
        type: 'text',
        placeholder: '#contact',
      },
    ],
  },
  contact: {
    type: 'contact',
    name: 'Contact & Socials',
    category: 'portfolio',
    description: 'Email copy action and global social links.',
    defaultNavLabel: 'Contact',
    defaultAnchorId: 'contact',
    defaultSettings: {},
    fields: [
      {
        key: 'title',
        label: 'Heading (optional override)',
        type: 'textarea',
        placeholder: "Let's\nConnect",
      },
      {
        key: 'subtitle',
        label: 'Subtitle (optional override)',
        type: 'textarea',
        placeholder:
          'Available for collaborations, opportunities, or just a friendly chat.',
      },
    ],
  },
  copyright: {
    type: 'copyright',
    name: 'Copyright Footer',
    category: 'static',
    isStatic: true,
    description: 'Bottom footer copyright bar.',
    defaultNavLabel: 'Copyright',
    defaultAnchorId: 'copyright',
    defaultSettings: {
      text: 'Build with Passion, Tamdev © 2026',
    },
    fields: [
      {
        key: 'text',
        label: 'Copyright Text',
        type: 'text',
        placeholder: 'Build with Passion, Tamdev © 2026',
      },
    ],
  },
};

export const DEFAULT_SECTIONS: SiteSection[] = [
  {
    id: 'default-header',
    type: 'header',
    nav_label: 'Header',
    anchor_id: 'header',
    show_in_nav: false,
    is_visible: true,
    sort_order: 0,
    draft_settings: { ...SECTION_REGISTRY.header.defaultSettings },
    published_settings: { ...SECTION_REGISTRY.header.defaultSettings },
    has_unpublished_changes: false,
  },
  {
    id: 'default-hero',
    type: 'hero',
    nav_label: 'Intro',
    anchor_id: 'intro',
    show_in_nav: true,
    is_visible: true,
    sort_order: 1,
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
    sort_order: 2,
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
    sort_order: 3,
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
    sort_order: 4,
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
    sort_order: 5,
    draft_settings: {},
    published_settings: {},
    has_unpublished_changes: false,
  },
  {
    id: 'default-copyright',
    type: 'copyright',
    nav_label: 'Copyright',
    anchor_id: 'copyright',
    show_in_nav: false,
    is_visible: true,
    sort_order: 6,
    draft_settings: { ...SECTION_REGISTRY.copyright.defaultSettings },
    published_settings: { ...SECTION_REGISTRY.copyright.defaultSettings },
    has_unpublished_changes: false,
  },
];
