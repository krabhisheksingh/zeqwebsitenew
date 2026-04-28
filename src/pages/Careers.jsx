import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Bell } from 'lucide-react';

export default function Careers() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-32 pb-24 min-h-screen flex items-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full text-center flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="w-12 h-[1px] bg-accent"></div>
          <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Join the Ecosystem</span>
          <div className="w-12 h-[1px] bg-accent"></div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-16 leading-tight"
        >
          Careers at <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Zexora Quvixo</span>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-2xl glass-panel border border-border/30 rounded-[2rem] p-12 md:p-16 relative overflow-hidden shadow-2xl flex flex-col items-center text-center group hover:border-accent/30 transition-colors duration-500"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(40,80,255,0.1)]">
            <Briefcase className="w-10 h-10 text-accent" />
          </div>

          <h2 className="text-3xl font-bold mb-4">No Current Openings</h2>
          <p className="text-foreground/60 font-light text-lg mb-8 max-w-md">
            Our team is currently at full capacity. However, we are always on the lookout for exceptional talent in data and intelligence.
          </p>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-background/50 border border-border/50 text-sm font-medium text-foreground/80">
            <Bell className="w-4 h-4 text-accent" />
            Check back later for updates
          </div>
        </motion.div>

      </div>
    </main>
  );
}
