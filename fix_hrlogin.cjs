const fs = require('fs');
let content = fs.readFileSync('src/hr/pages/HRLogin.jsx', 'utf8');

content = content.replace(/bg-black\/40/g, 'bg-foreground/5');
content = content.replace(/bg-black\/30/g, 'bg-foreground/5');
content = content.replace(/bg-black\/20/g, 'bg-foreground/5');
content = content.replace(/bg-black\/80/g, 'bg-foreground/80');

content = content.replace(/text-white/g, 'text-foreground');
content = content.replace(/bg-white\//g, 'bg-foreground/');
content = content.replace(/border-white\//g, 'border-foreground/');
content = content.replace(/shadow-white\//g, 'shadow-foreground/');

content = content.replace(/background: 'rgba\\(10,10,15,0\.8\\)'/g, 'background: "var(--color-card)"');
content = content.replace(/color: '#fff'/g, 'color: "var(--color-foreground)"');
content = content.replace(/border: '1px solid rgba\\(255,255,255,0\.1\\)'/g, 'border: "1px solid var(--color-border)"');

fs.writeFileSync('src/hr/pages/HRLogin.jsx', content);
console.log('Done HRLogin!');
