import { motion } from "framer-motion";
import { useEffect, useState } from "react";
// Import Swiper React components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const projectImages = import.meta.glob<string>("../assets/img/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

export default function Work() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const projects = [
    {
      title: "Easea.co",
      description: "Optimized site performance, fixed legacy bugs, and integrated third-party applications to boost overall speed and user experience.",
      image: projectImages["../assets/img/easea.webp"],
      technologies: ["Shopify", "Liquid", "JavaScript"],
      url: "https://easea.co",
    },
    {
      title: "Persebaya Store",
      description: "Engineered custom jersey name-set personalization and tailored the checkout flow for a seamless customer purchasing experience.",
      image: projectImages["../assets/img/persebaya.webp"],
      technologies: ["Shopify", "Liquid", "JavaScript"],
      url: "https://persebayastore.com",
    },
    {
      title: "Sonderlab",
      description: "Developed a custom Shopify theme featuring specialized e-commerce features and bug fixes to drive engagement and sales.",
      image: projectImages["../assets/img/sonderlab.webp"],
      technologies: ["Shopify", "Liquid", "JavaScript"],
      url: "https://sonderlab.co",
    },
    {
      title: "Woodka Watch",
      description: "Created a custom Shopify theme with bespoke product bundling features to boost store conversion and average order value.",
      image: projectImages["../assets/img/woodka.webp"],
      technologies: ["Shopify", "Liquid", "JavaScript"],
      url: "https://woodka.fun",
    },
    {
      title: "WFX Telegram Bot (Private Project)",
      description: "An automated Telegram bot using Telethon to manage session files, export data, and real-time notifications.",
      image: projectImages["../assets/img/wfx-tele.webp"],
      technologies: ["Python", "Telethon", "Aiogram"],
      url: "https://github.com/mchmddiazz/wfx-telegram-bot",
    },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    e.currentTarget.style.transform =
      "perspective(1000px) rotateX(0) rotateY(0)";
  };

  return (
    <motion.section
      id="work"
      className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-200 dark:bg-black transition-colors py-12 sm:py-8 md:pl-[10%]"
      aria-labelledby="portfolio-title"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: 0.2 }}
      variants={{
        hidden: {},
        visible: {},
      }}
    >
      <motion.div className="w-full max-w-6xl mx-auto px-5">
        <h2
          id="portfolio-title"
          className="font-gambarino text-lg sm:text-xl md:text-2xl font-semibold mb-4 mt-8 md:mt-auto text-orange-600 dark:text-orange-600"
        >
          PAST PROJECTS
        </h2>
        <p className="mt-4 font-mono text-neutral-600 dark:text-neutral-400 text-sm sm:text-md mb-6 md:mt-auto">
          See some of the projects I've worked on, showcasing my skills in web
          development, design, and problem-solving. Each project reflects my
          commitment to creating functional and visually appealing digital
          experiences.
        </p>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
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
          {projects.map((project, index) => (
            <SwiperSlide key={index} className="h-full">
              <motion.div
                className="group h-full md:h-[60vh] flex border border-orange-500/20 dark:border-orange-500/20 rounded-xl flex-col p-6 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/50 hover:dark:border-orange-500/30"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transformStyle: "preserve-3d",
                  transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
                  willChange: "transform",
                }}
              >
                <div
                  aria-label={`Project: ${project.title}`}
                  className="flex flex-col gap-4 flex-1"
                >
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-2">
                      <motion.img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        initial={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
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
                      View project
                    </a>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </motion.section>
  );
}