
const fs = require('fs');
let content = fs.readFileSync('src/hr/pages/EmployeeDashboard.jsx', 'utf8');

// Modals, Overlays, and Inputs
content = content.replace(/bg-black\/40/g, 'bg-foreground/5');
content = content.replace(/bg-black\/20/g, 'bg-foreground/5');
content = content.replace(/bg-black\/30/g, 'bg-foreground/5');
content = content.replace(/bg-black\/80/g, 'bg-foreground/80');
content = content.replace(/bg-black\/85/g, 'bg-foreground/80');
content = content.replace(/bg-black\/90/g, 'bg-background');

// Also any remaining text-white that might have been added later or missed
content = content.replace(/text-white/g, 'text-foreground');

fs.writeFileSync('src/hr/pages/EmployeeDashboard.jsx', content);
console.log('Done!');

