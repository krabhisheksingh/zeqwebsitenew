import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, BarChart2, DollarSign, Globe2, Sparkles, Users } from 'lucide-react';

const features = [
  {
    icon: <Rocket className="w-12 h-12" />,
    title: "Scalable",
    desc: "Built to grow with your business demands invisibly and effortlessly."
  },
  {
    icon: <BarChart2 className="w-12 h-12" />,
    title: "Data-driven",
    desc: "Every decision, process, and output is backed by deep data analysis."
  },
  {
    icon: <DollarSign className="w-12 h-12" />,
    title: "Cost-efficient",
    desc: "Optimized pipelines ensure maximum ROI with minimal administrative overhead."
  },
  {
    icon: <Globe2 className="w-12 h-12" />,
    title: "Global Reach",
    desc: "Intelligence solutions tailored for international scale."
  },
  {
    icon: <Sparkles className="w-12 h-12" />,
    title: "Future-Proofing",
    desc: "Systems designed to adapt to the next decade of digital evolution."
  },
  {
    icon: <Users className="w-12 h-12" />,
    title: "Human-Centric AI",
    desc: "We prioritize solutions that augment human potential rather than replace it."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-32" id="why-us">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-24 md:w-1/2">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Why Choose Us</h2>
          <p className="text-xl text-foreground/60 font-light">The foundation of our intelligence ecosystem. In a rapidly evolving global market, staying ahead requires more than just technology; it requires an intelligence partner who understands the nuance of global enterprise.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {features.map((feature, idx) => {
            let spanClass = "col-span-1";
            if (idx === 0) spanClass = "md:col-span-2";
            if (idx === 3) spanClass = "md:col-span-2";
            if (idx === 4) spanClass = "md:col-span-2";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative group rounded-[2rem] bg-card border border-border/50 hover:border-accent/50 transition-colors overflow-hidden p-8 flex flex-col justify-between ${spanClass}`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 text-accent bg-background w-16 h-16 rounded-2xl flex items-center justify-center border border-border/50 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  {React.cloneElement(feature.icon, { className: "w-8 h-8" })}
                </div>

                <div className="relative z-10 mt-auto">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-foreground/60 font-light leading-relaxed max-w-md">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
