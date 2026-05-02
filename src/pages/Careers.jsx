import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';

const openings = [
  {
    id: 1,
    title: "Business Development Intern",
    department: "Sales & Strategy",
    type: "Internship",
    location: "Remote",
  },
  {
    id: 2,
    title: "Full Stack Developer Intern",
    department: "Engineering",
    type: "Internship",
    location: "Remote",
  }
];

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

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-6 text-center justify-center w-full"
        >
          <div className="w-12 h-[1px] bg-accent"></div>
          <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase">Join the Ecosystem</span>
          <div className="w-12 h-[1px] bg-accent"></div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-16 leading-tight text-center"
        >
          Careers at <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Zexora Quvixo</span>
        </motion.h1>

        <div className="w-full max-w-4xl grid gap-6">
          {openings.map((job, index) => (
            <motion.div 
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="glass-panel border border-border/30 rounded-2xl p-8 relative overflow-hidden group hover:border-accent/30 transition-all duration-300 flex flex-col md:flex-row justify-between md:items-center gap-6 shadow-xl"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-accent tracking-wider uppercase bg-accent/10 px-3 py-1 rounded-full">{job.department}</span>
                  <span className="text-xs font-medium text-foreground/60 border border-border/50 px-3 py-1 rounded-full">{job.type}</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors duration-300 mb-2">{job.title}</h3>
                <div className="flex items-center gap-2 text-foreground/50 text-sm">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
              </div>

              <button className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-foreground text-background font-medium hover:bg-accent hover:text-background transition-all duration-300 shrink-0 self-start md:self-auto group/btn">
                Apply Now
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
