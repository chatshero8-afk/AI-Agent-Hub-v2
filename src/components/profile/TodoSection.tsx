import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Kanban, 
  List as ListIcon, 
  Plus, 
  CheckCircle, 
  Circle, 
  Clock,
  Trash2,
  Edit2,
  X,
  Search
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { cn } from '../../lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';

type ViewMode = 'kanban' | 'calendar' | 'list';

type Task = {
  id: number;
  title: string;
  status: string;
  date: string;
  priority?: string;
  assigneeAvatar?: string;
  assignee?: string;
  assignedBy?: string;
};

const initialTasks: Task[] = [
  { id: 1, title: 'Upgrade AI Model', status: 'todo', date: '2026-05-10T14:00', priority: 'high', assigneeAvatar: '/images/1.svg', assignee: 'Alice', assignedBy: 'Bob' },
  { id: 2, title: 'Optimize Sales Agent', status: 'in-progress', date: '2026-05-08T09:30', priority: 'medium', assigneeAvatar: '/images/2.svg', assignee: 'Charlie' },
  { id: 3, title: 'Deploy New Layout', status: 'done', date: '2026-05-05T16:00', priority: 'high', assignedBy: 'Alice' },
  { id: 4, title: 'Review Chat Logs', status: 'todo', date: '2026-05-12T11:00', priority: 'low' },
];

