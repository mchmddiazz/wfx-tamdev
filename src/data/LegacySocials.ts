export interface LegacySocial {
  platform: string;
  label: string;
  url: string;
  sort_order: number;
}

export const LEGACY_SOCIALS: LegacySocial[] = [
  {
    platform: 'LinkedIn',
    label: 'Mochamad Dhias Ath - thariq',
    url: 'https://www.linkedin.com/in/mochamad-dhias',
    sort_order: 1,
  },
  {
    platform: 'GitHub',
    label: '@mchmddiazz',
    url: 'https://www.github.com/mchmddiazz',
    sort_order: 2,
  },
  {
    platform: 'Instagram',
    label: '@mchmddiaz',
    url: 'https://www.instagram.com/mchmddiaz/',
    sort_order: 3,
  },
  {
    platform: 'Email',
    label: 'mchmddiazz@gmail.com',
    url: 'mailto:mchmddiazz@gmail.com',
    sort_order: 4,
  },
];