import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Phone, MessageSquare, FileText, Database, Calendar, Cpu, ArrowRight } from 'lucide-react';

const services = [
  {
    id: "lead-gen",
    icon: Target,
    title: "Lead Generation",
    sub: "Hyper-targeted B2B and B2C lead generation workflows.",
    problem: "Low conversion rates and wasted marketing spend on unqualified audiences.",
    solution: "Data-driven profiling and multi-channel outreach campaigns to find warm prospects.",
    result: "3x increase in qualified pipeline and dramatically lower CAC."
  },
  {
    id: "telemarketing",
    icon: Phone,
    title: "Telemarketing Services",
    sub: "Professional, high-volume outbound calling campaigns.",
    problem: "Inconsistent outbound sales efforts and low engagement from cold prospects.",
    solution: "Script-trained specialists executing targeted calling cadences.",
    result: "Increased brand awareness and a steady pipeline of engaged leads."
  },
  {
    id: "email-chat",
    icon: MessageSquare,
    title: "Email & Chat Support",
    sub: "24/7 omnichannel assistance built for scale.",
    problem: "High churn rates due to slow response times and inconsistent service quality.",
    solution: "Dedicated omnichannel agents providing rapid, empathetic, and accurate responses.",
    result: "CSAT scores above 95% and first-response times reduced to under 5 minutes."
  },
  {
    id: "data-entry",
    icon: FileText,
    title: "Data Entry & Back Office",
    sub: "Streamlined data management and administrative processing.",
    problem: "Core teams bogged down by repetitive tasks, slowing strategic growth.",
    solution: "Accurate, rapid data processing and comprehensive back-office management.",
    result: "50% increase in core team productivity and zero transaction backlogs."
  },
  {
    id: "crm",
    icon: Database,
    title: "CRM Management",
    sub: "End-to-end database organization and workflow automation.",
    problem: "Messy, outdated CRM data leading to lost sales opportunities.",
    solution: "Detailed data cleansing, pipeline organization, and health monitoring.",
    result: "Optimized sales pipelines with 100% data accuracy and clear forecasting."
  },
  {
    id: "appointments",
    icon: Calendar,
    title: "Appointment Setting",
    sub: "Qualified meetings scheduled directly on your sales team's calendar.",
    problem: "Sales teams spending too much time prospecting instead of closing.",
    solution: "Highly-trained outreach specialists warming up target accounts.",
    result: "Consistent flow of warm meetings, increasing close rates by up to 40%."
  },
  {
    id: "intelligence-os",
    icon: Cpu,
    title: "Intelligence OS",
    sub: "The core operating system for enterprise data flows. (Future Vision)",
    problem: "Siloed data preventing holistic business insights and automation.",
    solution: "A unified platform that connects APIs, cleanses data, and outputs actionable models.",
    result: "Seamless operational efficiency and true predictive capabilities."
  }
];

export default function ServicesSection() {
  const [activeService, setActiveService] = useState(0);

  return (
    <section className="py-32 relative bg-foreground/[0.02]" id="services">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="mb-20 text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-8">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              <div className="w-12 h-[1px] bg-accent"></div>
              <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Capabilities</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Services</span>
            </h2>
          </div>
          <p className="text-xl text-foreground/60 font-light max-w-md text-center md:text-left">
            Intelligence-driven solutions for modern enterprises.
          </p>
        </div>

        {/* Desktop Split Layout */}
        <div className="hidden lg:flex gap-16 items-start relative">
          
          {/* Left Navigation */}
          <div className="w-1/3 flex flex-col gap-2 relative border-l border-border/50">
            {services.map((service, idx) => (
              <button
                key={service.id}
                onClick={() => setActiveService(idx)}
                className={`relative px-8 py-6 text-left transition-all duration-300 group ${
                  activeService === idx ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
              >
                {/* Active Indicator Line */}
                {activeService === idx && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-accent"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${activeService === idx ? 'text-accent' : 'text-foreground group-hover:text-foreground/80'}`}>
                  {service.title}
                </h3>
                {activeService === idx && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-sm text-foreground/60 font-light mt-2"
                  >
                    {service.sub}
                  </motion.p>
                )}
              </button>
            ))}
          </div>

          {/* Right Content Area (Sticky) */}
          <div className="w-2/3 sticky top-40 h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full glass-panel border border-border/30 rounded-[2rem] p-12 relative overflow-hidden flex flex-col"
              >
                {/* Background Decor */}
                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent border border-accent/20 flex items-center justify-center shadow-[0_0_30px_rgba(40,80,255,0.15)]">
                    {React.createElement(services[activeService].icon, { className: "w-8 h-8 text-accent" })}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold">{services[activeService].title}</h3>
                    <p className="text-accent text-sm font-medium tracking-wide mt-1">{services[activeService].sub}</p>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 gap-6 flex-1">
                  
                  {/* Problem */}
                  <div className="bg-background/50 rounded-2xl p-6 border border-border/50">
                    <div className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                      The Problem
                    </div>
                    <p className="text-foreground/80 font-light leading-relaxed">
                      {services[activeService].problem}
                    </p>
                  </div>

                  {/* Solution */}
                  <div className="bg-background/50 rounded-2xl p-6 border border-border/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                        Our Solution
                      </div>
                      <p className="text-foreground/90 font-medium leading-relaxed">
                        {services[activeService].solution}
                      </p>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
                    <div className="text-xs font-bold uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                      The Result
                    </div>
                    <p className="text-lg text-accent font-semibold">
                      {services[activeService].result}
                    </p>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Layout (Accordion) */}
        <div className="lg:hidden flex flex-col gap-6">
          {services.map((service, idx) => (
            <div key={service.id} className="glass-panel border border-border/30 rounded-3xl p-6">
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setActiveService(activeService === idx ? -1 : idx)}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  {React.createElement(service.icon, { className: "w-6 h-6 text-accent" })}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{service.title}</h3>
                </div>
                <div className={`transform transition-transform duration-300 ${activeService === idx ? 'rotate-90' : ''}`}>
                  <ArrowRight className="w-5 h-5 text-foreground/40" />
                </div>
              </div>

              <AnimatePresence>
                {activeService === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 flex flex-col gap-4">
                      <p className="text-sm text-accent mb-2">{service.sub}</p>
                      
                      <div className="border-l-2 border-red-500/30 pl-4 py-1">
                        <span className="text-[10px] uppercase tracking-wider text-foreground/40 block mb-1">Problem</span>
                        <p className="text-sm text-foreground/70">{service.problem}</p>
                      </div>
                      
                      <div className="border-l-2 border-blue-500/30 pl-4 py-1">
                        <span className="text-[10px] uppercase tracking-wider text-foreground/40 block mb-1">Solution</span>
                        <p className="text-sm text-foreground/90">{service.solution}</p>
                      </div>
                      
                      <div className="border-l-2 border-accent pl-4 py-1 bg-accent/5 rounded-r-lg pr-4">
                        <span className="text-[10px] uppercase tracking-wider text-accent block mb-1">Result</span>
                        <p className="text-sm font-semibold text-accent">{service.result}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