export default function TodoSection() {
  const { profile } = useAuth();
  const [view, setView] = useState<ViewMode>('kanban');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
    });
    return () => unsub();
  }, []);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [modalFormData, setModalFormData] = useState({ 
    title: '', 
    status: 'todo', 
    date: new Date().toISOString().slice(0, 16), 
    priority: 'medium',
    assignedBy: '',
    assignee: ''
  });

  const openAddTask = (status: string) => {
    setEditingTask(null);
    setModalFormData({ 
      title: '', 
      status, 
      date: new Date().toISOString().slice(0, 16), 
      priority: 'medium',
      assignedBy: '',
      assignee: ''
    });
    setIsModalOpen(true);
  };

  const openEditTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditingTask(id);
      setModalFormData({ 
        title: task.title, 
        status: task.status, 
        date: task.date.length === 10 ? `${task.date}T12:00` : task.date, 
        priority: task.priority || 'medium',
        assignedBy: task.assignedBy || '',
        assignee: task.assignee || ''
      });
      setIsModalOpen(true);
    }
  };

  const saveTask = () => {
    if (!modalFormData.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    // Find the selected user to get their avatar
    const selectedAssignee = users.find(u => (u.name || u.email) === modalFormData.assignee);
    const taskDataToSave = {
      ...modalFormData,
      assigneeAvatar: selectedAssignee ? selectedAssignee.avatar : undefined
    };

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask ? { ...t, ...taskDataToSave } : t));
    } else {
      setTasks([...tasks, { id: Date.now(), ...taskDataToSave }]);
    }
    setIsModalOpen(false);
  };

  const moveTask = (id: number, newStatus: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <div className="mt-16 space-y-8 relative group">
      {/* The glowing background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-[3.5rem] blur-2xl pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px] pointer-events-none" />

      {/* The glassmorphism container */}
      <div className="relative bg-[#0f172a]/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 lg:p-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] z-10 w-full overflow-hidden">
        
        {/* Modal Overlay */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#121826] border border-white/10 rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    {editingTask ? 'Edit Task' : 'New Task'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Task Title</label>
                    <input 
                      type="text" 
                      value={modalFormData.title}
                      onChange={e => setModalFormData({...modalFormData, title: e.target.value})}
                      placeholder="e.g. Upgrade AI Model"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-colors"
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                      <select 
                        value={modalFormData.status}
                        onChange={e => setModalFormData({...modalFormData, status: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500/50 appearance-none"
                      >
                        <option className="bg-[#151c2b] text-white" value="todo">To Do</option>
                        <option className="bg-[#151c2b] text-white" value="in-progress">In Progress</option>
                        <option className="bg-[#151c2b] text-white" value="in-review">In Review</option>
                        <option className="bg-[#151c2b] text-white" value="done">Completed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Due Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={modalFormData.date}
                        onChange={e => setModalFormData({...modalFormData, date: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 outline-none focus:border-indigo-500/50"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assigned By (Optional)</label>
                      <select 
                        value={modalFormData.assignedBy}
                        onChange={e => setModalFormData({...modalFormData, assignedBy: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 outline-none focus:border-indigo-500/50 appearance-none"
                      >
                        <option className="bg-[#151c2b] text-white" value="">None</option>
                        {users.map(u => (
                          <option className="bg-[#151c2b] text-white" key={u.uid} value={u.name || u.email}>{u.name || u.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assigned To (Optional)</label>
                      <select 
                        value={modalFormData.assignee}
                        onChange={e => setModalFormData({...modalFormData, assignee: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 outline-none focus:border-indigo-500/50 appearance-none"
                      >
                        <option className="bg-[#151c2b] text-white" value="">None</option>
                        {users.map(u => (
                          <option className="bg-[#151c2b] text-white" key={u.uid} value={u.name || u.email}>{u.name || u.email}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
                    <div className="flex flex-wrap gap-2">
                      {['low', 'medium', 'high', 'urgent'].map(p => (
                        <button
                          key={p}
                          onClick={() => setModalFormData({...modalFormData, priority: p})}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                            modalFormData.priority === p 
                              ? p === 'urgent' ? "bg-red-500/20 border-red-500/50 text-red-400"
                              : p === 'high' ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                              : p === 'medium' ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                              : "bg-slate-500/20 border-slate-500/50 text-slate-300"
                              : "bg-transparent border-white/5 text-slate-500 hover:bg-white/5 hover:border-white/10"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button onClick={saveTask} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white uppercase tracking-widest bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-colors">
                    Save Task
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            <div>
              <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                MISSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">OBJECTIVES</span>
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Task Management System
              </p>
            </div>
          </div>
          
          {/* View Toggles */}
          <div className="flex items-center gap-1.5 p-1.5 bg-black/20 rounded-[1.2rem] border border-white/5 shadow-inner backdrop-blur-md">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                view === 'kanban' ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                view === 'list' ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <ListIcon size={14} /> List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                view === 'calendar' ? "bg-white/10 text-white shadow-sm border border-white/10" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <CalendarIcon size={14} /> Calendar
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[400px]">
          <AnimatePresence mode="wait">
            {view === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full items-start"
              >
                <KanbanColumn 
                  title="TO DO" 
                  status="todo" 
                  tasks={tasks} 
                  color="bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.5)]" 
                  onDrop={moveTask} 
                  onDelete={deleteTask}
                  onEdit={openEditTask}
                  onAdd={() => openAddTask('todo')}
                  defaultAvatar={profile?.avatar || "/images/8.svg"}
                />
                <KanbanColumn 
                  title="IN PROGRESS" 
                  status="in-progress" 
                  tasks={tasks} 
                  color="bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" 
                  onDrop={moveTask} 
                  onDelete={deleteTask}
                  onEdit={openEditTask}
                  onAdd={() => openAddTask('in-progress')}
                  defaultAvatar={profile?.avatar || "/images/8.svg"}
                />
                <KanbanColumn 
                  title="IN REVIEW" 
                  status="in-review" 
                  tasks={tasks} 
                  color="bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                  onDrop={moveTask} 
                  onDelete={deleteTask}
                  onEdit={openEditTask}
                  onAdd={() => openAddTask('in-review')}
                  defaultAvatar={profile?.avatar || "/images/8.svg"}
                />
                <KanbanColumn 
                  title="COMPLETED" 
                  status="done" 
                  tasks={tasks} 
                  color="bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                  onDrop={moveTask} 
                  onDelete={deleteTask}
                  onEdit={openEditTask}
                  onAdd={() => openAddTask('done')}
                  defaultAvatar={profile?.avatar || "/images/8.svg"}
                />
              </motion.div>
            )}

            {view === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-2 p-2"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-md">ALL TASKS</h3>
                  <button onClick={() => openAddTask('todo')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Plus size={14} /> New Task
                  </button>
                </div>
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-white/10 rounded-2xl bg-black/10">
                    No Tasks
                  </div>
                ) : (
                  tasks.map(task => {
                    const isAssignedToOther = task.assignee && profile && task.assignee !== profile.name && task.assignee !== profile.email;
                    return (
                    <div key={task.id} className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all group shadow-sm backdrop-blur-md relative overflow-hidden",
                      isAssignedToOther ? "border-transparent" : "bg-black/20 border border-white/5 hover:border-indigo-500/40 hover:bg-black/40"
                    )}>
                      {isAssignedToOther && (
                        <>
                          <div className="absolute inset-0 z-0 bg-[#0f172a] pointer-events-none" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#a855f7_360deg)] animate-[spin_3s_linear_infinite] z-0 pointer-events-none" />
                          <div className="absolute inset-[1px] bg-[#1e293b]/90 backdrop-blur-3xl rounded-[16px] z-0 pointer-events-none shadow-[inset_0_0_15px_rgba(168,85,247,0.2)]" />
                        </>
                      )}
                      
                      <div className="flex items-center gap-4 cursor-pointer relative z-10 flex-1" onClick={() => moveTask(task.id, task.status === 'done' ? 'todo' : 'done')}>
                        {task.status === 'done' ? (
                          <CheckCircle className="text-emerald-400 shadow-emerald-400/50 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" size={20} />
                        ) : task.status === 'in-progress' ? (
                          <Clock className="text-blue-400 shadow-blue-400/50 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] shrink-0" size={20} />
                        ) : task.status === 'in-review' ? (
                          <Search className="text-amber-400 shadow-amber-400/50 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] shrink-0" size={20} />
                        ) : (
                          <Circle className="text-slate-400 group-hover:text-slate-300 shrink-0" size={20} />
                        )}
                        <span className={cn(
                          "font-bold text-sm bg-transparent outline-none transition-colors hidden sm:block",
                          task.status === 'done' ? "text-slate-500 line-through" : "text-slate-200"
                        )}>
                          {task.title}
                        </span>
                        {task.priority && (
                          <span className={cn(
                            "px-2 py-0.5 rounded ml-2 text-[8px] font-black uppercase tracking-widest hidden md:block",
                            task.priority === 'urgent' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                            task.priority === 'high' ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                            task.priority === 'medium' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                            "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                          )}>
                            {task.priority}
                          </span>
                        )}
                        {task.assignee && (
                          <span className="hidden lg:block ml-2 text-xs text-slate-400 border border-white/10 px-2 py-0.5 rounded bg-white/5">
                            To: {task.assignee}
                          </span>
                        )}
                        {task.assignedBy && (
                          <span className="hidden xl:block ml-2 text-xs text-slate-400 border border-white/10 px-2 py-0.5 rounded bg-white/5">
                            By: {task.assignedBy}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-300 border border-white/5 hidden sm:block">
                          {task.status}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 hidden lg:block">{task.date.replace('T', ' ')}</span>
                        <button onClick={() => openEditTask(task.id)} className="p-2 text-slate-400 hover:text-indigo-400 transition-colors bg-white/5 rounded-lg opacity-100 lg:opacity-0 group-hover:opacity-100">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-white/5 rounded-lg opacity-100 lg:opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
                )}
              </motion.div>
            )}

            {view === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-2"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-md">MAY 2026</h3>
                  <button onClick={() => openAddTask('todo')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <Plus size={14} /> Add Event
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {/* Empty cells for padding */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-28 rounded-2xl bg-black/10 border border-white/5" />
                  ))}
                  {/* Calendar Days */}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
                    const dayTasks = tasks.filter(t => t.date.startsWith(dateStr));
                    
                    return (
                      <div key={day} className="h-28 p-2 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md hover:border-purple-500/40 hover:bg-black/30 transition-all relative group shadow-sm flex flex-col">
                        <span className="text-xs font-bold text-slate-300 w-6 h-6 flex items-center justify-center rounded-full bg-white/5">{day}</span>
                        <div className="mt-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar pr-1">
                          {dayTasks.map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => openEditTask(t.id)}
                              className={cn(
                                "text-[8px] font-bold px-1.5 py-1 rounded truncate border cursor-pointer hover:opacity-80 transition-opacity",
                                t.status === 'done' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                                t.status === 'in-progress' ? "bg-blue-500/10 text-blue-300 border-blue-500/20" :
                                "bg-slate-500/10 text-slate-300 border-slate-500/20"
                              )}
                            >
                              {t.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}

function KanbanColumn({ title, status, tasks, color, onDrop, onDelete, onEdit, onAdd, defaultAvatar }: { 
  title: string, 
  status: string, 
  tasks: any[], 
  color: string,
  onDrop: (id: number, status: string) => void,
  onDelete: (id: number) => void,
  onEdit: (id: number) => void,
  onAdd: () => void,
  defaultAvatar: string
}) {
  const { profile } = useAuth();
  const columnTasks = tasks.filter(t => t.status === status);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskIdString = e.dataTransfer.getData('taskId');
    if (taskIdString) {
      onDrop(parseInt(taskIdString, 10), status);
    }
  };

  return (
    <div 
      className="flex-1 w-full bg-black/20 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col p-5"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
          <h3 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm">{title}</h3>
        </div>
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-slate-300 border border-white/5">
          {columnTasks.length}
        </span>
      </div>
      
      <div className="flex-1 space-y-2 min-h-[300px]">
        {columnTasks.map(task => {
          const isAssignedToOther = task.assignee && profile && task.assignee !== profile.name && task.assignee !== profile.email;
          return (
          <div 
            key={task.id} 
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('taskId', task.id.toString());
            }}
            className={cn(
              "p-4 rounded-[1.2rem] cursor-grab active:cursor-grabbing transition-all group shadow-[0_4px_12px_rgba(0,0,0,0.2)] relative overflow-hidden",
              isAssignedToOther ? "border border-transparent" : "bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] border border-white/5 hover:border-white/10"
            )}
          >
            {isAssignedToOther && (
              <>
                <div className="absolute inset-0 z-0 bg-[#0f172a] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#a855f7_360deg)] animate-[spin_3s_linear_infinite] z-0 pointer-events-none" />
                <div className="absolute inset-[1px] bg-[#1e293b]/90 backdrop-blur-3xl rounded-[1.2rem] z-0 pointer-events-none shadow-[inset_0_0_15px_rgba(168,85,247,0.2)]" />
              </>
            )}
            <div className="flex items-start justify-between gap-3 relative z-10 w-full pr-10 pb-2">
              <span 
                className={cn(
                  "font-bold text-sm w-full bg-transparent outline-none overflow-hidden text-slate-200 focus:text-white pb-1 leading-tight drop-shadow-sm",
                  task.status === 'done' ? "text-slate-500 line-through" : ""
                )}
              >
                {task.title}
              </span>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex flex-col gap-1.5 opacity-60">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon size={12} /> {task.date.replace('T', ' ')}
                  </div>
                  {task.assignedBy && <div className="text-white/70">By: {task.assignedBy}</div>}
                  {task.assignee && <div className="text-white/70">To: {task.assignee}</div>}
                </div>
                {/* Profile Photo */}
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shadow-sm shrink-0">
                  <img src={task.assigneeAvatar || defaultAvatar} alt="Assignee" className="w-full h-full object-cover" />
                </div>
              </div>
              
              {task.priority && (
                <span className={cn(
                  "self-start px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                  task.priority === 'urgent' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                  task.priority === 'high' ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                  task.priority === 'medium' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                  "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                )}>
                  {task.priority || 'Medium'}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button onClick={() => onEdit(task.id)} className="p-1.5 rounded-lg bg-black/40 hover:bg-indigo-500/40 text-slate-300 hover:text-white transition-colors shadow-sm backdrop-blur-md">
                <Edit2 size={12} />
              </button>
              <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg bg-black/40 hover:bg-red-500/40 text-slate-300 hover:text-white transition-colors shadow-sm backdrop-blur-md">
                <Trash2 size={12} />
              </button>
            </div>
            
          </div>
          );
        })}
        {columnTasks.length === 0 && (
          <div className="h-full min-h-[100px] border-2 border-dashed border-white/10 rounded-[1.2rem] flex items-center justify-center text-xs font-bold text-slate-500 uppercase tracking-widest pointer-events-none bg-black/10">
            Drop Here
          </div>
        )}
      </div>

      <button onClick={onAdd} className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest transition-colors border border-white/5 hover:border-white/10 shadow-sm backdrop-blur-sm">
        <Plus size={14} /> Add Task
      </button>
    </div>
  );
}
