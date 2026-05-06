import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Kanban, List as ListIcon, Plus, CheckCircle, Circle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

type ViewMode = 'kanban' | 'calendar' | 'list';

const initialTasks = [
  { id: 1, title: 'Upgrade AI Model', status: 'todo', date: '2026-05-10', priority: 'high' },
  { id: 2, title: 'Optimize Sales Agent', status: 'in-progress', date: '2026-05-08', priority: 'medium' },
  { id: 3, title: 'Deploy New Layout', status: 'done', date: '2026-05-05', priority: 'high' },
  { id: 4, title: 'Review Chat Logs', status: 'todo', date: '2026-05-12', priority: 'low' },
];

export default function TodoSection() {
  const [view, setView] = useState<ViewMode>('kanban');
  const [tasks, setTasks] = useState(initialTasks);

  return (
    <div className="mt-12 space-y-8">
      {/* Header and View Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            Mission <span className="text-indigo-400">Objectives</span>
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Task Management System
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-[#121826] rounded-2xl border border-white/5">
          <button
            onClick={() => setView('kanban')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              view === 'kanban' ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Kanban size={14} /> Kanban
          </button>
          <button
            onClick={() => setView('calendar')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              view === 'calendar' ? "bg-purple-500/20 text-purple-300" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <CalendarIcon size={14} /> Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              view === 'list' ? "bg-emerald-500/20 text-emerald-300" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <ListIcon size={14} /> List
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-[#121826]/80 p-8 pt-10 rounded-[3rem] border border-white/5 min-h-[400px]">
        <AnimatePresence mode="wait">
          {view === 'kanban' && (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <KanbanColumn title="To Do" status="todo" tasks={tasks} />
              <KanbanColumn title="In Progress" status="in-progress" tasks={tasks} />
              <KanbanColumn title="Done" status="done" tasks={tasks} />
            </motion.div>
          )}

          {view === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-20 text-slate-400"
            >
              <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl font-bold uppercase tracking-widest">Calendar View Setup</p>
              <p className="text-sm mt-2">The temporal matrix is initializing...</p>
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-[#1a212e] rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    {task.status === 'done' ? (
                      <CheckCircle className="text-emerald-400" size={20} />
                    ) : task.status === 'in-progress' ? (
                      <Clock className="text-amber-400" size={20} />
                    ) : (
                      <Circle className="text-slate-500" size={20} />
                    )}
                    <span className={cn(
                      "font-bold text-sm tracking-wide",
                      task.status === 'done' ? "text-slate-500 line-through" : "text-slate-200"
                    )}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{task.date}</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                      task.priority === 'high' ? "bg-red-500/20 text-red-400" :
                      task.priority === 'medium' ? "bg-amber-500/20 text-amber-400" :
                      "bg-blue-500/20 text-blue-400"
                    )}>{task.priority}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function KanbanColumn({ title, status, tasks }: { title: string, status: string, tasks: any[] }) {
  const columnTasks = tasks.filter(t => t.status === status);
  
  return (
    <div className="bg-[#1a212e]/50 rounded-[2rem] p-5 border border-white/5 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">{title}</h3>
        <span className="text-xs font-bold text-slate-500">{columnTasks.length}</span>
      </div>
      
      <div className="space-y-3 flex-1">
        {columnTasks.map(task => (
          <div key={task.id} className="p-4 bg-[#121826] rounded-xl border border-white/5 cursor-grab hover:border-indigo-500/30 transition-colors">
            <h4 className="font-bold text-sm text-slate-200 mb-3">{task.title}</h4>
            <div className="flex items-center justify-between mt-auto">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <CalendarIcon size={12} /> {task.date.substring(5)}
              </span>
              <span className={cn(
                "w-2 h-2 rounded-full",
                task.priority === 'high' ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" :
                task.priority === 'medium' ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" :
                "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"
              )} />
            </div>
          </div>
        ))}
        {columnTasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-xs font-bold text-slate-600 uppercase tracking-widest">
            No Tasks
          </div>
        )}
      </div>

      <button className="flex items-center justify-center gap-2 p-3 mt-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors">
        <Plus size={14} /> Add Task
      </button>
    </div>
  );
}
