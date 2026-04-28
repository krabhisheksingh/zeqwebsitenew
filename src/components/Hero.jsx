import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Activity, Database, Shield } from 'lucide-react';

export default function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 250]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24" id="home">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0 bg-background overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] opacity-60 mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] opacity-60 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent,transparent)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <motion.div 
          style={{ y: y1, opacity }}
          className="flex flex-col items-start pt-10 lg:pt-0"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-12 h-[1px] bg-accent"></div>
            <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">
              Zexora Quvixo
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[0.95] mb-8"
          >
            <span className="block text-foreground">INTELLIGENCE</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-foreground/40">DRIVEN</span>
            <span className="block text-accent">SOLUTIONS.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-xl md:text-2xl text-foreground/60 font-light tracking-wide mb-12 max-w-lg border-l-2 border-border/50 pl-6"
          >
            Clarity in a complex world. We build systems that think, learn, and act with purpose.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
          >
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-foreground text-background font-medium text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-300 group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full border border-border/50 hover:bg-foreground/5 font-medium text-lg transition-colors">
              Book Consultation
            </button>
          </motion.div>
        </motion.div>

        {/* Right Content - Abstract Data Visual */}
        <motion.div 
          style={{ y: y2, opacity }}
          className="hidden lg:block relative h-[600px] w-full perspective-[1000px]"
        >
          <motion.div 
            initial={{ opacity: 0, rotateY: 20, rotateX: 10 }}
            animate={{ opacity: 1, rotateY: -10, rotateX: 5 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center preserve-3d"
          >
            {/* Main Glass Panel */}
            <div className="relative w-80 h-[28rem] rounded-3xl glass-panel border border-white/10 p-6 flex flex-col gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform translate-z-10 group hover:border-accent/40 transition-colors duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-50"></div>
              
              <div className="relative z-10 flex items-center justify-between border-b border-border/30 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <Activity className="w-5 h-5 text-accent animate-pulse" />
              </div>

              <div className="relative z-10 flex-1 flex flex-col gap-4">
                <div className="w-full h-24 rounded-xl bg-background/50 border border-border/30 flex items-end p-4 gap-2">
                  {[40, 70, 45, 90, 65, 100].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: 1 + (i * 0.1) }}
                      className="flex-1 bg-accent/40 rounded-t-sm"
                    ></motion.div>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 h-32 rounded-xl bg-background/50 border border-border/30 p-4 flex flex-col justify-between">
                    <Database className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="w-1/2 h-2 rounded bg-foreground/20 mb-2"></div>
                      <div className="w-3/4 h-2 rounded bg-foreground/10"></div>
                    </div>
                  </div>
                  <div className="flex-1 h-32 rounded-xl bg-background/50 border border-border/30 p-4 flex flex-col justify-between">
                    <Shield className="w-6 h-6 text-accent" />
                    <div>
                      <div className="w-2/3 h-2 rounded bg-foreground/20 mb-2"></div>
                      <div className="w-1/2 h-2 rounded bg-foreground/10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-12 top-24 w-40 h-auto glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl transform translate-z-20"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">99%</div>
                <div className="text-sm font-medium text-foreground/80">Accuracy</div>
              </div>
              <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
                <div className="w-[99%] h-full bg-accent"></div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-16 bottom-32 w-48 h-auto glass-panel p-4 rounded-2xl border border-white/10 shadow-2xl transform translate-z-30"
            >
              <div className="text-xs text-foreground/50 mb-1">Status</div>
              <div className="text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                System Active
              </div>
            </motion.div>

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
