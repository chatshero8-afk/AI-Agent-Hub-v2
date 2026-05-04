import fs from 'fs';

let content = fs.readFileSync('src/components/templates/SalesDashboardTemplate.tsx', 'utf-8');

// Replace purples with primary colors and dark mode variants
content = content.replace(/text-purple-500/g, 'text-primary dark:text-purple-400');
content = content.replace(/text-purple-600/g, 'text-primary dark:text-purple-300');
content = content.replace(/bg-purple-500/g, 'bg-primary');
content = content.replace(/bg-purple-50/g, 'bg-primary/10');
content = content.replace(/border-purple-200/g, 'border-primary/20');
content = content.replace(/border-purple-500\/20/g, 'border-primary/20 dark:border-primary/30');
content = content.replace(/dark:bg-purple-500\/10/g, 'dark:bg-primary/20');

// Make text-slate-900 brighter in dark mode (usually dark:text-white but let's make sure)
content = content.replace(/text-slate-800 dark:text-white/g, 'text-slate-900 dark:text-white');
content = content.replace(/text-slate-600 dark:text-slate-400/g, 'text-slate-600 dark:text-slate-300');
content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-slate-500 dark:text-slate-300');
content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-slate-700 dark:text-slate-200');
content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400'); // the ones without dark mode

// Fix charts to use hex for primary
content = content.replace(/#a855f7/g, '#8b5cf6');
content = content.replace(/#c084fc/g, '#a78bfa');

fs.writeFileSync('src/components/templates/SalesDashboardTemplate.tsx', content);
