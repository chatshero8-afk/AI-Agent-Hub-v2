import fs from 'fs';

let content = fs.readFileSync('src/components/templates/SalesDashboardTemplate.tsx', 'utf8');

if (!content.includes('Upload')) {
  content = content.replace('Filter } from', 'Filter, Upload } from');
}

const callTrackingSection = `
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-sm lg:col-span-12">
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="text-primary" size={20} /> 
                Call Logs Tracking
              </h3>
              <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 shrink-0">
                <Upload size={14} /> Upload Screenshot
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-xs text-slate-500 dark:text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-4 text-slate-900 dark:text-white font-bold">Client / Lead Name</th>
                    <th className="pb-4 text-slate-900 dark:text-white font-bold">Date & Time</th>
                    <th className="pb-4 text-slate-900 dark:text-white font-bold">Call Duration</th>
                    <th className="pb-4 text-slate-900 dark:text-white font-bold">Direction</th>
                    <th className="pb-4 text-slate-900 dark:text-white font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                     { name: 'Michael Tan', time: 'Today, 2:45 PM', duration: '00:14:32', dir: 'Outbound', status: 'Connected', statusColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800' },
                     { name: 'Sarah Lee', time: 'Today, 11:30 AM', duration: '00:05:10', dir: 'Inbound', status: 'Connected', statusColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800' },
                     { name: 'Pioneer Education', time: 'Yesterday, 4:15 PM', duration: '00:00:00', dir: 'Outbound', status: 'Missed', statusColor: 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800' },
                     { name: 'Alex Wong', time: 'Yesterday, 10:20 AM', duration: '00:22:45', dir: 'Inbound', status: 'Connected', statusColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800' },
                  ].map((row, i) => (
                     <tr key={i} className="border-b last:border-0 border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <td className="py-4 font-bold text-slate-900 dark:text-white text-sm">{row.name}</td>
                       <td className="py-4 text-slate-500 dark:text-slate-400 text-xs">{row.time}</td>
                       <td className="py-4 text-slate-900 dark:text-white text-xs font-mono font-bold flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> {row.duration}</td>
                       <td className="py-4 text-slate-500 dark:text-slate-400 text-xs">{row.dir}</td>
                       <td className="py-4 text-right">
                         <span className={\`px-2 py-1 text-[10px] uppercase tracking-widest font-bold border rounded-md \${row.statusColor}\`}>
                            {row.status}
                         </span>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <History size={18} />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-900 dark:text-white">Auto-Sync Active</p>
                   <p className="text-[10px] text-slate-500">Call logs are synced automatically from screenshots using AI OCR.</p>
                 </div>
               </div>
            </div>
          </div>
`;

// Insert the section before Manager AI
const target = '          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-sm lg:col-span-12">\n            <h3 className="text-base font-bold mb-8 text-slate-900 dark:text-white flex items-center gap-2">\n              <ActivitySquare className="text-primary dark:text-purple-400" size={20} /> \n              Manager AI: Post-Purchase Monitoring';

if (!content.includes('Call Logs Tracking')) {
  // Replace missing History, Clock in lucide-react first
  if (!content.includes('History,')) content = content.replace('Upload } from', 'Upload, History, Clock } from');
  
  content = content.replace(target, callTrackingSection + '\n' + target);
}

fs.writeFileSync('src/components/templates/SalesDashboardTemplate.tsx', content);
