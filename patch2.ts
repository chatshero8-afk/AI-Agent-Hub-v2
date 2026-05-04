import fs from 'fs';

let content = fs.readFileSync('src/components/templates/SalesDashboardTemplate.tsx', 'utf8');

const stateTarget = `  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-05-31');`;

const stateReplacement = `  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-05-31');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState('2025-05-01');
  const [tempEndDate, setTempEndDate] = useState('2025-05-31');
  const [activePreset, setActivePreset] = useState('Last 30 days');

  const handleOpenDatePicker = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowDatePicker(true);
  };

  const handleSaveDate = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowDatePicker(false);
  };

  const setPreset = (preset: string) => {
    setActivePreset(preset);
    const today = new Date();
    let start = '';
    let end = '';
    if (preset === 'Today') {
      start = end = today.toISOString().split('T')[0];
    } else if (preset === 'Yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      start = end = y.toISOString().split('T')[0];
    } else if (preset === 'Last 7 days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      start = past.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (preset === 'Last 14 days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 14);
      start = past.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (preset === 'Last 30 days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      start = past.toISOString().split('T')[0];
      end = today.toISOString().split('T')[0];
    } else if (preset === 'This month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (preset === 'Last month') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    } else if (preset === 'This year') {
      start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      end = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
    }
    
    if (start && end) {
      setTempStartDate(start);
      setTempEndDate(end);
    }
  };
`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
}

const uiTarget = `      {/* Top Header Filter Row */}
      <div className="flex justify-end items-center mb-8 gap-3 flex-wrap">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">Date Range:</label>
        <div className="flex items-center gap-2">
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
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 shadow-sm"
          />
          <span className="text-slate-400 font-bold text-xs">TO</span>
          <input 
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 shadow-sm"
          />
        </div>
        <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 ml-1">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>
        <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-lg flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-bold">
           <Filter size={16} /> Filter Applied
        </button>
      </div>`;

const uiReplacement = `      {/* Top Header Filter Row */}
      <div className="flex justify-end items-center mb-8 gap-3 flex-wrap relative">
        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">Date Range:</label>
        
        <button 
          onClick={handleOpenDatePicker}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {startDate} - {endDate}
        </button>

        <button 
          onClick={() => {
            const btn = document.getElementById('refresh-icon');
            if(btn) { btn.classList.add('animate-spin'); setTimeout(() => btn.classList.remove('animate-spin'), 1000); }
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-2 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 ml-1 transition-all"
        >
           <svg id="refresh-icon" className="w-5 h-5 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>

        {showDatePicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}></div>
            <div className="absolute top-12 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl w-[480px] p-0 flex flex-col md:flex-row overflow-hidden">
              
              {/* Presets Sidebar */}
              <div className="w-full md:w-36 bg-slate-50 dark:bg-slate-800/50 py-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-row md:flex-col overflow-x-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Recently Used</div>
                {['Today', 'Yesterday', 'Last 7 days', 'Last 14 days', 'Last 30 days', 'This month', 'Last month', 'This year'].map(preset => (
                  <button 
                    key={preset}
                    onClick={() => setPreset(preset)}
                    className={\`text-left px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors \${activePreset === preset ? 'bg-primary/10 text-primary dark:text-purple-400 font-bold border-l-2 border-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 border-l-2 border-transparent'}\`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Date Pickers */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Start Date</label>
                    <input 
                      type="date"
                      value={tempStartDate}
                      onChange={e => { setTempStartDate(e.target.value); setActivePreset('Custom'); }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">End Date</label>
                    <input 
                      type="date"
                      value={tempEndDate}
                      onChange={e => { setTempEndDate(e.target.value); setActivePreset('Custom'); }}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveDate}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                  >
                    Update
                  </button>
                </div>
              </div>
              
            </div>
          </>
        )}
      </div>`;

if (content.includes(uiTarget)) {
  content = content.replace(uiTarget, uiReplacement);
  fs.writeFileSync('src/components/templates/SalesDashboardTemplate.tsx', content);
  console.log("Patched successfully.");
} else {
  console.log("Could not find ui target");
}
