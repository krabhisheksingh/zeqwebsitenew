import React from 'react';
import { motion } from 'framer-motion';

export default function Quote() {
  return (
    <section className="py-40 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-accent/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,80,255,0.1)_0%,transparent_60%)]"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-foreground/50">
            “The goal isn’t just to build faster systems, but to build systems that think, learn, and act with purpose.”
          </p>
        </motion.div>
      </div>
    </section>
  );
}
