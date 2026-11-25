import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Project, ProjectBlockItem } from "../types/cms";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const projectImages = import.meta.glob<string>("../assets/img/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const iconImages = import.meta.glob<string>("../assets/icons/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

interface DisplayProject {
  id?: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  url: string;
  isRepo?: boolean;
}

const FALLBACK_PROJECTS: DisplayProject[] = [
  {
    title: "Green Rebel Foods",
    description:
      "Implemented custom cart logic to alert customers when frozen and non-frozen items are mixed in the same shipment.",
    image: projectImages["../assets/img/gr-foods.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript", "Cart.js", "Storefront API"],
    url: "https://greenrebelfoods.com",
  },
  {
    title: "Mario Minardi",
    description:
      "Optimized site performance, fixed legacy bugs, adding new features, and integrated third-party applications to enhance user experience.",
    image: projectImages["../assets/img/mariominardi.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript", "Storefront API"],
    url: "https://mariominardi.com",
  },
  {
    title: "Luma (ex Kasanoa)",
    description:
      "Built a custom Shopify theme for a client, focusing on a clean and modern design to enhance user experience.",
    image: projectImages["../assets/img/luma-ex-kasanoa.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript"],
    url: "https://luma.id",
  },
  {
    title: "Persebaya Store",
    description:
      "Engineered custom jersey name-set personalization and tailored the checkout flow for a seamless customer purchasing experience.",
    image: projectImages["../assets/img/persebaya.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript", "Cart.js", "Storefront API"],
    url: "https://persebayastore.com",
  },
  {
    title: "Sonderlab",
    description:
      "Developed a custom Shopify theme featuring specialized e-commerce features and bug fixes to drive engagement and sales.",
    image: projectImages["../assets/img/sonderlab.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript"],
    url: "https://sonderlab.co",
  },
  {
    title: "Woodka Watch",
    description:
      "Created a custom Shopify theme with bespoke product bundling features to boost store conversion and average order value.",
    image: projectImages["../assets/img/woodka.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript", "Cart.js", "Storefront API"],
    url: "https://woodka.fun",
  },
  {
    title: "Easea.co",
    description:
      "Optimized site performance, fixed legacy bugs, and integrated third-party applications to boost overall speed and user experience.",
    image: projectImages["../assets/img/easea.webp"],
    technologies: ["Shopify", "Liquid", "JavaScript"],
    url: "https://easea.co",
  },
  {
    title: "WFX Session Tools",
    description:
      "Developed an automated Telegram bot and cli using Telethon to manage session files, export data with Telethon",
    image: projectImages["../assets/img/wfx-tele-update.webp"],
    technologies: ["Python", "Telethon", "Aiogram", "Telegram API"],
    url: "https://github.com/mchmddiazz/wfx-telegram-bot",
    isRepo: true,
  },
];

function ProjectCard({ project, isMobile }: { project: DisplayProject; isMobile: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 280, damping: 24 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 280, damping: 24 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="group h-[75vh] md:h-[60vh] flex border border-orange-500/20 dark:border-orange-500/20 rounded-xl flex-col p-6 backdrop-blur-sm transition-colors duration-300 hover:border-orange-500/50 hover:dark:border-orange-500/40"
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformPerspective: 1000,
      }}
    >
      <div
        aria-label={`Project: ${project.title}`}
        className="flex flex-col gap-4 flex-1"
      >
        <div className="flex flex-col gap-4 flex-1">
          <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-2 bg-neutral-300 dark:bg-neutral-800">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          </div>
          <h3 className="font-gambarino text-[1.45rem] sm:text-2xl font-semibold text-neutral-900 dark:text-white mb-1 leading-tight">
            {project.title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 font-mono text-[1rem] leading-relaxed mb-3">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {project.technologies.map((tech, techIndex) => (
              <span
                key={techIndex}
                className="text-xs px-2.5 py-1 rounded-full border border-orange-500/20 dark:border-orange-500/20 text-orange-700 dark:text-orange-300"
              >
                {tech}
              </span>
            ))}
          </div>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-fit items-center rounded-md bg-orange-600 px-4 py-2 font-mono text-sm text-white transition-colors hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            {project.isRepo || project.title.includes("Telegram")
              ? "View on GitHub"
              : "Visit Site"}
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Work({ id = "work", settings }: { id?: string; settings?: Record<string, any> }) {
  const [isMobile, setIsMobile] = useState(false);
  const [legacyProjects, setLegacyProjects] = useState<DisplayProject[]>(FALLBACK_PROJECTS);

  const hasSeededItems = Array.isArray(settings?.items);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    let cancelled = false;

    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (!cancelled && !error && data && data.length > 0) {
        const mapped: DisplayProject[] = (data as Project[]).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          image: item.thumbnail_url,
          technologies: item.tech_stack || [],
          url: item.live_url || item.repo_url || "#",
          isRepo: !item.live_url && Boolean(item.repo_url),
        }));
        setLegacyProjects(mapped);
      }
    }

    if (!hasSeededItems) {
      loadProjects();
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", checkMobile);
    };
  }, [hasSeededItems]);

  const projects: DisplayProject[] = hasSeededItems
    ? (settings!.items as ProjectBlockItem[])
        .filter((item) => item.is_published !== false)
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          image: item.thumbnail_url,
          technologies: item.tech_stack || [],
          url: item.live_url || item.repo_url || "#",
          isRepo: !item.live_url && Boolean(item.repo_url),
        }))
    : legacyProjects;

  const heading =
    typeof settings?.heading === "string" && settings.heading.trim().length > 0
      ? settings.heading
      : "PAST PROJECTS";

  return (
    <motion.section
      id={id}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-200 dark:bg-black transition-colors py-12 sm:py-8 md:pl-[10%]"
      aria-labelledby="portfolio-title"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-6xl mx-auto px-5">
        <h2
          id="portfolio-title"
          className="font-gambarino text-lg sm:text-xl md:text-2xl font-semibold mb-4 mt-8 md:mt-auto text-orange-600 dark:text-orange-600"
        >
          {heading}
        </h2>
        <p className="mt-4 font-mono text-neutral-600 dark:text-neutral-400 text-sm sm:text-md mb-6 md:mt-auto">
          A selection of client e-commerce platforms, custom Shopify builds, and automation tools I've built and maintained over the years. Each project showcases my expertise in web development, problem-solving, and delivering high-quality solutions that meet client needs.
        </p>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            prevEl: ".custom-prev",
            nextEl: ".custom-next",
          }}
          pagination={{
            el: ".custom-pagination",
            clickable: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
        >
          <div className="swiper-nav-wrapper flex mt-4">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="custom-prev bg-orange-600 hover:bg-orange-700 md:p-2 rounded text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              <img
                src={iconImages["../assets/icons/arrow-left.png"]}
                alt="Previous"
              />
            </motion.button>

            <div className="custom-pagination flex items-center justify-center gap-2"></div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="custom-next bg-orange-600 hover:bg-orange-700 md:p-2 rounded text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              <img
                src={iconImages["../assets/icons/arrow-right.png"]}
                alt="Next"
              />
            </motion.button>
          </div>

          {projects.map((project, index) => (
            <SwiperSlide key={project.id ?? index} className="h-full">
              <ProjectCard project={project} isMobile={isMobile} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </motion.section>
  );
}