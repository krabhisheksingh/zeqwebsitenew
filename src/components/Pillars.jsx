import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Lightbulb, Scale, X } from 'lucide-react';

const pillars = [
  {
    icon: Database,
    title: "Data Excellence",
    desc: "We help organizations capture, clean, and utilize their most valuable asset information. Our pipelines ensure data integrity from ingestion to analysis.",
    fullContent: {
      subtitle: "Architecting the foundation of your intelligence.",
      sections: [
        {
          heading: "Robust Infrastructure",
          text: "In the modern digital landscape, data is the new currency. However, raw data is inherently chaotic. We design and implement robust data architectures that seamlessly ingest massive streams of unstructured information, transforming it into highly structured, accessible, and secure data lakes."
        },
        {
          heading: "Integrity & Cleanliness",
          text: "Our proprietary ETL pipelines are fortified with automated validation protocols. This ensures every byte of data is rigorously cleaned and verified. Bad data leads to bad decisions; our mission is to guarantee 99.9% data accuracy across all your operational endpoints."
        },
        {
          heading: "Scalable Storage",
          text: "As your organization grows, so does your data footprint. We leverage cutting-edge cloud-native storage solutions that scale elastically. Whether dealing with terabytes or petabytes, our architectures maintain sub-millisecond retrieval times without exponentially increasing overhead."
        }
      ]
    }
  },
  {
    icon: Lightbulb,
    title: "Actionable Insights",
    desc: "We transform complex datasets into clear narratives that drive high-stakes decision-making. No noise, just precise intelligence tailored for action.",
    fullContent: {
      subtitle: "Illuminating the path forward with predictive intelligence.",
      sections: [
        {
          heading: "Advanced Analytics",
          text: "We go beyond traditional descriptive analytics. Our intelligence platforms utilize advanced statistical modeling to uncover hidden correlations and deep trends within your data ecosystems. We eliminate the noise, bringing the most critical variables to the forefront of your strategic dashboard."
        },
        {
          heading: "Predictive Modeling",
          text: "Understanding the past is not enough. We deploy state-of-the-art machine learning algorithms designed to forecast future market shifts, customer behaviors, and operational bottlenecks. Our prescriptive models offer algorithmically vetted recommendations for action."
        },
        {
          heading: "Intuitive Visualizations",
          text: "Data is only as valuable as it is understandable. Our UX/UI experts craft bespoke visualization dashboards that translate complex mathematical models into intuitive, interactive, and beautiful graphical narratives. This empowers leaders to make high-stakes decisions rapidly."
        }
      ]
    }
  },
  {
    icon: Scale,
    title: "Ethical Execution",
    desc: "We ensure that every system we build adheres to the highest standards of transparency and ethics. Responsibility is built into the architecture.",
    fullContent: {
      subtitle: "Building trust through transparency and accountability.",
      sections: [
        {
          heading: "Algorithmic Fairness",
          text: "As artificial intelligence increasingly drives operational logic, the risk of embedded bias grows. We conduct rigorous fairness auditing on all our machine learning models. We proactively identify and mitigate discriminatory patterns, ensuring equitable outcomes."
        },
        {
          heading: "Privacy by Design",
          text: "Privacy is not an afterthought—it is a core architectural requirement. We implement advanced cryptographic techniques, including end-to-end encryption, differential privacy, and secure multi-party computation. Your sensitive corporate data remains completely protected."
        },
        {
          heading: "Transparent Systems",
          text: "The era of 'black box' algorithms is over. We build explainable AI (XAI) systems that allow stakeholders to trace exactly how an algorithm arrived at a specific conclusion. This traceability is essential for regulatory compliance and maintaining unwavering trust."
        }
      ]
    }
  }
];

