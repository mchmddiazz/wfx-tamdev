import { WorkExperience } from '../types/cms';

// Hard-coded fallback data mirrored from Background.tsx
// Used by the CMS "Import Legacy" button to seed Supabase on first use.
export const LEGACY_WORK_EXPERIENCES: Omit<WorkExperience, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    company: 'Digiserve by Telkom Indonesia',
    role: 'Intern Network Engineer (SD-WAN Project)',
    period: 'Sep 2026 - Present',
    city: 'Bandung, Indonesia',
    description:
      'Installed, replaced, and configured SD-WAN hardware for Digiserve enterprise clients at PT Indomarco Prismatama retail sites, managing network deployment projects across Greater Bandung, Priangan Timur, Sumedang, and Sukabumi. Responsible for cable routing, labeling, server rack setup, and testing network connectivity and failover performance while collaborating with the central NOC team for remote device provisioning and creating accurate work completion reports.',
    sort_order: 1,
    is_active: true,
  },
  {
    company: 'Boleh Dicoba Digital',
    role: 'Web Developer',
    period: 'Sep 2019 - Feb 2025',
    city: 'Bandung, Indonesia',
    description:
      'Designing and customizing client e-commerce websites using Shopify and Liquid templates from brief to deployment, consistently optimizing page load performance to meet platform standards while redesigning interfaces based on Figma mockups, collaborating with design teams, resolving technical issues, and documenting troubleshooting procedures.',
    sort_order: 2,
    is_active: true,
  },
];
