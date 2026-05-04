import fs from 'fs';

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const target1 = `<div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                <ChevronRight className="rotate-180 text-slate-500" size={16} />
             </div>`;

if (content.includes(target1)) {
  content = content.replace(target1, '');
}

const target2 = `<div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
              <Sparkles size={14} className="text-slate-400" />
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
              <User size={14} className="text-slate-400" />
            </div>
          </div>`;

if (content.includes(target2)) {
  content = content.replace(target2, '');
}

fs.writeFileSync('src/pages/Profile.tsx', content);
console.log('Patched Profile.tsx');
