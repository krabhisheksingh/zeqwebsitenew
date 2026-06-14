import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutTemplate, Cpu, Settings, Cloud, Database, ArrowRight, ChevronRight, Target, Phone, MessageSquare, FileText, Calendar } from 'lucide-react';

const digitalSolutions = [
  {
    id: "website-design",
    icon: LayoutTemplate,
    title: "Bespoke Website Designing",
    desc: "Where visual storytelling meets flawless UI/UX. We design high-end, immersive, and pixel-perfect layouts that capture attention instantly and reflect the true essence of your brand."
  },
  {
    id: "web-app-dev",
    icon: Cpu,
    title: "Next-Gen Web & App Development",
    desc: "Turning stunning concepts into robust reality. We write clean, lightning-fast code to develop responsive web platforms and mobile applications that perform flawlessly across all devices."
  },
  {
    id: "custom-software",
    icon: Settings,
    title: "Custom Software Development",
    desc: "From intelligent backends to complex data processing tools, we engineer high-performance software tailored to your specific operational scale."
  },
  {
    id: "cloud-api-integration",
    icon: Cloud,
    title: "Intelligent Cloud & API Integration",
    desc: "Connecting your ecosystem securely. We design seamless data pipelines and robust API structures optimized for speed, security, and reliability."
  },
  {
    id: "database-optimization",
    icon: Database,
    title: "Database Design & Optimization",
    desc: "Architecting secure, high-availability, and scalable data structures that keep your business moving forward without a hitch."
  }
];

const b2bServices = [
  {
    id: "lead-gen",
    icon: Target,
    title: "Lead Generation",
    desc: "Hyper-targeted B2B and B2C lead generation workflows. Data-driven profiling and multi-channel outreach campaigns to find warm prospects."
  },
  {
    id: "telemarketing",
    icon: Phone,
    title: "Telemarketing Services",
    desc: "Professional, high-volume outbound calling campaigns. Script-trained specialists executing targeted calling cadences."
  },
  {
    id: "email-chat",
    icon: MessageSquare,
    title: "Email & Chat Support",
    desc: "24/7 omnichannel assistance built for scale. Dedicated empathetic agents providing rapid, accurate support responses."
  },
  {
    id: "data-entry",
    icon: FileText,
    title: "Data Entry & Back Office",
    desc: "Streamlined data management and administrative processing. Accurate, rapid data entry freeing your core teams."
  },
  {
    id: "crm",
    icon: Database,
    title: "CRM Management",
    desc: "End-to-end database organization and workflow automation. Cleansing duplicate records and setting up revenue forecast dashboard."
  },
  {
    id: "appointments",
    icon: Calendar,
    title: "Appointment Setting",
    desc: "Qualified meetings scheduled directly on your sales team's calendar. Trained outreach specialists warming up target accounts."
  },
  {
    id: "intelligence-os",
    icon: Cpu,
    title: "Intelligence OS",
    desc: "The core operating system for enterprise data flows. A unified platform that connects APIs, cleanses data, and outputs actionable models."
  }
];

const processSteps = [
  {
    num: "01",
    title: "Imaginative Design",
    desc: "Crafting wireframes and user journeys that are visually striking, highly intuitive, and deeply engaging."
  },
  {
    num: "02",
    title: "Precision Engineering",
    desc: "Coding the frontend and backend with modern frameworks to ensure top-tier performance, speed, and SEO optimization."
  },
  {
    num: "03",
    title: "Seamless Deployment",
    desc: "Rigorous testing followed by a smooth launch, giving your business a powerful, production-ready digital asset."
  }
];

