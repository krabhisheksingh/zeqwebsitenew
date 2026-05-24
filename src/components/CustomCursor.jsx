import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasHoverSupport, setHasHoverSupport] = useState(false);

  useEffect(() => {
    // Detect if device supports hover
    const mediaQuery = window.matchMedia('(hover: hover)');
    setHasHoverSupport(mediaQuery.matches);

    // Listen for changes (e.g. connecting a mouse to an iPad or rotating)
    const handler = (e) => setHasHoverSupport(e.matches);
    mediaQuery.addEventListener('change', handler);

    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      mediaQuery.removeEventListener('change', handler);
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  if (!hasHoverSupport) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-accent/50 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.15 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-accent pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />
    </>
  );
}
