export interface SiteProfile {
  id: number;
  headline: string;
  subheadline: string;
  bio: string;
  profile_image_url: string | null;
  resume_pdf_url: string | null;
  contact_title?: string;
  contact_subtitle?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  thumbnail_url: string;
  live_url: string | null;
  repo_url: string | null;
  tech_stack: string[];
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  city?: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type HeaderDisplayMode = 'text' | 'logo' | 'logo_with_text';

export interface ProjectBlockItem {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail_url: string;
  live_url: string | null;
  repo_url: string | null;
  tech_stack: string[];
  is_published: boolean;
}

export interface WorkExperienceBlockItem {
  id: string;
  company: string;
  role: string;
  period: string;
  city?: string;
  description: string;
  is_active: boolean;
}

export interface CertificateBlockItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credential_url?: string;
  image_url?: string;
  is_active: boolean;
}

export type SectionType =
  | 'header'
  | 'hero'
  | 'about'
  | 'background'
  | 'work'
  | 'certificates'
  | 'values'
  | 'custom_cta'
  | 'contact'
  | 'copyright';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionSettings = Record<string, any>;

export interface SiteSection {
  id: string;
  type: SectionType;
  nav_label: string;
  anchor_id: string;
  show_in_nav: boolean;
  is_visible: boolean;
  sort_order: number;
  draft_settings: SectionSettings;
  published_settings: SectionSettings;
  has_unpublished_changes: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SiteTheme {
  id: string;
  name: string;
  is_live: boolean;
  sections: SiteSection[];
  created_at?: string;
  updated_at?: string;
}