const partnerFeatures = [
  {
    title: "Visually Immersive",
    desc: "Gorgeous, modern layouts tailored to convert visitors into loyal clients."
  },
  {
    title: "Precision Engineering",
    desc: "Every line of code is written with intent, speed, and cross-platform optimization in mind."
  },
  {
    title: "Scalable Frameworks",
    desc: "We build robust foundations that grow with your user base, ensuring zero friction as you scale."
  }
];

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('digital-solutions');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activeServices = activeCategory === 'digital-solutions' ? digitalSolutions : b2bServices;

  return (
    <main className="pt-32 pb-24 min-h-screen relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[8%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-accent-violet/5 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full mb-28 text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-6 justify-center md:justify-start"
        >
          <div className="w-12 h-[1px] bg-accent"></div>
          <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Capabilities</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05] mb-8"
            >
              Architecting Tomorrow's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Digital Frontier</span>.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-foreground/70 font-light leading-relaxed max-w-2xl mb-12"
            >
              We blend high-fidelity aesthetics with cutting-edge engineering to build breathtaking websites, custom software, and high-converting B2B campaigns. Your vision, engineered to perfection.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
            >
              <a 
                href="#capabilities" 
                className="px-8 py-4 rounded-full bg-accent text-white font-medium text-lg hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(79,142,247,0.3)] hover:shadow-[0_0_30px_rgba(79,142,247,0.5)] flex items-center justify-center gap-2"
              >
                Explore Capabilities
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link 
                to="/contact" 
                className="px-8 py-4 rounded-full bg-background border border-border hover:border-foreground/45 text-foreground/80 font-medium text-lg transition-colors flex items-center justify-center"
              >
                Launch Your Project
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capabilities Selector & Lists */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full mb-32 scroll-mt-24" id="capabilities">
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-accent"></div>
            <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">What We Do</span>
            <div className="w-12 h-[1px] bg-accent"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">
            Crafting Seamless Business Systems
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-card border border-border rounded-full p-1.5 relative overflow-hidden shadow-lg">
            <button
              onClick={() => setActiveCategory('digital-solutions')}
              className={`px-8 py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 relative z-10 cursor-pointer ${
                activeCategory === 'digital-solutions' ? 'text-white' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {activeCategory === 'digital-solutions' && (
                <motion.div
                  layoutId="categoryActiveBg"
                  className="absolute inset-0 bg-accent rounded-full -z-10 shadow-[0_0_15px_rgba(79,142,247,0.3)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              Digital Solutions
            </button>
            <button
              onClick={() => setActiveCategory('b2b-services')}
              className={`px-8 py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 relative z-10 cursor-pointer ${
                activeCategory === 'b2b-services' ? 'text-white' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {activeCategory === 'b2b-services' && (
                <motion.div
                  layoutId="categoryActiveBg"
                  className="absolute inset-0 bg-accent rounded-full -z-10 shadow-[0_0_15px_rgba(79,142,247,0.3)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              B2B Services
            </button>
          </div>
        </div>

        {/* Capabilities Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]"
        >
          <AnimatePresence mode="popLayout">
            {activeServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div 
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel border border-border/20 rounded-[2rem] p-8 hover:border-accent/40 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(79,142,247,0.06)] flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-foreground/70 font-light text-sm leading-relaxed mb-8">
                      {service.desc}
                    </p>
                  </div>
                  
                  <Link 
                    to={`/services/${service.id}`}
                    className="flex items-center gap-2 text-accent text-sm font-semibold tracking-wider uppercase group/link cursor-pointer mt-auto"
                  >
                    Explore Blueprint
                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Our Process Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full mb-32">
        <div className="flex flex-col items-center mb-20 text-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-accent"></div>
            <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Our Process</span>
            <div className="w-12 h-[1px] bg-accent"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
            From Blueprint to Production
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line on Desktop */}
          <div className="hidden md:block absolute top-[50px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-accent/5 via-accent/30 to-accent-violet/5 z-0 pointer-events-none"></div>

          {processSteps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="flex flex-col items-center text-center relative z-10 group"
            >
              <div className="w-[100px] h-[100px] rounded-full bg-background border-2 border-border/40 flex items-center justify-center text-accent text-3xl font-mono mb-8 group-hover:border-accent group-hover:shadow-[0_0_30px_rgba(79,142,247,0.15)] transition-all duration-500">
                {step.num}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-foreground/70 font-light text-sm leading-relaxed max-w-xs">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Philosophy Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full mb-32">
        <div className="glass-panel border border-accent/20 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-violet/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-3xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-8 justify-center">
              <div className="w-12 h-[1px] bg-accent"></div>
              <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Our Philosophy</span>
              <div className="w-12 h-[1px] bg-accent"></div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">
              The Aesthetic of Clean Code
            </h2>

            <blockquote className="text-2xl md:text-3xl font-light italic text-foreground/80 mb-8 border-l-4 border-accent pl-6 md:pl-8 py-2 text-left max-w-2xl mx-auto">
              "Simplicity is the ultimate sophistication."
            </blockquote>

            <p className="text-lg text-foreground/70 font-light leading-relaxed max-w-2xl mx-auto">
              We believe that exceptional tech isn't just about complexity; it's about clarity. Our designs are elegant, our code is pristine, and our solutions are built to stand the test of time.
            </p>
          </div>
        </div>
      </section>

      {/* Why Partner With Us? Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-accent"></div>
            <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Why Choose Us</span>
            <div className="w-12 h-[1px] bg-accent"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
            Why Partner With Us?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {partnerFeatures.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="glass-panel border border-border/20 rounded-3xl p-8 hover:border-accent/30 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(79,142,247,0.05)]"
            >
              <h3 className="text-xl font-bold mb-4 border-b border-border/30 pb-4">{feat.title}</h3>
              <p className="text-foreground/75 font-light text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
