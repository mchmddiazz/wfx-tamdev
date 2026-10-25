import { motion } from "framer-motion";

const workExperiences = [
  {
    company: "Digiserve by Telkom Indonesia",
    role: "Intern Network Engineer (SD-WAN Project)",
    period: "Sep 2026 - Now",
    description: "Installed, replaced, and configured SD-WAN hardware for Digiserve enterprise clients at PT Indomarco Prismatama retail sites, managing network deployment projects across Greater Bandung, Priangan Timur, Sumedang, and Sukabumi. Responsible for cable routing, labeling, server rack setup, and testing network connectivity and failover performance while collaborating with the central NOC team for remote device provisioning and creating accurate work completion reports.",
  }
];

const anotherWorkExperiences = [
  {
    company: "PT. XLSmart Telecom Sejahtera (Legacy Smartfren)",
    role: "Sales Direct Selling Agent",
    period: "Sep 2019 - Feb 2025",
    description: "Experienced in intensive fieldwork, maintaining strong customer communication, and resolving on-site issues, while achieving top sales performance in the Andir and Sukajadi areas twice.",
  },
  {
    company: "Boleh Dicoba Digital",
    role: "Web Developer",
    period: "Sep 2019 - Feb 2025",
    description: "Designing and customizing client e-commerce websites using Shopify and Liquid templates from brief to deployment, consistently optimizing page load performance to meet platform standards while redesigning interfaces based on Figma mockups, collaborating with design teams, resolving technical issues, and documenting troubleshooting procedures.",
  }
];

// const positionsOfResponsibility = [
//   {
//     organization: "MUN Society, MPSTME",
//     role: "Joint General Secretary for Creatives",
//     period: "May 2024 - May 2025",
//     description: "Directed the creative and branding efforts for the MUN Society, conceptualizing visual content, event designs, and promotional material to enhance engagement and outreach.",
//   },
//   {
//     organization: "Mumbai MUN",
//     role: "Chief Information Officer",
//     period: "May 2024 - May 2025",
//     description: "Oversaw the digital operations, managed website updates, social media communications, and ensured secure and effective information flow within the organization.",
//   },
//   {
//     organization: "Social Conclave",
//     role: "Vice-Chair Person",
//     period: "Nov 2024 - Jan 2025",
//     description: "Co-led event planning and execution, coordinated between organizing teams, moderated sessions, and helped expand outreach to maximize participation and visibility.",
//   },
//   {
//     organization: "Cyber Chakravyuh",
//     role: "Technical Head",
//     period: "Sep 2024 - May 2025",
//     description: "Led the cybersecurity event’s technical strategy, including problem-setting, platform management, and workshop curation to foster interest and participation in cybersecurity.",
//   },
//   {
//     organization: "Editorial Board, MPSTME",
//     role: "Joint General Secretary",
//     period: "Jul 2023 - Aug 2024",
//     description: "Managed editorial operations, contributed to college publications, organized creative writing events, and ensured high editorial standards across student-led initiatives.",
//   },
//   {
//     organization: "IIT Bombay's Techfest World MUN",
//     role: "Under Secretariat General for Design",
//     period: "Aug 2023 - Dec 2024",
//     description: "Led the design and branding efforts for Techfest World MUN, creating event graphics, delegate handbooks, promotional material, and ensuring cohesive visual identity across all platforms.",
//   },
// ];

export default function Background() {
  return (
    <section
      id="background"
      className="min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black transition-colors px-6 sm:px-8 py-12 sm:py-8"
      aria-labelledby="experience-title"
    >
      <motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 1 }}
  className="flex flex-col items-start justify-center text-left max-w-4xl mx-auto w-full"
>
  <div className="space-y-20 w-full">
    {/* Work Experience Section */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="font-gambarino text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-orange-600 dark:text-orange-600">
        WORK EXPERIENCE
      </h3>
      <div className="flex flex-col gap-8">
        {workExperiences.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex flex-row items-start gap-4"
          >
            <div className="space-y-2">
              <div className="text-base text-orange-600 dark:text-orange-600 font-mono">{exp.company}</div>
              <div className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">{exp.role}</div>
              <div className="flex flex-row items-center font-mono gap-4 text-xs text-orange-600 dark:text-orange-600 mb-1">
                <span>{exp.period}</span>
              </div>
              <div className="text-neutral-800 font-mono dark:text-neutral-300 text-sm max-w-2xl leading-relaxed">
                {exp.description}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="font-gambarino text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-orange-600 dark:text-orange-600">
        ANOTHER WORK EXPERIENCE
      </h3>
      <div className="flex flex-col gap-8">
        {anotherWorkExperiences.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex flex-row items-start gap-4"
          >
            <div className="space-y-2">
              <div className="text-base text-orange-600 dark:text-orange-600 font-mono">{exp.company}</div>
              <div className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">{exp.role}</div>
              <div className="flex flex-row items-center font-mono gap-4 text-xs text-orange-600 dark:text-orange-600 mb-1">
                <span>{exp.period}</span>
              </div>
              <div className="text-neutral-800 font-mono dark:text-neutral-300 text-sm max-w-2xl leading-relaxed">
                {exp.description}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Positions of Responsibility Section */}
    {/* <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="font-gambarino text-lg sm:text-xl md:text-2xl font-semibold mb-6 text-orange-600 dark:text-orange-600">
        POSITIONS OF RESPONSIBILITY
      </h3>
      <div className="flex flex-col gap-8">
        {positionsOfResponsibility.map((pos, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex flex-row items-start gap-4"
          >
            <div className="space-y-2">
              <div className="text-base text-orange-600 dark:text-orange-600 font-mono">{pos.organization}</div>
              <div className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">{pos.role}</div>
              <div className="flex flex-row items-center font-mono gap-4 text-xs text-orange-600 dark:text-orange-600 mb-1">
                <span>{pos.period}</span>
              </div>
              <div className="text-neutral-800 font-mono dark:text-neutral-300 text-sm max-w-2xl leading-relaxed">
                {pos.description}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div> */}
  </div>
</motion.div>
    </section>
  );
}
