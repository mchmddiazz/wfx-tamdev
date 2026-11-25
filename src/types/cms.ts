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