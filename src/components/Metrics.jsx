import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const Counter = ({ value, suffix = "", prefix = "", decimal = false }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseFloat(value);
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{decimal ? count.toFixed(1) : Math.floor(count)}{suffix}
    </span>
  );
};

export default function Metrics() {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent blur-[100px] -z-10"></div>
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">The Zexora Quvixo Advantage</h2>
          <p className="text-xl text-foreground/60 font-light">Delivering measurable outcomes across the intelligence ecosystem.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="glass-panel rounded-[2rem] p-8 md:p-16 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="text-center px-4 pt-8 md:pt-0">
              <div className="text-6xl md:text-7xl font-bold text-accent mb-4">
                <Counter value="3" suffix="x" />
              </div>
              <div className="text-2xl font-medium mb-2">Pipeline Growth</div>
              <div className="text-foreground/60">Scaling processes organically and autonomously.</div>
            </div>
            
            <div className="text-center px-4 pt-8 md:pt-0">
              <div className="text-6xl md:text-7xl font-bold text-accent mb-4">
                24/7
              </div>
              <div className="text-2xl font-medium mb-2">Always-On Execution</div>
              <div className="text-foreground/60">Continuous autonomous rapid support.</div>
            </div>
            
            <div className="text-center px-4 pt-8 md:pt-0">
              <div className="text-6xl md:text-7xl font-bold text-accent mb-4">
                <Counter value="99" suffix="%" />
              </div>
              <div className="text-2xl font-medium mb-2">Data Accuracy</div>
              <div className="text-foreground/60">Validated by multi-layer intelligence tiers.</div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <h3 className="text-2xl font-medium mb-8">Ready to transform your ecosystem?</h3>
            <button className="px-10 py-4 rounded-full bg-accent text-white font-semibold text-lg hover:bg-accent/90 transition-colors shadow-[0_0_30px_rgba(40,80,255,0.3)] hover:shadow-[0_0_40px_rgba(40,80,255,0.5)]">
              Start Your Project
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
