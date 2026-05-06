import fs from 'fs';
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const listStart = content.indexOf('{taskView === \'list\' && (');
const calEndStr = '{/* Task Day Modal */}';
const calEnd = content.indexOf(calEndStr);
if (listStart !== -1 && calEnd !== -1) {
    content = content.substring(0, listStart) + content.substring(calEnd);
}

const toggleStart = content.indexOf('<div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">');
const toggleEnd = content.indexOf('</div>\n        </div>\n\n        {/* Manager AI Assessment Banner */}');
if(toggleStart !== -1 && toggleEnd !== -1) {
  content = content.substring(0, toggleStart) + content.substring(toggleEnd);
}

fs.writeFileSync('src/pages/Profile.tsx', content);
console.log('Views updated');
