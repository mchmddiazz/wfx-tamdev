import { motion } from "framer-motion";

const workExperiences = [
  {
    company: "Digiserve by Telkom Indonesia",
    role: "Intern Network Engineer (SD-WAN Project)",
    period: "Sep 2026 - Present",
    city: "Bandung, Indonesia",
    description: "Installed, replaced, and configured SD-WAN hardware for Digiserve enterprise clients at PT Indomarco Prismatama retail sites, managing network deployment projects across Greater Bandung, Priangan Timur, Sumedang, and Sukabumi. Responsible for cable routing, labeling, server rack setup, and testing network connectivity and failover performance while collaborating with the central NOC team for remote device provisioning and creating accurate work completion reports.",
  },
];

const anotherWorkExperiences = [
  // {
  //   company: "PT. XLSmart Telecom Sejahtera (Legacy Smartfren)",
  //   role: "Sales Direct Selling Agent",
  //   period: "May 2025 - Jun 2026",
  //   description: "Experienced in intensive fieldwork, maintaining strong customer communication, and resolving on-site issues, while achieving top sales performance in the Andir and Sukajadi areas twice.",
  // },
  {
    company: "Boleh Dicoba Digital",
    role: "Web Developer",
    period: "Sep 2019 - Feb 2025",
    city: "Bandung, Indonesia",
    description: "Designing and customizing client e-commerce websites using Shopify and Liquid templates from brief to deployment, consistently optimizing page load performance to meet platform standards while redesigning interfaces based on Figma mockups, collaborating with design teams, resolving technical issues, and documenting troubleshooting procedures.",
  }
];

// Helper function to calculate duration from a period string (e.g. "Sep 2019 - Feb 2025" -> "5 yrs 6 mos")
function getDuration(periodStr: string): string {
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };

  const parts = periodStr.split(" - ");
  if (parts.length !== 2) return "";

  const [startStr, endStr] = parts;
  const [startMonthStr, startYearStr] = startStr.trim().split(" ");
  
  const startMonth = monthMap[startMonthStr];
  const startYear = parseInt(startYearStr, 10);
  
  if (startMonth === undefined || isNaN(startYear)) return "";

  const startDate = new Date(startYear, startMonth, 1);

  let endDate: Date;
  if (endStr.trim().toLowerCase() === "now" || endStr.trim().toLowerCase() === "present") {
    endDate = new Date();
  } else {
    const [endMonthStr, endYearStr] = endStr.trim().split(" ");
    const endMonth = monthMap[endMonthStr];
    const endYear = parseInt(endYearStr, 10);
    if (endMonth === undefined || isNaN(endYear)) return "";
    endDate = new Date(endYear, endMonth, 1);
  }

  // Calculate inclusive month difference
  const totalMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth()) + 1;

  if (totalMonths <= 0) return "";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yearText = years > 0 ? `${years} yr${years > 1 ? "s" : ""}` : "";
  const monthText = months > 0 ? `${months} mo${months > 1 ? "s" : ""}` : "";

  return [yearText, monthText].filter(Boolean).join(" ");
}

export default function Background() {
  return (
    <section
      id="background"
      className="min-h-screen w-full flex flex-col items-start justify-center bg-neutral-200 dark:bg-black transition-colors px-6 sm:px-8 py-12 sm:py-8"
      aria-labelledby="experience-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-start justify-center text-left max-w-4xl mx-auto w-full"
      >
        <div className="space-y-12 w-full pt-6 md:pt-auto">
          {/* Work Experience Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h3 className="font-gambarino text-lg sm:text-xl md:text-2xl font-semibold mb-6 text-orange-600 dark:text-orange-600 tracking-wide">
              WORK EXPERIENCE
            </h3>
            <div className="relative pl-6 sm:pl-8 border-l-2 border-orange-500/30 flex flex-col gap-10">
              {workExperiences.map((exp, index) => {
                const duration = getDuration(exp.period);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative flex flex-col gap-2 group"
                  >
                    {/* Animated Timeline Node */}
                    <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-orange-600 ring-4 ring-neutral-200 dark:ring-black group-hover:scale-125 transition-transform duration-300" />
                    
                    <div className="space-y-2">
                      <div className="text-base text-orange-600 dark:text-orange-600 font-mono font-medium">{exp.company}</div>
                      <div className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">{exp.role}</div>
                      <div className="flex flex-wrap items-center font-mono gap-2 text-xs text-orange-600/90 dark:text-orange-400 mb-1">
                        <span>{exp.period}</span>
                        {duration && (
                          <>
                            <span>•</span>
                            <span>{duration}</span>
                          </>
                        )}
                        {exp.city && (
                          <>
                            <span>•</span>
                            <span>{exp.city}</span>
                          </>
                        )}
                      </div>
                      <div className="text-neutral-800 font-mono dark:text-neutral-300 text-sm max-w-2xl leading-relaxed mt-2">
                        {exp.description}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Another Work Experience Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h3 className="font-gambarino text-lg sm:text-xl md:text-2xl font-semibold mb-6 text-orange-600 dark:text-orange-600 tracking-wide">
              ANOTHER WORK EXPERIENCE
            </h3>
            <div className="relative pl-6 sm:pl-8 border-l-2 border-orange-500/30 flex flex-col gap-10">
              {anotherWorkExperiences.map((exp, index) => {
                const duration = getDuration(exp.period);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative flex flex-col gap-2 group"
                  >
                    {/* Animated Timeline Node */}
                    <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-orange-600 ring-4 ring-neutral-200 dark:ring-black group-hover:scale-125 transition-transform duration-300" />

                    <div className="space-y-2">
                      <div className="text-base text-orange-600 dark:text-orange-600 font-mono font-medium">{exp.company}</div>
                      <div className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">{exp.role}</div>
                      <div className="flex flex-wrap items-center font-mono gap-2 text-xs text-orange-600/90 dark:text-orange-400 mb-1">
                        <span>{exp.period}</span>
                        {duration && (
                          <>
                            <span>•</span>
                            <span>{duration}</span>
                          </>
                        )}
                        {exp.city && (
                          <>
                            <span>•</span>
                            <span>{exp.city}</span>
                          </>
                        )}
                      </div>
                      <div className="text-neutral-800 font-mono dark:text-neutral-300 text-sm max-w-2xl leading-relaxed mt-2">
                        {exp.description}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}