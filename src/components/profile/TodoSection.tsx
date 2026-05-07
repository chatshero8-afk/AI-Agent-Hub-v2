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
  Search,
  Undo2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { cn } from '../../lib/utils';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  where,
  or
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, TodoItem, NotificationType } from '../../types';

type ViewMode = 'kanban' | 'calendar' | 'list';

type Task = TodoItem;

const STATUS_ORDER = ['todo', 'in-progress', 'in-review', 'done'];

export default function TodoSection() {
  const { profile, user } = useAuth();
  const [view, setView] = useState<ViewMode>('kanban');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Mission Sync: Show tasks assigned to me OR created by me
    const q = query(
      collection(db, 'tasks'), 
      or(
        where('assigneeId', '==', user.uid),
        where('assignedById', '==', user.uid)
      ),
      orderBy('createdAt', 'desc')
    );
    
    // Note: Due to Firestore query constraints with row-level security, 
    // we fetch all but client-side filtering ensures we only see our business.
    // However, to satisfy 'allow list' rules, we should ideally use multiple queries 
    // or the 'or' operator if supported.
    
    const unsub = onSnapshot(q, (snapshot) => {
      const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      // Client-side filtering as a fallback/secondary layer
      const filtered = allTasks.filter(t => t.assigneeId === user.uid || t.assignedById === user.uid);
      setTasks(filtered);
      setLoading(false);
    }, (error) => {
      console.error("Task subscription error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [modalFormData, setModalFormData] = useState({ 
    title: '', 
    status: 'todo' as Task['status'], 
    date: new Date().toISOString().slice(0, 16), 
    priority: 'medium' as Task['priority'],
    assigneeId: ''
  });

  const openAddTask = (status: Task['status']) => {
    setEditingTaskId(null);
    setModalFormData({ 
      title: '', 
      status, 
      date: new Date().toISOString().slice(0, 16), 
      priority: 'medium',
      assigneeId: ''
    });
    setIsModalOpen(true);
  };

  const openEditTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditingTaskId(id);
      setModalFormData({ 
        title: task.title, 
        status: task.status, 
        date: task.date.length === 10 ? `${task.date}T12:00` : task.date, 
        priority: task.priority || 'medium',
        assigneeId: task.assigneeId || ''
      });
      setIsModalOpen(true);
    }
  };

  const sendNotification = async (targetUserId: string, title: string, message: string, type: NotificationType, taskId: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        senderId: user?.uid,
        senderName: profile?.name || user?.email,
        title,
        message,
        type,
        taskId,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };

  const saveTask = async () => {
    if (!modalFormData.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    const selectedAssignee = users.find(u => u.uid === modalFormData.assigneeId);
    const taskData: any = {
      title: modalFormData.title,
      status: modalFormData.status,
      date: modalFormData.date,
      priority: modalFormData.priority,
      assigneeId: modalFormData.assigneeId,
      assignee: selectedAssignee ? (selectedAssignee.name || selectedAssignee.email) : '',
      assigneeAvatar: selectedAssignee ? selectedAssignee.avatar : '',
      updatedAt: serverTimestamp()
    };

    if (editingTaskId) {
      const oldTask = tasks.find(t => t.id === editingTaskId);
      await updateDoc(doc(db, 'tasks', editingTaskId), taskData);
      
      if (oldTask && oldTask.assigneeId !== modalFormData.assigneeId && modalFormData.assigneeId) {
        await sendNotification(
          modalFormData.assigneeId,
          'New Mission Assigned',
          `You've been assigned to: ${modalFormData.title}`,
          'task_assigned',
          editingTaskId
        );
      }
    } else {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        assignedById: user?.uid,
        assignedBy: profile?.name || user?.email,
        createdAt: serverTimestamp()
      });
      
      if (modalFormData.assigneeId && modalFormData.assigneeId !== user?.uid) {
        await sendNotification(
          modalFormData.assigneeId,
          'New Mission Assigned',
          `You've been assigned to: ${modalFormData.title}`,
          'task_assigned',
          docRef.id
        );
      }
    }
    setIsModalOpen(false);
  };

  const moveTask = async (id: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === newStatus) return;

    const oldStatus = task.status;
    const oldIndex = STATUS_ORDER.indexOf(oldStatus);
    const newIndex = STATUS_ORDER.indexOf(newStatus);

    await updateDoc(doc(db, 'tasks', id), { 
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    // Notification logic
    const isUndo = newIndex < oldIndex;
    if (task.assignedById && task.assignedById !== user?.uid) {
      await sendNotification(
        task.assignedById,
        isUndo ? 'Mission Correction' : 'Mission Progress',
        `${profile?.name || 'Assignee'} changed "${task.title}" to ${newStatus}`,
        isUndo ? 'task_correction' : 'task_progress',
        id
      );
    }
  };

  const deleteTask = async (id: string) => {
    if (window.confirm('Terminate this objective?')) {
      await deleteDoc(doc(db, 'tasks', id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-8 relative group">
      {/* Glow effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-[3.5rem] blur-2xl pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/30 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px] pointer-events-none" />

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
                    {editingTaskId ? 'Edit Mission' : 'New Mission'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Objective Title</label>
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
                        onChange={e => setModalFormData({...modalFormData, status: e.target.value as Task['status']})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500/50 appearance-none"
                      >
                        <option className="bg-[#151c2b] text-white" value="todo">To Do</option>
                        <option className="bg-[#151c2b] text-white" value="in-progress">In Progress</option>
                        <option className="bg-[#151c2b] text-white" value="in-review">In Review</option>
                        <option className="bg-[#151c2b] text-white" value="done">Completed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deadline</label>
                      <input 
                        type="datetime-local" 
                        value={modalFormData.date}
                        onChange={e => setModalFormData({...modalFormData, date: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 outline-none focus:border-indigo-500/50"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assign Agent</label>
                    <select 
                      value={modalFormData.assigneeId}
                      onChange={e => setModalFormData({...modalFormData, assigneeId: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500/50 appearance-none"
                    >
                      <option className="bg-[#151c2b] text-white" value="">Personal Task (Myself)</option>
                      {users.filter(u => u.uid !== user?.uid).map(u => (
                        <option className="bg-[#151c2b] text-white" key={u.uid} value={u.uid}>{u.name || u.email}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
                    <div className="flex flex-wrap gap-2">
                      {['low', 'medium', 'high', 'urgent'].map(p => (
                        <button
                          key={p}
                          onClick={() => setModalFormData({...modalFormData, priority: p as Task['priority']})}
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
                    Save Mission
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
                Real-Time Auto-Sync Board
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
                  color="bg-slate-400" 
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
                  color="bg-blue-400" 
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
                  color="bg-amber-400" 
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
                  color="bg-emerald-400" 
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
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter drop-shadow-md">ALL MISSIONS</h3>
                  <button onClick={() => openAddTask('todo')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Plus size={14} /> New Mission
                  </button>
                </div>
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-white/10 rounded-2xl bg-black/10">
                    No Missions Assigned
                  </div>
                ) : (
                  tasks.map(task => {
                    const isForMe = task.assigneeId === user?.uid;
                    const isByMe = task.assignedById === user?.uid;

                    return (
                    <div key={task.id} className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all group shadow-sm backdrop-blur-md relative overflow-hidden",
                      isForMe || isByMe ? "bg-black/20 border border-white/5 hover:border-indigo-500/40 hover:bg-black/40" : "opacity-60 grayscale"
                    )}>
                      <div className="flex items-center gap-4 cursor-pointer relative z-10 flex-1" onClick={() => moveTask(task.id, task.status === 'done' ? 'todo' : 'done')}>
                        {task.status === 'done' ? (
                          <CheckCircle className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" size={20} />
                        ) : task.status === 'in-progress' ? (
                          <Clock className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] shrink-0" size={20} />
                        ) : task.status === 'in-review' ? (
                          <Search className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] shrink-0" size={20} />
                        ) : (
                          <Circle className="text-slate-400 group-hover:text-slate-300 shrink-0" size={20} />
                        )}
                        <span className={cn(
                          "font-bold text-sm transition-colors hidden sm:block",
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
                          <span className={cn(
                            "hidden lg:block ml-2 text-[10px] border px-2 py-0.5 rounded font-black uppercase tracking-widest",
                            isForMe ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400"
                          )}>
                            To: {isForMe ? 'YOU' : task.assignee}
                          </span>
                        )}
                        {task.assignedBy && (
                          <span className="hidden xl:block ml-2 text-[10px] text-slate-500 border border-white/10 px-2 py-0.5 rounded bg-white/5 uppercase font-bold">
                            By: {isByMe ? 'YOU' : task.assignedBy}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 ml-auto relative z-10">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300 border border-white/5 hidden sm:block">
                          {task.status}
                        </span>
                        <button onClick={() => openEditTask(task.id)} className="p-2 text-slate-400 hover:text-indigo-400 transition-colors bg-white/5 rounded-lg">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-white/5 rounded-lg">
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
                <div className="flex justify-between items-center mb-6 font-black italic uppercase text-xl">THE CALENDAR</div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 4; // Mock alignment
                    if (day <= 0 || day > 31) return <div key={i} className="h-24 bg-black/10 rounded-2xl border border-white/5" />;
                    const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
                    const dayTasks = tasks.filter(t => t.date.startsWith(dateStr));
                    return (
                      <div key={i} className="h-24 p-2 bg-black/20 border border-white/10 rounded-2xl hover:bg-black/30 transition-all overflow-hidden flex flex-col">
                        <span className="text-[10px] font-black text-slate-500">{day}</span>
                        <div className="flex-1 space-y-1 overflow-hidden mt-1">
                          {dayTasks.map(t => (
                            <div key={t.id} className="text-[7px] font-black uppercase tracking-tighter truncate px-1 bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/20">
                              {t.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
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
  status: Task['status'], 
  tasks: Task[], 
  color: string,
  onDrop: (id: string, status: Task['status']) => void,
  onDelete: (id: string) => void,
  onEdit: (id: string) => void,
  onAdd: () => void,
  defaultAvatar: string
}) {
  const { user } = useAuth();
  const columnTasks = tasks.filter(t => t.status === status);
  
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('taskId');
    if (id) onDrop(id, status);
  };

  return (
    <div 
      className="flex-1 min-h-[500px] bg-black/20 backdrop-blur-md rounded-[2.5rem] border border-white/10 flex flex-col p-6"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]", color)} />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white italic">{title}</h3>
        </div>
        <span className="text-[10px] font-black text-slate-500">{columnTasks.length}</span>
      </div>
      
      <div className="flex-1 space-y-3">
        {columnTasks.map(task => {
          const isByMe = task.assignedById === user?.uid;
          const isForMe = task.assigneeId === user?.uid;

          return (
            <motion.div 
              key={task.id} 
              layoutId={task.id}
              draggable
              onDragStart={(e: any) => e.dataTransfer.setData('taskId', task.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden",
                isForMe || isByMe ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10" : "opacity-40 grayscale"
              )}
            >
              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <span className={cn("text-xs font-bold text-slate-200 leading-tight", task.status === 'done' && "line-through opacity-50")}>
                    {task.title}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(task.id)} className="p-1 hover:text-indigo-400"><Edit2 size={12} /></button>
                    <button onClick={() => onDelete(task.id)} className="p-1 hover:text-rose-400"><Trash2 size={12} /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full border border-white/10 overflow-hidden bg-slate-800">
                      <img src={task.assigneeAvatar || defaultAvatar} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                    task.priority === 'urgent' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    task.priority === 'high' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  )}>
                    {task.priority || 'MED'}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button onClick={onAdd} className="mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-dashed border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
        <Plus size={14} /> Add Objective
      </button>
    </div>
  );
}
