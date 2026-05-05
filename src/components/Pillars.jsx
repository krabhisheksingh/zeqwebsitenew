import React from 'react';
import { motion } from 'framer-motion';
import { Database, Lightbulb, Scale } from 'lucide-react';

const pillars = [
  {
    icon: Database,
    title: "Data Excellence",
    desc: "We help organizations capture, clean, and utilize their most valuable asset information. Our pipelines ensure data integrity from ingestion to analysis."
  },
  {
    icon: Lightbulb,
    title: "Actionable Insights",
    desc: "We transform complex datasets into clear narratives that drive high-stakes decision-making. No noise, just precise intelligence tailored for action."
  },
  {
    icon: Scale,
    title: "Ethical Execution",
    desc: "We ensure that every system we build adheres to the highest standards of transparency and ethics. Responsibility is built into the architecture."
  }
];

export default function Pillars() {
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
                  
                  <div className="mt-8 flex items-center gap-2 text-accent text-sm font-semibold tracking-widest uppercase opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    Learn more <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
