import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group relative z-10">
          <img src="/logo/image-removebg-preview.png" alt="Zexora Quvixo" className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium relative z-10">
          <Link to="/" className={`transition-colors relative group ${location.pathname === '/' ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}>
            Home
            {location.pathname === '/' && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accent"></span>}
            {location.pathname !== '/' && <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-300 ease-out"></span>}
          </Link>
          
          <Link to="/services" className={`transition-colors relative group ${location.pathname === '/services' ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}>
            Services
            {location.pathname === '/services' && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accent"></span>}
            {location.pathname !== '/services' && <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-300 ease-out"></span>}
          </Link>

          <Link to="/careers" className={`transition-colors relative group ${location.pathname === '/careers' ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}>
            Careers
            {location.pathname === '/careers' && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accent"></span>}
            {location.pathname !== '/careers' && <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-300 ease-out"></span>}
          </Link>
          <Link to="/contact" className={`transition-colors relative group ${location.pathname === '/contact' ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}>
            Who We Are
            {location.pathname === '/contact' && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accent"></span>}
            {location.pathname !== '/contact' && <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-300 ease-out"></span>}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4 relative z-10">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-foreground/5 transition-colors" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          


          <button 
            className="md:hidden p-2 rounded-full hover:bg-foreground/5 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden"
          >
            <nav className="flex flex-col items-center gap-6 py-8">
              <Link to="/" className={`text-lg font-medium transition-colors ${location.pathname === '/' ? 'text-accent' : 'text-foreground'}`}>Home</Link>
              <Link to="/services" className={`text-lg font-medium transition-colors ${location.pathname === '/services' ? 'text-accent' : 'text-foreground'}`}>Services</Link>
              <Link to="/careers" className={`text-lg font-medium transition-colors ${location.pathname === '/careers' ? 'text-accent' : 'text-foreground'}`}>Careers</Link>
              <Link to="/contact" className={`text-lg font-medium transition-colors ${location.pathname === '/contact' ? 'text-accent' : 'text-foreground'}`}>Who We Are</Link>

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
