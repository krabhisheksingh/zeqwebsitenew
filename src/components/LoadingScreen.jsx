import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[10000] bg-background flex flex-col items-center justify-center"
    >
      <div className="relative flex flex-col items-center justify-center gap-12">
        {/* Large Logo with pulse effect */}
        <motion.div
          animate={{ scale: [0.98, 1.02, 0.98], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-accent/20 blur-[80px] rounded-full scale-150"></div>
          <img 
            src="/logo/image-removebg-preview.png" 
            alt="Zexora Quvixo" 
            className="relative z-10 w-48 md:w-64 h-auto object-contain drop-shadow-[0_0_15px_rgba(40,80,255,0.3)]" 
          />
        </motion.div>

        {/* Elegant Loading Bar */}
        <div className="w-48 h-[2px] bg-foreground/10 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute top-0 left-0 h-full bg-accent shadow-[0_0_10px_rgba(40,80,255,0.8)]"
          />
        </div>
      </div>
    </motion.div>
  );
}