export default function Pillars() {
  const [activePillar, setActivePillar] = useState(null);

  React.useEffect(() => {
    if (activePillar !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [activePillar]);

  return (
    <section className="py-32 relative" id="pillars">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-20 relative z-10">
        
        {/* Sticky Left Column */}
        <div className="lg:w-1/3">
          <div className="sticky top-40">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-accent"></div>
                <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Core Pillars</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 leading-tight">
                The Three <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/40">Pillars of</span> <br />
                Zexora
              </h2>
              <p className="text-xl text-foreground/60 font-light border-l border-accent/30 pl-4">
                The architectural foundation of our intelligence ecosystem, built to scale effortlessly.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Scrolling Right Column */}
        <div className="lg:w-2/3 flex flex-col gap-10">
          {pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="group relative rounded-[2rem] glass-panel border border-border/30 p-10 md:p-14 overflow-hidden shadow-2xl hover:border-accent/40 transition-colors duration-500"
              >
                {/* Glowing Top Edge */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Number Indicator */}
                <div className="absolute top-10 right-10 text-8xl font-black text-foreground/[0.03] select-none group-hover:text-accent/[0.05] transition-colors duration-500">
                  0{idx + 1}
                </div>

                {/* Floating Abstract Icon Background */}
                <div className="absolute -bottom-10 -right-10 text-foreground/[0.02] transform -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700 pointer-events-none">
                  <IconComponent className="w-64 h-64" />
                </div>

                <div className="relative z-10 flex flex-col items-start h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(40,80,255,0.1)] group-hover:shadow-[0_0_30px_rgba(40,80,255,0.2)] transition-shadow duration-500">
                    <IconComponent className="w-8 h-8 text-accent" />
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold mb-6 group-hover:text-accent transition-colors duration-300">
                    {pillar.title}
                  </h3>
                  
                  <p className="text-xl text-foreground/70 font-light leading-relaxed max-w-lg">
                    {pillar.desc}
                  </p>
                  
                  <button 
                    onClick={() => setActivePillar(idx)}
                    className="mt-8 flex items-center gap-2 text-accent text-sm font-semibold tracking-widest uppercase opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 cursor-pointer"
                  >
                    Learn more <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* 3D Modal Overlay */}
      <AnimatePresence>
        {activePillar !== null && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-12 [perspective:2000px]">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setActivePillar(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, rotateX: 20, rotateY: -20, scale: 0.8, z: -500 }}
              animate={{ opacity: 1, rotateX: 0, rotateY: 0, scale: 1, z: 0 }}
              exit={{ opacity: 0, rotateX: -20, rotateY: 20, scale: 0.8, z: -500 }}
              transition={{ type: "spring", damping: 25, stiffness: 100 }}
              className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto glass-panel border border-border/50 rounded-[3rem] p-8 md:p-16 shadow-[0_0_100px_rgba(40,80,255,0.2)] [transform-style:preserve-3d]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActivePillar(null)}
                className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 rounded-full bg-border/20 flex items-center justify-center hover:bg-accent hover:text-white transition-colors z-50"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col gap-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-accent/20 border border-accent/30 flex items-center justify-center shadow-[0_0_30px_rgba(40,80,255,0.3)] shrink-0">
                    {React.createElement(pillars[activePillar].icon, { className: "w-10 h-10 text-accent" })}
                  </div>
                  <div>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">{pillars[activePillar].title}</h2>
                    <p className="text-xl text-accent font-light">{pillars[activePillar].fullContent.subtitle}</p>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-border/50"></div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {pillars[activePillar].fullContent.sections.map((section, sIdx) => (
                    <motion.div 
                      key={sIdx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (sIdx * 0.1) }}
                      className="bg-background/50 rounded-3xl p-8 border border-border/30 hover:border-accent/40 transition-colors shadow-lg"
                    >
                      <h3 className="text-2xl font-semibold mb-4 text-white">{section.heading}</h3>
                      <p className="text-foreground/70 leading-relaxed font-light text-lg">{section.text}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Footer Description */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-accent/5 via-accent/20 to-accent/5 rounded-3xl p-8 md:p-12 border border-accent/20 text-center mt-4 shadow-[0_0_50px_rgba(40,80,255,0.1)]"
                >
                  <p className="text-2xl font-medium text-white/90 italic">
                    "We don't just build technology, we architect the future of {pillars[activePillar].title.toLowerCase()}."
                  </p>
                </motion.div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
