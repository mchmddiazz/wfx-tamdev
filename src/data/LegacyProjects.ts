const projectImages = import.meta.glob<string>("../assets/img/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

export interface LegacyProject {
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  live_url: string | null;
  repo_url: string | null;
  sort_order: number;
}

export const LEGACY_PROJECTS: LegacyProject[] = [
  {
    title: "Green Rebel Foods",
    slug: "green-rebel-foods",
    category: "Shopify Development",
    description:
      "Implemented custom cart logic to alert customers when frozen and non-frozen items are mixed in the same shipment.",
    image: projectImages["../assets/img/gr-foods.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript", "Cart.js", "Storefront API"],
    live_url: "https://greenrebelfoods.com",
    repo_url: null,
    sort_order: 1,
  },
  {
    title: "Mario Minardi",
    slug: "mario-minardi",
    category: "Shopify Development",
    description:
      "Optimized site performance, fixed legacy bugs, adding new features, and integrated third-party applications to enhance user experience.",
    image: projectImages["../assets/img/mariominardi.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript", "Storefront API"],
    live_url: "https://mariominardi.com",
    repo_url: null,
    sort_order: 2,
  },
  {
    title: "Luma (ex Kasanoa)",
    slug: "luma-ex-kasanoa",
    category: "Shopify Theme",
    description:
      "Built a custom Shopify theme for a client, focusing on a clean and modern design to enhance user experience.",
    image: projectImages["../assets/img/luma-ex-kasanoa.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript"],
    live_url: "https://luma.id",
    repo_url: null,
    sort_order: 3,
  },
  {
    title: "Persebaya Store",
    slug: "persebaya-store",
    category: "Shopify Development",
    description:
      "Engineered custom jersey name-set personalization and tailored the checkout flow for a seamless customer purchasing experience.",
    image: projectImages["../assets/img/persebaya.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript", "Cart.js", "Storefront API"],
    live_url: "https://persebayastore.com",
    repo_url: null,
    sort_order: 4,
  },
  {
    title: "Sonderlab",
    slug: "sonderlab",
    category: "Shopify Theme",
    description:
      "Developed a custom Shopify theme featuring specialized e-commerce features and bug fixes to drive engagement and sales.",
    image: projectImages["../assets/img/sonderlab.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript"],
    live_url: "https://sonderlab.co",
    repo_url: null,
    sort_order: 5,
  },
  {
    title: "Woodka Watch",
    slug: "woodka-watch",
    category: "Shopify Theme",
    description:
      "Created a custom Shopify theme with bespoke product bundling features to boost store conversion and average order value.",
    image: projectImages["../assets/img/woodka.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript", "Cart.js", "Storefront API"],
    live_url: "https://woodka.fun",
    repo_url: null,
    sort_order: 6,
  },
  {
    title: "Easea.co",
    slug: "easea-co",
    category: "Shopify Development",
    description:
      "Optimized site performance, fixed legacy bugs, and integrated third-party applications to boost overall speed and user experience.",
    image: projectImages["../assets/img/easea.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript"],
    live_url: "https://easea.co",
    repo_url: null,
    sort_order: 7,
  },
  {
    title: "WFX Session Tools",
    slug: "wfx-session-tools",
    category: "Python / Automation",
    description:
      "Developed an automated Telegram bot and cli using Telethon to manage session files, export data with Telethon",
    image: projectImages["../assets/img/wfx-tele-update.webp"],
    technologies: ["Python", "Telethon", "Aiogram", "Telegram API"],
    live_url: null,
    repo_url: "https://github.com/mchmddiazz/wfx-telegram-bot",
    sort_order: 8,
  },
];