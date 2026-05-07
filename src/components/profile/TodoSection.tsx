import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  RefreshCw,
  User
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
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

type ViewMode = 'kanban' | 'calendar';

type Task = TodoItem;

const STATUS_ORDER = ['todo', 'in-progress', 'in-review', 'done'];

export default function TodoSection() {
  const { profile, user } = useAuth();
  const [view, setView] = useState<ViewMode>('kanban');
  const [viewFilter, setViewFilter] = useState<'all' | 'me' | 'others'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const notificationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const lastCheckRef = useRef<number>(0);

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
        where('assigneeIds', 'array-contains', user.uid),
        where('assignedById', '==', user.uid)
      ),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(allTasks);
      setLoading(false);
    }, (error) => {
      console.error("Task subscription error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Automated Mission Monitor: Due date alerts
  useEffect(() => {
    if (!user || tasks.length === 0) return;

    const checkDeadlines = () => {
      const now = new Date();
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);
      
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      tasks.forEach(task => {
        if (task.status === 'done' || !task.date) return;
        
        const deadline = new Date(task.date);
        const taskId = task.id;
        
        // 1. Due Today Alert (Daily briefing)
        const isToday = deadline >= now && deadline <= endOfToday;
        const todayKey = `notified_today_${taskId}`;
        if (isToday && !localStorage.getItem(todayKey)) {
          sendNotification(
            user.uid,
            'Mission Due Today',
            `Objective "${task.title}" is scheduled for completion today.`,
            'info',
            taskId
          );
          localStorage.setItem(todayKey, 'true');
        }

        // 2. Final Hour Warning
        const isCritical = deadline > now && deadline < oneHourFromNow;
        const criticalKey = `notified_critical_${taskId}`;
        if (isCritical && !localStorage.getItem(criticalKey)) {
          sendNotification(
            user.uid,
            'CRITICAL WARNING',
            `Mission "${task.title}" expires in less than 1 hour!`,
            'urgent' as any,
            taskId
          );
          localStorage.setItem(criticalKey, 'true');
        }
      });
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, tasks.length]);

  const filteredTasks = tasks.filter(t => {
    if (viewFilter === 'me') return t.assigneeIds?.includes(user?.uid || '');
    if (viewFilter === 'others') return t.assignedById === user?.uid && !(t.assigneeIds?.length === 1 && t.assigneeIds.includes(user?.uid || ''));
    return true;
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [modalFormData, setModalFormData] = useState({ 
    title: '', 
    description: '',
    status: 'todo' as Task['status'], 
    date: new Date().toISOString().slice(0, 16), 
    priority: 'medium' as Task['priority'],
    assigneeIds: [] as string[],
    isRecurring: false,
    frequency: 'daily' as Task['frequency'],
    repeatEveryYear: false,
    recurringDays: [] as string[]
  });

  const openAddTask = (status: Task['status']) => {
    setEditingTaskId(null);
    setModalFormData({ 
      title: '', 
      description: '',
      status, 
      date: new Date().toISOString().slice(0, 16), 
      priority: 'medium',
      assigneeIds: [user?.uid || ''],
      isRecurring: false,
      frequency: 'daily',
      repeatEveryYear: false,
      recurringDays: []
    });
    setIsModalOpen(true);
  };

  const openEditTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditingTaskId(id);
      setModalFormData({ 
        title: task.title, 
        description: task.description || '',
        status: task.status, 
        date: task.date.length === 10 ? `${task.date}T12:00` : task.date, 
        priority: task.priority || 'medium',
        assigneeIds: task.assigneeIds || [],
        isRecurring: task.isRecurring || false,
        frequency: task.frequency || 'daily',
        repeatEveryYear: task.repeatEveryYear || false,
        recurringDays: task.recurringDays || []
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
    
    const selectedAssignees = users.filter(u => modalFormData.assigneeIds.includes(u.uid));
    const taskData: any = {
      title: modalFormData.title,
      description: modalFormData.description,
      status: modalFormData.status,
      date: modalFormData.date,
      priority: modalFormData.priority,
      assigneeIds: modalFormData.assigneeIds,
      assignees: selectedAssignees.map(u => u.name || u.email),
      assigneeAvatars: selectedAssignees.map(u => u.avatar),
      isRecurring: modalFormData.isRecurring,
      frequency: modalFormData.isRecurring ? modalFormData.frequency : null,
      repeatEveryYear: modalFormData.isRecurring ? modalFormData.repeatEveryYear : null,
      recurringDays: modalFormData.isRecurring ? modalFormData.recurringDays : [],
      updatedAt: serverTimestamp()
    };

    if (editingTaskId) {
      const oldTask = tasks.find(t => t.id === editingTaskId);
      await updateDoc(doc(db, 'tasks', editingTaskId), taskData);
      
      const newAssignees = modalFormData.assigneeIds.filter(id => !oldTask?.assigneeIds?.includes(id));
      for (const id of newAssignees) {
        if (id !== user?.uid) {
          await sendNotification(
            id,
            'New Mission Assigned',
            `You've been assigned to: ${modalFormData.title}`,
            'task_assigned',
            editingTaskId
          );
        }
      }
    } else {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        assignedById: user?.uid,
        assignedBy: profile?.name || user?.email,
        createdAt: serverTimestamp()
      });
      
      for (const id of modalFormData.assigneeIds) {
        if (id !== user?.uid) {
          await sendNotification(
            id,
            'New Mission Assigned',
            `You've been assigned to: ${modalFormData.title}`,
            'task_assigned',
            docRef.id
          );
        }
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
    
    // 1. Optimistic Update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      if (task.assignedById !== user?.uid && !profile?.isAdmin) {
        // Limited movement check if needed, but usually moving status is fine
      }

      await updateDoc(doc(db, 'tasks', id), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // 2. Throttled/Debounced Notification Logic
      // Clear existing timeout for this task if any
      if (notificationTimeouts.current[id]) {
        clearTimeout(notificationTimeouts.current[id]);
      }

      // Schedule new notification
      notificationTimeouts.current[id] = setTimeout(async () => {
        const isUndo = newIndex < oldIndex;
        
        // Notify Assigner of Progress
        if (task.assignedById && task.assignedById !== user?.uid) {
           let title = isUndo ? 'Mission Correction' : 'Mission Progress';
           let type = isUndo ? 'task_correction' : 'task_progress';
           
           if (newStatus === 'in-review') {
             title = 'Objective Ready for Review';
             type = 'info';
           }

          await sendNotification(
            task.assignedById,
            title,
            `${profile?.name || 'Assignee'} set objective "${task.title}" to ${newStatus}`,
            type as any,
            id
          );
        }
        delete notificationTimeouts.current[id];
      }, 3000);

    } catch (err) {
      console.error("Move Task error:", err);
      // Rollback on failure
      setTasks(previousTasks);
      alert("Failed to sync mission status. Reverting...");
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
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                  {editingTaskId && tasks.find(t => t.id === editingTaskId)?.assignedById !== user?.uid && !profile?.isAdmin && (
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-start gap-3 mb-4">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>You are an assigned agent. Mission details are read-only; only the status can be updated.</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Objective Title</label>
                    <input 
                      type="text" 
                      value={modalFormData.title}
                      onChange={e => setModalFormData({...modalFormData, title: e.target.value})}
                      disabled={editingTaskId !== null && tasks.find(t => t.id === editingTaskId)?.assignedById !== user?.uid && !profile?.isAdmin}
                      placeholder="e.g. Upgrade AI Model"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mission Description</label>
                    <textarea 
                      value={modalFormData.description}
                      onChange={e => setModalFormData({...modalFormData, description: e.target.value})}
                      disabled={editingTaskId !== null && tasks.find(t => t.id === editingTaskId)?.assignedById !== user?.uid && !profile?.isAdmin}
                      placeholder="Identify objectives and sub-tasks..."
                      rows={3}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-black/40 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={editingTaskId !== null && tasks.find(t => t.id === editingTaskId)?.assignedById !== user?.uid && !profile?.isAdmin}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 outline-none focus:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Event Type</label>
                    <div className="flex gap-2">
                       <button
                        onClick={() => setModalFormData({...modalFormData, isRecurring: false})}
                        disabled={editingTaskId !== null && tasks.find(t => t.id === editingTaskId)?.assignedById !== user?.uid && !profile?.isAdmin}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                          !modalFormData.isRecurring 
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400"
                            : "bg-transparent border-white/5 text-slate-500 hover:bg-white/5",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        Once
                      </button>
                      <button
                        onClick={() => setModalFormData({...modalFormData, isRecurring: true})}
                        disabled={editingTaskId !== null && tasks.find(t => t.id === editingTaskId)?.assignedById !== user?.uid && !profile?.isAdmin}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all",
                          modalFormData.isRecurring 
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                            : "bg-transparent border-white/5 text-slate-500 hover:bg-white/5",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        Recurring
                      </button>
                    </div>
                  </div>

                  {modalFormData.isRecurring && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-2 border-t border-white/5"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Frequency</label>
                          <select 
                            value={modalFormData.frequency}
                            onChange={e => setModalFormData({...modalFormData, frequency: e.target.value as any})}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none appearance-none"
                          >
                            <option className="bg-[#151c2b] text-white" value="daily">Daily</option>
                            <option className="bg-[#151c2b] text-white" value="weekly">Weekly</option>
                            <option className="bg-[#151c2b] text-white" value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <input 
                            type="checkbox" 
                            id="repeatYear"
                            checked={modalFormData.repeatEveryYear}
                            onChange={e => setModalFormData({...modalFormData, repeatEveryYear: e.target.checked})}
                            className="w-4 h-4 rounded bg-black/20 border-white/10 text-indigo-500"
                          />
                          <label htmlFor="repeatYear" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer">Every Year</label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Training Days (Mon-Sun)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <button
                              key={day}
                              onClick={() => {
                                const days = modalFormData.recurringDays.includes(day)
                                  ? modalFormData.recurringDays.filter(d => d !== day)
                                  : [...modalFormData.recurringDays, day];
                                setModalFormData({...modalFormData, recurringDays: days});
                              }}
                              className={cn(
                                "w-9 h-9 rounded-lg text-[10px] font-black uppercase border transition-all",
                                modalFormData.recurringDays.includes(day)
                                  ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                  : "bg-black/20 border-white/5 text-slate-500 hover:border-white/10"
                              )}
                            >
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Assign Agents</label>
                    {profile?.role?.startsWith('Intern') ? (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-start gap-3">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>Interns are restricted from assigning missions. You can only assign tasks to yourself.</span>
                      </div>
                    ) : (
                      <div className={cn(
                        "grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-black/20 border border-white/10 rounded-xl custom-scrollbar",
                        editingTaskId !== null && tasks.find(t => t.id === editingTaskId)?.assignedById !== user?.uid && !profile?.isAdmin && "opacity-50 pointer-events-none"
                      )}>
                        {users.map(u => (
                          <label 
                            key={u.uid} 
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer",
                              modalFormData.assigneeIds.includes(u.uid)
                                ? "bg-indigo-500/20 border-indigo-500/40"
                                : "bg-transparent border-white/5 hover:bg-white/5"
                            )}
                          >
                            <input 
                              type="checkbox"
                              className="hidden"
                              checked={modalFormData.assigneeIds.includes(u.uid)}
                              onChange={(e) => {
                                let newIds;
                                if (e.target.checked) {
                                  newIds = [...modalFormData.assigneeIds, u.uid];
                                } else {
                                  newIds = modalFormData.assigneeIds.filter(id => id !== u.uid);
                                }
                                setModalFormData({...modalFormData, assigneeIds: newIds});
                              }}
                            />
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 border border-white/10">
                              <img src={u.avatar || "/images/8.svg"} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 truncate">
                              {u.uid === user?.uid ? 'Me' : (u.name || u.email?.split('@')[0])}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
                    <div className={cn(
                      "flex flex-wrap gap-2",
                      editingTaskId !== null && tasks.find(t => t.id === editingTaskId)?.assignedById !== user?.uid && !profile?.isAdmin && "opacity-50 pointer-events-none"
                    )}>
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10">
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

          <div className="flex flex-wrap items-center gap-4">
            {/* Mission Perspective Filter */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
              <button 
                onClick={() => setViewFilter('all')}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  viewFilter === 'all' ? "bg-white/10 text-white shadow-lg border border-white/5" : "text-slate-500 hover:text-slate-400"
                )}
              >
                All
              </button>
              <button 
                onClick={() => setViewFilter('me')}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  viewFilter === 'me' ? "bg-white/10 text-white shadow-lg border border-white/5" : "text-slate-500 hover:text-slate-400"
                )}
              >
                Me
              </button>
              <button 
                onClick={() => setViewFilter('others')}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  viewFilter === 'others' ? "bg-white/10 text-white shadow-lg border border-white/5" : "text-slate-500 hover:text-slate-400"
                )}
              >
                Others
                <div className={cn("w-1.5 h-1.5 rounded-full bg-indigo-500", viewFilter === 'others' && "animate-pulse")} />
              </button>
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
                  tasks={filteredTasks} 
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
                  tasks={filteredTasks} 
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
                  tasks={filteredTasks} 
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
                  tasks={filteredTasks} 
                  color="bg-emerald-400" 
                  onDrop={moveTask} 
                  onDelete={deleteTask}
                  onEdit={openEditTask}
                  onAdd={() => openAddTask('done')}
                  defaultAvatar={profile?.avatar || "/images/8.svg"}
                />
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
                <div className="flex justify-between items-center mb-6 font-black italic uppercase text-xl text-white">THE CALENDAR PROFILE</div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 4; // Mock alignment
                    if (day <= 0 || day > 31) return <div key={i} className="h-32 bg-black/10 rounded-2xl border border-white/5 opacity-30" />;
                    const dateStr = `2026-05-${day.toString().padStart(2, '0')}`;
                    const dayTasks = filteredTasks.filter(t => t.date.startsWith(dateStr));
                    return (
                      <div key={i} className="h-32 p-2 bg-black/20 border border-white/10 rounded-2xl hover:bg-black/40 transition-all overflow-hidden flex flex-col group/day">
                        <div className="flex justify-between items-center">
                          <span className={cn(
                            "text-[10px] font-black",
                            dayTasks.length > 0 ? "text-indigo-400" : "text-slate-600"
                          )}>{day}</span>
                          {dayTasks.length > 0 && <div className="w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,1)]" />}
                        </div>
                        <div className="flex-1 space-y-1 overflow-y-auto mt-2 custom-scrollbar">
                          {dayTasks.map(t => (
                            <div 
                              key={t.id} 
                              onClick={() => {
                                setEditingTaskId(t.id);
                                openEditTask(t.id);
                              }}
                              className={cn(
                                "text-[8px] font-black uppercase tracking-tighter truncate px-1.5 py-0.5 rounded border transition-all cursor-pointer",
                                t.priority === 'urgent' ? "bg-rose-500/20 text-rose-400 border-rose-500/20 hover:bg-rose-500/30" :
                                t.priority === 'high' ? "bg-orange-500/20 text-orange-400 border-orange-500/20 hover:bg-orange-500/30" :
                                "bg-indigo-500/20 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/30",
                                t.status === 'done' && "opacity-40 grayscale line-through"
                              )}
                            >
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
          border-radius: 10px;
        }

        .glow-line-orange::before, .glow-line-white::before, .glow-line-purple::before {
          content: '';
          position: absolute;
          inset: -1px;
          padding: 1.5px;
          border-radius: inherit;
          background: conic-gradient(from var(--border-angle), transparent 70%, var(--border-color) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: border-rotate 3s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        .glow-line-orange::after, .glow-line-white::after, .glow-line-purple::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: inherit;
          background: var(--border-color);
          filter: blur(12px);
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }

        .glow-line-orange { --border-color: #fb923c; }
        .glow-line-white { --border-color: #ffffff; }
        .glow-line-purple { --border-color: #a855f7; }

        @property --border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes border-rotate {
          to { --border-angle: 360deg; }
        }

        /* Fallback for browsers that don't support @property */
        @supports not (background: paint(something)) {
          .glow-line-orange::before, .glow-line-white::before, .glow-line-purple::before {
             background: linear-gradient(90deg, transparent, var(--border-color), transparent);
             animation: move-gradient 2s linear infinite;
             inset: 0;
             padding: 1px;
             mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
             -webkit-mask-composite: destination-out;
             mask-composite: exclude;
          }
        }

        @keyframes move-gradient {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
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
  const { user, profile } = useAuth();
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
          const isForMe = task.assigneeIds?.includes(user?.uid || '');
          const isAssignedToOthersByMe = isByMe && task.assigneeIds && (task.assigneeIds.length > 1 || !task.assigneeIds.includes(user?.uid || ''));
          const isAssignedToMeByOthers = isForMe && !isByMe;

          return (
            <motion.div 
              key={task.id}
              layoutId={task.id}
              draggable
              onDragStart={(e: any) => e.dataTransfer.setData('taskId', task.id)}
              className={cn(
                "p-2.5 px-3.5 rounded-2xl border transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden",
                isAssignedToMeByOthers ? "glow-line-orange border-orange-500/40 bg-gradient-to-br from-orange-500/5 to-transparent" : 
                isAssignedToOthersByMe ? "glow-line-purple border-purple-500/40 bg-gradient-to-br from-purple-500/5 to-transparent" : "border-white/10",
                "bg-[#0f172a]/70 backdrop-blur-xl hover:bg-[#0f172a]/90 hover:border-white/20 shadow-xl",
                !(isForMe || isByMe) && "opacity-40 grayscale"
              )}
            >
              <div className="flex flex-col gap-1.5 relative z-10">
                {/* Top Row */}
                <div className="flex items-start justify-between gap-1.5">
                  <span className={cn(
                    "text-sm font-black text-white leading-tight tracking-tight truncate", 
                    task.status === 'done' && "opacity-50 line-through"
                  )}>
                    {task.title.toLowerCase()}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(isByMe || profile?.isAdmin) ? (
                        <>
                          <button onClick={() => onEdit(task.id)} className="p-1 hover:text-indigo-400 transition-colors"><Edit2 size={12} /></button>
                          <button onClick={() => onDelete(task.id)} className="p-1 hover:text-rose-400 transition-colors"><Trash2 size={12} /></button>
                        </>
                      ) : (
                        <button onClick={() => onEdit(task.id)} className="p-1 text-slate-500 hover:text-indigo-400 transition-colors"><Clock size={12} /></button>
                      )}
                    </div>
                    <Clock size={12} className="text-slate-500/40" />
                  </div>
                </div>

                {/* Info Pills Section */}
                <div className="flex flex-wrap gap-1.5">
                  {task.date && (
                    <div className="bg-black/40 border border-white/5 rounded-lg py-0.5 px-2 flex items-center gap-1.5">
                      <Clock size={10} className="text-indigo-400" />
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(task.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(task.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Row - Conditional */}
                <div className={cn(
                  "flex items-center justify-between pt-1.5 border-t border-white/5",
                  !isAssignedToMeByOthers && "mt-0.5"
                )}>
                  {!isAssignedToMeByOthers ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full border border-white/10 overflow-hidden bg-slate-800">
                          <img 
                            src={(task.assigneeAvatars && task.assigneeAvatars.length > 0) ? task.assigneeAvatars[0] : defaultAvatar} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <span className="text-[9px] font-black text-white uppercase tracking-widest truncate max-w-[80px]">
                          {((isByMe ? (profile?.name || user?.email?.split('@')[0] || 'Me') : (task.assignedBy || 'Unknown').split(' ')[0]) || '').toUpperCase()}
                        </span>
                      </div>

                      <div className={cn(
                        "px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest",
                        task.priority === 'urgent' ? "bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]" :
                        task.priority === 'high' ? "bg-orange-500/10 text-orange-500 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]" :
                        task.priority === 'medium' ? "bg-blue-500/10 text-blue-500 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]" :
                        "bg-slate-500/10 text-slate-400 border-slate-500/30"
                      )}>
                        {task.priority || 'mid'}
                      </div>
                    </div>
                  ) : (
                    <div /> // Spacer if bottom-left is hidden
                  )}
                  
                  {isAssignedToMeByOthers && (
                    <div className={cn(
                      "px-2.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest shadow-lg",
                      task.priority === 'urgent' ? "bg-rose-500/10 text-rose-500 border-rose-500/30" :
                      task.priority === 'high' ? "bg-orange-500/10 text-orange-500 border-orange-500/30" :
                      task.priority === 'medium' ? "bg-blue-500/10 text-blue-500 border-blue-500/30" :
                      "bg-slate-500/10 text-slate-400 border-slate-500/30"
                    )}>
                      {task.priority || 'mid'}
                    </div>
                  )}
                </div>
              </div>

              {/* Holographic Overlays */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
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
