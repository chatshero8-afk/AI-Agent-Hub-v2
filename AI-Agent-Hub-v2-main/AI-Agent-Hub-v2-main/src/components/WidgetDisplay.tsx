import React from 'react';
import { DepartmentWidget } from '../types';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const WidgetDisplay: React.FC<{ widget: DepartmentWidget }> = ({ widget }) => {
  const tryParseJSON = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const parsedData = tryParseJSON(widget.mockDataJson);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#151522] border border-slate-200 dark:border-white/5 shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{widget.title}</h4>
        {widget.department !== 'All' && (
          <span className="inline-block mt-1 text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase">{widget.department}</span>
        )}
      </div>

      <div className="w-full h-full pt-8 flex items-center justify-center">
        {widget.type === 'metric' && (
          <div className="text-center">
            <span className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">
              {parsedData?.value !== undefined ? parsedData.value : '---'}
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mt-1">
              {parsedData?.label || 'Data'}
            </span>
          </div>
        )}

        {widget.type === 'chart_line' && Array.isArray(parsedData) && (
          <div className="w-full h-24 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={parsedData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff', fontSize: '10px' }} />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {widget.type === 'chart_bar' && Array.isArray(parsedData) && (
          <div className="w-full h-24 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parsedData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#fff', fontSize: '10px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {(!parsedData || (widget.type !== 'metric' && !Array.isArray(parsedData))) && (
          <div className="text-[10px] text-slate-400 italic">Invalid Data Source</div>
        )}
      </div>
    </div>
  );
};

export default WidgetDisplay;
