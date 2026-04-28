import React from 'react';
import { Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 bg-background mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex flex-col items-center md:items-start gap-4">
          <a href="#" className="flex items-center gap-2">
            <img src="/logo/image-removebg-preview.png" alt="Zexora Quvixo" className="h-14 w-auto object-contain" />
          </a>
          <p className="text-foreground/50 text-sm max-w-xs text-center md:text-left">
            Intelligence solutions tailored for international scale. Clarity in a complex world.
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          {['Home', 'Services', 'Careers', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-foreground/60 hover:text-accent transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex items-center gap-4">
            <a href="#" className="text-foreground/40 hover:text-accent transition-colors">
              <Globe size={20} />
            </a>
            <a href="#" className="text-foreground/40 hover:text-accent transition-colors">
              <Globe size={20} />
            </a>
            <a href="#" className="text-foreground/40 hover:text-accent transition-colors">
              <Globe size={20} />
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
