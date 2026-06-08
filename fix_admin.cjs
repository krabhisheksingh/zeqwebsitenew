const fs = require('fs');
let content = fs.readFileSync('src/hr/pages/AdminDashboard.jsx', 'utf8');

// Colors replacement
content = content.replace(/bg-\[#0B0C10\]/g, 'bg-background');
content = content.replace(/bg-\[#15161d\]/g, 'bg-foreground/5');
content = content.replace(/bg-\[#0f1016\]/g, 'bg-background');
content = content.replace(/bg-\[#0f1016\]\/95/g, 'bg-background/95');

content = content.replace(/from-charcoal\/20/g, 'from-foreground/10');
content = content.replace(/via-\[#0f1016\]\/40/g, 'via-background/40');
content = content.replace(/to-\[#0B0C10\]/g, 'to-background');

content = content.replace(/bg-black\/40/g, 'bg-foreground/5');
content = content.replace(/bg-black\/30/g, 'bg-foreground/5');
content = content.replace(/bg-black\/20/g, 'bg-foreground/5');
content = content.replace(/bg-black\/80/g, 'bg-foreground/80');
content = content.replace(/bg-black\/85/g, 'bg-foreground/80');
content = content.replace(/bg-black\/90/g, 'bg-background');
content = content.replace(/bg-black\/50/g, 'bg-foreground/50');
content = content.replace(/bg-black\/60/g, 'bg-foreground/60');
content = content.replace(/bg-black\/70/g, 'bg-foreground/70');

content = content.replace(/text-white/g, 'text-foreground');
content = content.replace(/border-white/g, 'border-foreground');
content = content.replace(/bg-white/g, 'bg-foreground');
content = content.replace(/from-white/g, 'from-foreground');
content = content.replace(/via-white/g, 'via-foreground');
content = content.replace(/to-white/g, 'to-foreground');
content = content.replace(/shadow-white/g, 'shadow-foreground');

// Toaster styles
content = content.replace(/background: 'rgba\\(10, 10, 15, 0\\.95\\)'/g, 'background: "var(--color-card)"');
content = content.replace(/background: 'rgba\\(15, 16, 22, 0\\.95\\)'/g, 'background: "var(--color-card)"');
content = content.replace(/color: '#fff'/g, 'color: "var(--color-foreground)"');
content = content.replace(/border: '1px solid rgba\\(255,255,255,0\\.08\\)'/g, 'border: "1px solid var(--color-border)"');

fs.writeFileSync('src/hr/pages/AdminDashboard.jsx', content);
console.log('Done AdminDashboard!');
