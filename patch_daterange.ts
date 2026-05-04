import fs from 'fs';

let content = fs.readFileSync('src/components/templates/SalesDashboardTemplate.tsx', 'utf8');

const target = `        <div className="flex items-center gap-2">
          <input 
            type="date"
            value={startDate}`;

const replacement = `        <div className="flex items-center gap-2">
          <select 
            onChange={(e) => {
              const val = e.target.value;
              const today = new Date();
              let start = '';
              let end = '';
              if (val === 'this_month') {
                start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
              } else if (val === 'last_month') {
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
                end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
              } else if (val === 'this_year') {
                start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                end = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
              } else if (val === 'last_30_days') {
                const pastDate = new Date(today);
                pastDate.setDate(pastDate.getDate() - 30);
                start = pastDate.toISOString().split('T')[0];
                end = new Date().toISOString().split('T')[0];
              }
              if (start && end) {
                setStartDate(start);
                setEndDate(end);
              }
            }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 shadow-sm mr-2 appearance-none cursor-pointer"
          >
            <option value="custom">Custom Range</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_year">This Year</option>
          </select>
          <input 
            type="date"
            value={startDate}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/templates/SalesDashboardTemplate.tsx', content);
  console.log("Success");
} else {
  console.log("Target not found");
}
