import React from 'react';
import { FaLinkedin, FaInstagram, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 bg-background mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo/image-removebg-preview.png" alt="Zexora Quvixo" className="h-14 w-auto object-contain" />
          </Link>
          <p className="text-foreground/50 text-sm max-w-xs text-center md:text-left">
            Intelligence solutions tailored for international scale. Clarity in a complex world.
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          {['Home', 'Services', 'Careers', 'Contact'].map((item) => (
            <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-foreground/60 hover:text-accent transition-colors">
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/company/zexora-global-services/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-background hover:shadow-[0_0_15px_rgba(var(--accent),0.6)] transition-all duration-300">
              <FaLinkedin size={18} />
            </a>
            <a href="https://www.instagram.com/zexoraquvixo/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-background hover:shadow-[0_0_15px_rgba(var(--accent),0.6)] transition-all duration-300">
              <FaInstagram size={18} />
            </a>
            <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-background hover:shadow-[0_0_15px_rgba(var(--accent),0.6)] transition-all duration-300">
              <FaTwitter size={18} />
            </a>
          </div>
          <p className="text-foreground/40 text-xs">
            © 2026 Zexora Quvixo. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
