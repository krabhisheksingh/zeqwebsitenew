import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section className="py-32 relative" id="about">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              About Zexora <br/>Quvixo Group
            </h2>
            <div className="w-20 h-1 bg-accent mb-8"></div>
            <h3 className="text-2xl md:text-3xl font-medium text-accent mb-6">
              Our Vision: Intelligence with Integrity
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="text-lg md:text-xl text-foreground/70 font-light leading-relaxed border-l border-accent/20 pl-8"
          >
            <p>
              At Zexora Quvixo Group, we believe that the future of industry isn't just built on data—it's built on the ethical application of that data. We are an intelligence-led global enterprise dedicated to bridging the gap between raw information and actionable wisdom. Our mission is to empower companies to move beyond basic automation toward smarter systems that are as responsible as they are powerful.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
