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

export type SectionType =
  | 'hero'
  | 'about'
  | 'background'
  | 'work'
  | 'contact'
  | 'values'
  | 'custom_cta';

export interface SiteSection {
  id: string;
  type: SectionType;
  nav_label: string;
  anchor_id: string;
  show_in_nav: boolean;
  is_visible: boolean;
  sort_order: number;
  draft_settings: Record<string, string | boolean>;
  published_settings: Record<string, string | boolean>;
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
