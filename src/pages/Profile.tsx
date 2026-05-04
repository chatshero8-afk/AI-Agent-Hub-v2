import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  User, Shield, Zap, Target, 
  BarChart3, RefreshCcw, Sparkles,
  ChevronRight, Award, Flame, Rocket, Camera, X, ZoomOut, ZoomIn, Check, Save, Plus, Trash2, Edit2, Edit3, Briefcase, Calendar, ChevronLeft, Clock, AlertCircle, GripVertical, Settings2, Activity,
  TrendingUp, Users, Coins, Phone, Trophy, Wallet, Presentation, ActivitySquare, PieChart, PhoneOff,
  LayoutDashboard, CreditCard, DollarSign, MousePointer2, ShoppingBag, Landmark, Megaphone, Mail, ChevronDown
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/cropUtils';
import { cn } from '@/src/lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { doc, updateDoc, collection, onSnapshot, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, LabelList,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';

const dummyConversionData = [
  { name: 'Mon', paid: 12, deposit: 8 },
  { name: 'Tue', paid: 18, deposit: 12 },
  { name: 'Wed', paid: 15, deposit: 10 },
  { name: 'Thu', paid: 25, deposit: 15 },
  { name: 'Fri', paid: 20, deposit: 13 },
  { name: 'Sat', paid: 30, deposit: 20 },
  { name: 'Sun', paid: 28, deposit: 18 },
];
import { Department, TodoItem, TargetItem, CalendarEvent, ActivityLog, AutomationGoal, DepartmentWidget } from '../types';
import { playSuccessSound } from '../lib/sounds';
import SalesDashboardTemplate from '../components/templates/SalesDashboardTemplate';

const monthlySalesData = [
  { name: 'Jan', value: 300000, label: '300k' },
  { name: 'Feb', value: 480000, label: '480k' },
  { name: 'Mar', value: 430000, label: '430k' },
  { name: 'Apr', value: 750000, label: '750k' },
  { name: 'May', value: 1300000, label: '1.3M' },
  { name: 'Jun', value: 700000, label: '700k' },
  { name: 'Jul', value: 800000, label: '800k' },
  { name: 'Aug', value: 850000, label: '850k' },
  { name: 'Sep', value: 1200000, label: '1.2M' },
  { name: 'Oct', value: 1000000, label: '1.0M' },
  { name: 'Nov', value: 800000, label: '800k' },
  { name: 'Dec', value: 950000, label: '950k' },
];
const closingRateData = [
  { name: 'Jan', value: 18.5, label: '18.5%' },
  { name: 'Feb', value: 16.2, label: '16.2%' },
  { name: 'Mar', value: 14.8, label: '14.8%' },
  { name: 'Apr', value: 20.1, label: '20.1%' },
  { name: 'May', value: 22.7, label: '22.7%' },
  { name: 'Jun', value: 15.3, label: '15.3%' },
  { name: 'Jul', value: 16.1, label: '16.1%' },
  { name: 'Aug', value: 21.4, label: '21.4%' },
  { name: 'Sep', value: 18.2, label: '18.2%' },
  { name: 'Oct', value: 16.5, label: '16.5%' },
  { name: 'Nov', value: 19.3, label: '19.3%' },
  { name: 'Dec', value: 22, label: '22%' },
];

const MORANDI_COLORS = [
  { id: 'sage', name: 'Sage', bg: 'bg-[#d2dbc8] dark:bg-[#c3ccb9]', text: 'text-[#6a7b5e]', border: 'border-[#b5c2a9]', accent: '#829573' },
  { id: 'dusty-blue', name: 'Dusty Blue', bg: 'bg-[#b6c2d1] dark:bg-[#a5b2c2]', text: 'text-[#506075]', border: 'border-[#9daabf]', accent: '#697a92' },
  { id: 'rose-ash', name: 'Rose Ash', bg: 'bg-[#d8c4c4] dark:bg-[#c9b4b4]', text: 'text-[#7e6060]', border: 'border-[#c4acac]', accent: '#9b7e7e' },
  { id: 'warm-sand', name: 'Warm Sand', bg: 'bg-[#d9d1c7] dark:bg-[#cec5ba]', text: 'text-[#7a6f61]', border: 'border-[#bfb5a8]', accent: '#968878' },
  { id: 'lavender', name: 'Lavender', bg: 'bg-[#c5c0d0] dark:bg-[#b5afc1]', text: 'text-[#665f75]', border: 'border-[#adabc0]', accent: '#807a93' },
  { id: 'default', name: 'Default', bg: 'bg-white dark:bg-slate-800', text: 'text-slate-900 dark:text-white', border: 'border-slate-100 dark:border-slate-700', accent: '#94a3b8' } // We can override this with Tailwind classes inline
];

const PREDEFINED_LABELS = [
  { name: 'Urgent', color: 'red' },
  { name: 'Important', color: 'amber' },
  { name: 'Task', color: '' },
  { name: 'Work', color: 'purple' },
  { name: 'Personal', color: 'emerald' },
  { name: 'Follow Up', color: 'slate' },
];

export default function Profile() {
  const user = auth.currentUser;
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Cropping State
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Settings State
  const [savingSettings, setSavingSettings] = useState(false);
  const [department, setDepartment] = useState<Department | ''>('');
  
  const [targets, setTargets] = useState<TargetItem[]>([]);
  
  // Todos & Activity state
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [taskView, setTaskView] = useState<'kanban' | 'list' | 'calendar'>('kanban');

  const getLabelColor = (color: string | undefined) => {
    switch(color) {
      case 'emerald': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'amber': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'red': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'purple': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'pink': return 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800';
      case 'slate': return 'text-slate-600 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800';
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const moveTodoStatus = (todoId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    const updated = todos.map(t => {
      if (t.id === todoId) {
        return { ...t, status: newStatus, completed: newStatus === 'done' };
      }
      return t;
    });
    setTodos(updated);
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { todos: updated }).catch(console.error);
    }
  };
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownTargetId, setBreakdownTargetId] = useState<string>('');
  const [breakdownStrategy, setBreakdownStrategy] = useState<'even' | 'front_loaded'>('front_loaded');
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [automationGoal, setAutomationGoal] = useState<AutomationGoal | null>(null);

  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventText, setNewEventText] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventIsUrgent, setNewEventIsUrgent] = useState(false);

  useEffect(() => {
    if (!user || !department) return;
    const unsubscribe = onSnapshot(collection(db, 'templates'), (snapshot) => {
      let foundTemplate = null;
      let allTemplate = null;
      snapshot.forEach(doc => {
        const t = doc.data();
        if (t.department === department) {
          foundTemplate = t.type;
        } else if (t.department === 'All') {
          allTemplate = t.type;
        }
      });
      setActiveTemplate(foundTemplate || allTemplate);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'templates');
    });
    return () => unsubscribe();
  }, [user, department]);

  useEffect(() => {
    let interval: any;
    if (isBackendConnected) {
      interval = setInterval(() => {
         setIsSyncing(true);
         setTimeout(() => {
             setTargets(prev => {
                const newTargets = [...prev];
                let updated = false;
                newTargets.forEach(t => {
                   if (t.name.includes('(Claude)') && t.value < t.max) {
                      t.value = Math.min(t.max, t.value + Math.floor(Math.random() * 5) + 1);
                      updated = true;
                   }
                });
                if (updated && user) {
                   updateDoc(doc(db, 'users', user.uid), { targets: newTargets }).catch(console.error);
                }
                return newTargets;
             });
             setIsSyncing(false);
         }, 1000);
      }, 15000); // 15s interval for demo
    }
    return () => clearInterval(interval);
  }, [isBackendConnected, user]);

  useEffect(() => {
    if (profile) {
      setDepartment(profile.department || '');
      
      if (profile.targets && profile.targets.length > 0) {
        setTargets(profile.targets);
      } else if (profile.target && typeof profile.target === 'object') {
        const legacyTarget = profile.target as any;
        setTargets([{
          id: 'legacy-target',
          name: 'Personal Target',
          type: legacyTarget.type || 'percentage',
          value: legacyTarget.value || 0,
          max: legacyTarget.max || 100
        }]);
      } else {
        setTargets([]);
      }
      
      setTodos(profile.todos || []);
      setCalendarEvents(profile.calendarEvents || []);
      setActivityLogs(profile.activityLogs || [
        { id: '1', title: 'Closed deal with NovaTech Solutions', description: 'Deal Value: $12,500', timeRange: '2h ago', timestamp: Date.now() - 7200000 },
        { id: '2', title: 'Logged 3 follow-ups', description: 'Leads updated in CRM', timeRange: '4h ago', timestamp: Date.now() - 14400000 },
        { id: '3', title: 'Completed task: Prepare proposal for Zenith Co.', description: 'Task completed', timeRange: '1d ago', timestamp: Date.now() - 86400000 },
        { id: '4', title: 'Attended product training', description: 'AI Sales Assistant Training', timeRange: '2d ago', timestamp: Date.now() - 172800000 },
      ]);
      setAutomationGoal(profile.automationGoal || {
        name: 'AI Lead Scoring Bot',
        description: 'Build an AI automation to score and prioritize inbound leads based on conversion likelihood.',
        target: 'Deploy 1 automation',
        deadline: 'May 31, 2025 (18 days left)',
        progress: 60,
        status: 'In Progress'
      });
    }
  }, [profile]);

  // Calendar Logic
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageToCrop(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const completeCropping = async () => {
    if (!imageToCrop || !croppedAreaPixels || !user) return;
    
    setIsUploading(true);
    setImageToCrop(null); // Hide modal immediately

    try {
      const croppedImage = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        0
      );
      
      await updateDoc(doc(db, 'users', user.uid), { avatar: croppedImage });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const addTargetItem = () => {
    setTargets([...targets, {
      id: Date.now().toString(),
      name: 'New Area Target',
      type: 'percentage',
      value: 0,
      max: 100,
      color: 'default',
      cardStyle: 'default'
    }]);
  };

  const updateTargetItem = async (id: string, updates: Partial<TargetItem>) => {
    const target = targets.find(t => t.id === id);
    if (target && updates.value !== undefined && updates.value > target.value) {
      logActivity(`Updated Target: ${target.name}`, `Progress increased from ${target.value} to ${updates.value}`);
      
      if (updates.value >= target.max && target.value < target.max) {
        try {
          if (user) {
            const userName = profile?.name || user.displayName || 'A user';
            await addDoc(collection(db, 'global_events'), {
              type: 'target_hit',
              userId: user.uid,
              userName: userName,
              message: `${userName} just hit a sales target!`,
              createdAt: serverTimestamp()
            });
          }
        } catch (e) {
          console.error("Failed to broadcast target hit", e);
        }
      }
    }
    setTargets(targets.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTargetItem = (id: string) => {
    setTargets(targets.filter(t => t.id !== id));
  };

  const addCalendarEvent = async () => {
    if (!user || !selectedDate || !newEventText.trim()) return;
    const newEvents = [...calendarEvents, {
      id: Date.now().toString(),
      date: selectedDate,
      text: newEventText.trim(),
      time: newEventTime,
      isUrgent: newEventIsUrgent
    }];
    setCalendarEvents(newEvents);
    setNewEventText('');
    setNewEventTime('');
    setNewEventIsUrgent(false);
    try {
      await updateDoc(doc(db, 'users', user.uid), { calendarEvents: newEvents });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!user) return;
    const newEvents = calendarEvents.filter(e => e.id !== id);
    setCalendarEvents(newEvents);
    try {
      await updateDoc(doc(db, 'users', user.uid), { calendarEvents: newEvents });
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    setSavingSettings(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        department: department,
        targets: targets,
        automationGoal: automationGoal,
      });
    } catch(err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim() || !user) return;
    const newTask: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: Date.now(),
      status: 'todo'
    };
    const newItems: TodoItem[] = [...todos, newTask];
    setTodos(newItems);
    setNewTodo('');
    setEditingTodo(newTask);
    try {
      await updateDoc(doc(db, 'users', user.uid), { todos: newItems });
    } catch(err) {
      console.error(err);
    }
  };

  const generateBreakdownTasks = async () => {
    if (!breakdownTargetId || !user) return;
    
    let itemName = '';
    let itemMax = 0;
    
    if (breakdownTargetId === 'automation') {
       itemName = automationGoal?.name || 'Automation Goal';
       itemMax = 100;
    } else {
       const target = targets.find(t => t.id === breakdownTargetId);
       if (target) {
         itemName = target.name;
         itemMax = target.max;
       }
    }
    
    if (!itemName) return;
    
    let percentages = [25, 25, 25, 25];
    if (breakdownStrategy === 'front_loaded') percentages = [30, 30, 25, 15]; // 85% in first 3 weeks
    
    const newTasks: TodoItem[] = percentages.map((pct, idx) => {
        let amountStr = '';
        if (breakdownTargetId === 'automation') {
           amountStr = `+${pct}% progress`;
        } else {
           const target = targets.find(t => t.id === breakdownTargetId);
           const amount = Math.round((pct / 100) * itemMax);
           const unit = target?.type === 'percentage' ? '%' : '';
           amountStr = `${amount}${unit}`;
        }
        
        return {
           id: `${Date.now()}-${idx}`,
           text: `Week ${idx + 1}: Achieve ${amountStr} for "${itemName}"`,
           completed: false,
           createdAt: Date.now() + idx,
           type: 'once'
        };
    });
    
    // Put new tasks at the top
    const newItems = [...newTasks, ...todos];
    setTodos(newItems);
    setShowBreakdown(false);
    
    logActivity('Generated Goal Breakdown', `Created 4 weekly tasks for ${itemName}`);
    
    try {
      await updateDoc(doc(db, 'users', user.uid), { todos: newItems });
    } catch(err) {
      console.error(err);
    }
  };

  const toggleTodo = async (id: string, current: boolean) => {
    if (!user) return;
    const todo = todos.find(t => t.id === id);
    const newItems = todos.map(t => t.id === id ? { ...t, completed: !current } : t);
    setTodos(newItems);
    
    if (!current && todo) {
      logActivity(`Completed task: ${todo.text}`, 'Task checked off.');
      playSuccessSound();
    }
    
    try {
      await updateDoc(doc(db, 'users', user.uid), { todos: newItems });
    } catch(err) {
      console.error(err);
    }
  };

  const logActivity = async (title: string, description: string) => {
    if (!user) return;
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      title,
      description,
      timeRange: 'Just now',
      timestamp: Date.now()
    };
    const newLogs = [newLog, ...activityLogs].slice(0, 10); // Keep last 10
    setActivityLogs(newLogs);
    try {
      await updateDoc(doc(db, 'users', user.uid), { activityLogs: newLogs });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) return;
    const newItems = todos.filter(t => t.id !== id);
    setTodos(newItems);
    try {
      await updateDoc(doc(db, 'users', user.uid), { todos: newItems });
    } catch(err) {
      console.error(err);
    }
  };

  // Performance Score Calculation
  const taskKpi = todos.length > 0 ? (todos.filter(t => t.completed).length / todos.length) * 10 : 0;
  
  const targetKpi = targets.length > 0 
    ? (targets.reduce((acc, curr) => acc + Math.min(1, curr.value / curr.max), 0) / targets.length) * 10
    : 0;
  
  const automationKpi = automationGoal ? (automationGoal.progress / 100) * 10 : 0;
  
  let scoreDivisor = 0;
  if (todos.length > 0) scoreDivisor++;
  if (targets.length > 0) scoreDivisor++;
  if (automationGoal) scoreDivisor++;

  const totalScore = scoreDivisor > 0 ? ((taskKpi + targetKpi + automationKpi) / scoreDivisor) : 8.5;

  let gradeTitle = '「 Processing Data 」';
  if (totalScore >= 9) gradeTitle = '「 Perfect Execution 」';
  else if (totalScore >= 8) gradeTitle = '「 Peak Optimization 」';
  else if (totalScore >= 6) gradeTitle = '「 Optimal Output 」';
  else gradeTitle = '「 Needs Calibration 」';

  let aiComment = 'Processing current activity arrays to provide insights...';
  if (totalScore >= 9) {
    aiComment = 'Outstanding performance across the board. Your goal completion rate is exceptionally high. Maintain this rhythm.';
  } else if (totalScore >= 8) {
    aiComment = 'Strong overall execution. You are hitting most of your targets. Focusing on minor bottlenecks could push you to perfect execution.';
  } else if (totalScore >= 6) {
    aiComment = 'Consistent effort detected. However, there is noticeable room for optimization in your target fulfillment.';
  } else if (scoreDivisor === 0) {
    aiComment = 'Insufficient data to generate performance insights. Please add tasks, targets, or an automation goal to begin tracking.';
  } else {
    aiComment = 'Warning: Neural output falling behind thresholds. Immediate review of pending tasks and missed targets is highly recommended.';
  }

  return (
    <div className="w-full mx-auto space-y-6 pb-12 px-0">
      {/* Character Performance Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 lg:p-8 border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-300">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                Neural Output Result
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[8px]">Live KPI</span>
             </span>
          </div>
        </div>

        <div className="relative flex flex-col md:flex-row gap-8 w-full">
          {/* Left Side: Sales Stats */}
          <div className="flex-1 space-y-6 pt-2">
             <div>
               <div className="flex items-center justify-between mb-2">
                 <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] drop-shadow-[0_0_5px_rgba(0,255,157,0.8)]" /> Current Month Sales
                 </div>
                 <div className="text-sm font-black text-[#ff2a5f] bg-[#ff2a5f]/10 px-3 py-1 rounded-xl border border-[#ff2a5f] drop-shadow-[0_0_8px_rgba(255,42,95,0.6)] flex items-center gap-1.5">
                   ⏳ {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} Days Left
                 </div>
               </div>
               <div className="flex items-baseline gap-2 group">
                  <span className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#00ff9d] leading-none tracking-tighter drop-shadow-[0_0_25px_rgba(0,255,157,0.6)] group-hover:drop-shadow-[0_0_40px_rgba(0,255,157,0.8)] transition-all duration-300 font-sans italic">
                    RM 1,286,450
                  </span>
               </div>
               <p className="text-sm font-bold text-[#00ff9d] drop-shadow-[0_0_5px_rgba(0,255,157,0.4)] mt-2 flex items-center gap-1">
                 ▲ 12.5% <span className="text-slate-500 font-medium drop-shadow-none">vs last month</span>
               </p>
             </div>
             
             <div className="flex gap-4 sm:gap-6 flex-wrap">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Cases Closed</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tighter font-sans italic">
                      128
                    </span>
                    <span className="flex items-center justify-center bg-[#00ff9d]/10 text-[#00ff9d] px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-[#00ff9d]/20 drop-shadow-[0_0_5px_rgba(0,255,157,0.3)]" title="Personal Recent Closed Cases">
                      +12 Recent
                    </span>
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Closing Rate</p>
                  <span className="text-4xl sm:text-5xl font-black text-secondary leading-none tracking-tighter font-sans drop-shadow-[0_0_10px_rgba(236,72,153,0.3)] italic">
                    85.8%
                  </span>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Engagements</p>
                  <span className="text-4xl sm:text-5xl font-black text-blue-500 leading-none tracking-tighter font-sans drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] italic">
                    342
                  </span>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1"><Coins size={12} className="text-amber-500" /> Bonus Earned</p>
                  <span className="text-4xl sm:text-5xl font-black text-[#ffaa00] leading-none tracking-tighter font-sans drop-shadow-[0_0_25px_rgba(255,170,0,0.9)] italic group-hover:drop-shadow-[0_0_40px_rgba(255,170,0,1)] transition-all duration-300">
                    RM 800
                  </span>
               </div>
             </div>
          </div>

          <div className="relative flex flex-col items-center justify-center md:pr-4 md:max-w-xs w-full">
            <div className="relative w-56 h-56 flex items-center justify-center scale-90 md:scale-100 group">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] mix-blend-screen opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
              
              {/* Background Arc */}
              <div className="absolute inset-4 rounded-full border-[8px] border-slate-100 dark:border-white/5 opacity-50" />
              
              {/* Progress Arc */}
              <svg className="absolute inset-0 w-full h-full -rotate-[220deg] drop-shadow-[0_0_15px_rgba(139,92,246,0.8)] filter">
                <motion.circle
                  cx="112" cy="112" r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="502"
                  strokeDashoffset="502"
                  initial={{ strokeDashoffset: 502 }}
                  animate={{ strokeDashoffset: 502 * (1 - (totalScore / 10)) }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>

              {/* Character Mascot Wrapper */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-40 h-40 flex items-center justify-center drop-shadow-[0_0_20px_rgba(139,92,246,0.5)] cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-32 h-32 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden border-[3px] border-white dark:border-slate-800 shadow-[0_0_30px_rgba(139,92,246,0.7)] relative group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-secondary/30 z-0 opacity-50" />
                   <img src={profile?.avatar || "/icons/chatshero.webp"} alt="Avatar" className="relative z-10 w-full h-full object-cover mix-blend-normal" />
                   <div className="absolute -top-4 -right-4 blur-3xl bg-primary/50 w-16 h-16 rounded-full z-0 animate-pulse" />
                   
                   {/* Hover Overlay for Upload */}
                   <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Camera className="text-white" size={32} />
                   </div>
                   
                   {/* Uploading Overlay */}
                   {isUploading && (
                     <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center">
                       <RefreshCcw className="text-white animate-spin" size={32} />
                     </div>
                   )}
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </motion.div>
            </div>
            
            {/* Assignment Info */}
             <div className="mt-4 flex flex-col items-center z-10 relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm w-full max-w-xs">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 leading-none">Assignment</span>
              <div className="w-full text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-center">
                 {user?.displayName || 'User'}
                 <div className="text-[10px] text-primary mt-1">
                   {activeTemplate === 'sales_dashboard_v1' || department === 'SalesMarketing' ? 'Sales Team' : department ? department : 'Ungrouped'}
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>


      {/* AI Performance Insight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2 text-slate-900 dark:text-white">
             <div className="w-1.5 h-6 bg-primary rounded-full group-hover:h-8 transition-all" />
             AI Neural Insight
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                if (!user) return;
                try {
                  const userName = profile?.name || user.displayName || 'A user';
                  await addDoc(collection(db, 'global_events'), {
                    type: 'sales_closed',
                    userId: user.uid,
                    userName: userName,
                    message: `Attention! ${userName} from the Sales Department has successfully closed a case!`,
                    createdAt: serverTimestamp()
                  });
                } catch(e) {
                  console.error(e);
                }
              }}
              className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
              Test TTS: Sales Closed Case
            </button>
            <button 
              onClick={async () => {
                if (!user) return;
                try {
                  const userName = profile?.name || user.displayName || 'A user';
                  await addDoc(collection(db, 'global_events'), {
                    type: 'it_project_live',
                    userId: user.uid,
                    userName: userName,
                    message: `IT Update: ${userName} has completed a new customer project. It is now ready to go live!`,
                    createdAt: serverTimestamp()
                  });
                } catch(e) {
                  console.error(e);
                }
              }}
              className="text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
              Test TTS: IT Project Live
            </button>
            <button 
              onClick={async () => {
                if (!user) return;
                try {
                  const userName = profile?.name || user.displayName || 'A user';
                  await addDoc(collection(db, 'global_events'), {
                    type: 'agent_created',
                    userId: user.uid,
                    userName: userName,
                    message: `Global Alert: A new AI Agent was just created by ${userName}!`,
                    createdAt: serverTimestamp()
                  });
                } catch(e) {
                  console.error(e);
                }
              }}
              className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-2"
            >
              Test TTS: New AI Agent
            </button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 lg:p-8 flex flex-col xl:flex-row gap-8 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary via-secondary to-blue-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
           
           {/* Manager's Persona & Core Insight */}
           <div className="flex flex-col gap-6 xl:max-w-md w-full relative z-10">
             <div className="flex items-center gap-4">
               <div className="relative">
                 <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex justify-center items-center relative z-10 border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    <Sparkles size={26} />
                 </div>
                 <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping opacity-50" />
               </div>
               <div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg italic">Manager AI</h4>
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20 inline-block mt-1">Strategic Guidance</span>
               </div>
             </div>
             
             <div className="bg-white/60 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner grow flex flex-col justify-center">
               <h5 className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">Current Assessment</h5>
               <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                 {aiComment || "Suggestion: You're close to unlocking your next tier! Focus on your recent case pipeline to push your closing rate up before the month ends."}
               </p>
               <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Overall Performance Scoring</span>
                  <span className="text-lg font-black text-primary italic">8.5 / 10</span>
               </div>
             </div>
           </div>
           
           {/* Weekly Breakdown & Priorities */}
           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
               
               {/* 1. Immediate Priority (Lacking) */}
               <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(244,63,94,0.3)] flex flex-col justify-between group-hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[20px] -mr-12 -mt-12" />
                  
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                       <div className="w-10 h-10 rounded-xl bg-white/20 shadow-inner flex items-center justify-center shrink-0">
                         <AlertCircle size={20} className="text-white drop-shadow-md" />
                       </div>
                       <span className="px-2 py-1 bg-white/20 rounded-md text-[10px] font-black uppercase text-white tracking-widest backdrop-blur-sm border border-white/20">Goal Achieved</span>
                    </div>
                    <h5 className="font-black text-white text-lg leading-none mb-2 drop-shadow-sm uppercase italic">RM 40k Milestone Reached!</h5>
                    <p className="text-xs text-rose-100 font-medium leading-relaxed drop-shadow-sm">
                      Congratulations! You've successfully hit your sales target. Your RM 800 bonus has been unlocked and added to your wallet.
                    </p>
                  </div>
                  
                  <button className="mt-6 w-full py-3 bg-white text-rose-600 font-black uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                     View Stalled Deals
                  </button>
               </div>

               {/* 2. Secondary Weekly Target */}
               <div className="bg-slate-100 dark:bg-slate-800/80 rounded-3xl p-6 relative overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                       <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                         <Target size={20} className="text-blue-500" />
                       </div>
                       <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700/50 rounded-md text-[10px] font-black uppercase text-slate-500 tracking-widest border border-slate-300 dark:border-slate-600">Weekly Goal</span>
                    </div>
                    <h5 className="font-black text-slate-800 dark:text-white text-base leading-none mb-2 uppercase tracking-tight">Pipeline Expansion</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Add 15 new qualified leads to your pipeline. Keep prospecting steady so you don't fall behind next month.
                    </p>
                  </div>
                  
                  <div className="mt-6">
                     <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                       <span className="text-sm font-black text-blue-500 italic">20%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 w-[20%] rounded-full relative">
                         <div className="absolute inset-0 bg-white/20 animate-pulse" />
                       </div>
                     </div>
                  </div>
               </div>

           </div>
        </div>
      </div>
      
      {/* Performance Leaderboards & Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-8 mb-12">
          {/* Column 1: Leaderboards */}
          <div className="flex flex-col gap-4">
              {/* Top Sales Rank */}
              <div className="bg-[#151522] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group flex flex-col flex-1">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                <h3 className="text-lg font-black tracking-normal flex items-center gap-2 mb-6 text-white uppercase italic">
                  <Trophy className="text-primary dark:text-purple-400" size={20} /> Top Sales Leaderboard
                </h3>
                <div className="space-y-6 flex-1">
                  {[ 
                    { rank: 1, name: 'Alex W.', dept: 'Sales Dept (East)', rev: '442,590', deals: 128, trend: '21.5%', img: 'https://api.dicebear.com/7.x/notionists/svg?seed=wang' },
                    { rank: 2, name: 'Sarah L.', dept: 'Sales Dept (South)', rev: '428,760', deals: 92, trend: '16.3%', img: 'https://api.dicebear.com/7.x/notionists/svg?seed=li' }
                  ].map((rep, i) => (
                    <div key={i} className="flex items-center gap-5 group/item transition-all hover:translate-x-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${i === 0 ? 'bg-amber-100 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-300'}`}>
                        {rep.rank}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                        <img src={rep.img} alt={rep.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base text-slate-900 dark:text-white tracking-normal">{rep.name}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-300 uppercase tracking-widest font-bold">{rep.dept}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 mb-0.5 uppercase font-bold">Sales (RM)</p>
                        <p className="font-black text-slate-900 dark:text-white text-sm">RM {rep.rev} <span className="text-emerald-500 text-[10px] ml-1 font-bold">▲ {rep.trend}</span></p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-300 mt-1 uppercase font-bold">Deals Closed <span className="text-slate-900 dark:text-white font-black ml-2">{rep.deals}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Closing Rate Leagueboard */}
              <div className="bg-[#151522] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group flex flex-col flex-1">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <h3 className="text-lg font-black tracking-normal flex items-center gap-2 mb-6 text-white uppercase italic">
                  <Zap className="text-indigo-400" size={20} /> Closing Rate Leagueboard
                </h3>
                <div className="space-y-6 flex-1">
                  {[ 
                    { rank: 1, name: 'Sarah L.', dept: 'Sales Dept (South)', rate: '32.4%', deals: 92, trend: '+2.1pp', img: 'https://api.dicebear.com/7.x/notionists/svg?seed=li' },
                    { rank: 2, name: 'Alex W.', dept: 'Sales Dept (East)', rate: '28.7%', deals: 128, trend: '+1.4pp', img: 'https://api.dicebear.com/7.x/notionists/svg?seed=wang' }
                  ].map((rep, i) => (
                    <div key={i} className="flex items-center gap-5 group/item transition-all hover:translate-x-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${i === 0 ? 'bg-indigo-100 text-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-300'}`}>
                        {rep.rank}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                        <img src={rep.img} alt={rep.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base text-slate-900 dark:text-white tracking-normal">{rep.name}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-300 uppercase tracking-widest font-bold">{rep.dept}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 mb-0.5 uppercase font-bold">Closing Rate</p>
                        <p className="font-black text-indigo-400 text-sm">{rep.rate} <span className="text-emerald-500 text-[10px] ml-1 font-bold">▲ {rep.trend}</span></p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-300 mt-1 uppercase font-bold">Total Deals <span className="text-slate-900 dark:text-white font-black ml-2">{rep.deals}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>

          {/* Column 2: Bonus Tier */}
          <div className="bg-[#151522] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden relative group h-full flex flex-col">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[30px] -mr-16 -mt-16" />
             <h3 className="text-lg font-black tracking-normal flex items-center gap-2 mb-4 text-white uppercase italic">
               <Coins className="text-amber-500" size={20} /> Bonus Tier Rewards
             </h3>
             <div className="space-y-4 relative z-10">
               <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Current Sales</p>
                      <p className="font-black text-3xl text-slate-900 dark:text-white mt-1 italic tracking-tighter">RM 40,000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-amber-500 tracking-[0.15em] bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">Unlocked: RM 800</p>
                    </div>
                  </div>
                  {/* Progress bar up to 80k */}
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden relative border border-slate-200 dark:border-white/5 shadow-inner">
                     <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 w-[50%] rounded-full relative shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                     <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/30 dark:bg-slate-900/30" />
                     <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-white/30 dark:bg-slate-900/30" />
                  </div>
                  <div className="flex justify-between items-center mt-2 px-1 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                    <span>0</span>
                    <span>RM 40k</span>
                    <span>RM 60k</span>
                    <span>RM 80k+</span>
                  </div>
               </div>

               {[
                 { target: '40', amount: '800', unlock: true },
                 { target: '60', amount: '1,500', unlock: false },
                 { target: '80', amount: '2,300', unlock: false },
               ].map((tier, i) => (
                 <div key={i} className={`flex items-center justify-between p-4 rounded-[2rem] border transition-all ${tier.unlock ? 'bg-amber-500/5 border-amber-500/20 shadow-lg group/tier' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-white/5'}`}>
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover/tier:scale-110 ${tier.unlock ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/40 animate-pulse' : 'bg-slate-200 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'}`}>
                         {tier.unlock ? <Award size={24} /> : <Target size={24} />}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-0.5">Target Hit</p>
                          <p className={`font-black text-base italic ${tier.unlock ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>RM {tier.target}k</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-0.5">Bonus</p>
                       <p className={`font-black text-xl italic ${tier.unlock ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-400'}`}>RM {tier.amount}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        
          {/* Column 3: Monthly Targets */}
          <div className="bg-[#151522] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group h-full flex flex-col">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
            <h3 className="text-lg font-black tracking-normal flex items-center gap-2 mb-6 text-white uppercase italic">
               <Target className="text-secondary" size={20} /> Monthly Targets
            </h3>
            <div className="space-y-4">
              {[ 
                { label: 'Sales Goal', icon: Wallet, current: '1,286,450', max: '1,500,000', pct: 85.8 },
                { label: 'Calls Goal', icon: Phone, current: '1,200', max: '1,500', pct: 80.0 },
                { label: 'Appointments Goal', icon: Briefcase, current: '325', max: '500', pct: 65.0 },
                { label: 'Follow-up Goal', icon: Presentation, current: '165', max: '250', pct: 66.0 },
                { label: 'Closing Goal', icon: ActivitySquare, current: '356', max: '500', pct: 71.2 },
              ].map((t, i) => (
                <div key={i} className="group/target">
                  <div className="flex justify-between items-center text-[11px] font-black mb-2 uppercase tracking-wide">
                    <span className="text-slate-700 dark:text-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-inner group-hover/target:scale-110 transition-transform"><t.icon size={14} /></div>
                      {t.label}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-mono">
                      <span className="text-slate-400 font-normal">%</span> {t.current} <span className="text-slate-400 mx-1 font-normal">/</span> {t.max} 
                      <span className="text-slate-900 dark:text-white ml-4 w-12 inline-block text-right text-sm italic">{t.pct}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-white/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${t.pct}%` }}
                      transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                      className="bg-gradient-to-r from-secondary to-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(236,72,153,0.3)]" 
                    />
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
      
      {/* 3-Column Performance Charts (Funnel + Trends) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4 mb-12">
          {/* Sales Funnel */}
          <div className="bg-[#151522] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
            <h3 className="text-lg font-black tracking-normal flex items-center gap-2 mb-10 text-white uppercase italic">
              Sales Funnel
            </h3>
            
            <div className="flex flex-col items-center justify-center relative py-4 scale-110">
              <svg width="200" height="180" viewBox="0 0 200 180" className="drop-shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                {/* Leads Stage */}
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  d="M10 0 H190 L165 45 H35 Z" 
                  fill="#8B5CF6" 
                  fillOpacity="0.8" 
                />
                
                {/* Appointment Stage */}
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  d="M37 50 H163 L145 95 H55 Z" 
                  fill="#8B5CF6" 
                  fillOpacity="0.6" 
                />

                {/* Attended Stage */}
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  d="M57 100 H143 L128 135 H72 Z" 
                  fill="#10B981" 
                  fillOpacity="0.7" 
                />

                {/* Closed Stage */}
                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  d="M74 140 H126 L110 170 H90 Z" 
                  fill="#10B981" 
                  fillOpacity="1" 
                />

                {/* Level Labels */}
                <text x="100" y="18" textAnchor="middle" fill="white" className="text-[10px] font-black uppercase tracking-widest">Leads</text>
                <text x="100" y="34" textAnchor="middle" fill="white" className="text-xs font-black">1,982</text>
                
                {/* Dividers */}
                <line x1="40" y1="46" x2="160" y2="46" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
                <line x1="58" y1="96" x2="142" y2="96" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
                <line x1="72" y1="136" x2="128" y2="136" stroke="white" strokeOpacity="0.2" strokeWidth="1" />

                <text x="100" y="68" textAnchor="middle" fill="white" className="text-[9px] font-black uppercase tracking-widest opacity-80">Appointment</text>
                <text x="100" y="83" textAnchor="middle" fill="white" className="text-[11px] font-black">642</text>
                <text x="178" y="81" textAnchor="middle" fill="#EC4899" className="text-[11px] font-black drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">32.4%</text>
                
                <text x="100" y="114" textAnchor="middle" fill="white" className="text-[9px] font-black uppercase tracking-widest opacity-80">Attended</text>
                <text x="100" y="127" textAnchor="middle" fill="white" className="text-[11px] font-black">412</text>
                <text x="168" y="126" textAnchor="middle" fill="#10B981" className="text-[11px] font-black drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">64.2%</text>
                
                <text x="100" y="152" textAnchor="middle" fill="white" className="text-[9px] font-black uppercase tracking-widest opacity-80">Closed</text>
                <text x="100" y="165" textAnchor="middle" fill="white" className="text-[11px] font-black">256</text>
                <text x="158" y="163" textAnchor="middle" fill="#10B981" className="text-[11px] font-black drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">62.1%</text>
              </svg>
            </div>

            <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl border border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Overall Conversion (Leads → Closed)</span>
              <span className="text-xl font-black text-[#EC4899] italic">12.9%</span>
            </div>
          </div>

          {/* Monthly Sales Overview */}
          <div className="bg-[#151522] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
            <h3 className="text-lg font-black tracking-normal flex items-center gap-2 mb-8 text-white uppercase italic">
              Monthly Sales Overview
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySalesData} margin={{ top: 30, right: 30, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} tickFormatter={(val) => val === 0 ? '0k' : val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151522', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#8B5CF6', fontWeight: 900, fontSize: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 900, fontSize: '10px', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#8B5CF6' }}
                  >
                    <LabelList dataKey="label" position="top" style={{ fill: '#8B5CF6', fontSize: 10, fontWeight: 900 }} offset={18} />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Closing Rates Trend */}
          <div className="bg-[#151522] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]" />
            <h3 className="text-lg font-black tracking-normal flex items-center gap-2 mb-8 text-white uppercase italic">
              Closing Rates Trend
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={closingRateData} margin={{ top: 30, right: 30, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClosing" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} domain={[0, 40]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151522', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#EC4899', fontWeight: 900, fontSize: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 900, fontSize: '10px', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#EC4899" 
                    fillOpacity={1} 
                    fill="url(#colorClosing)" 
                    strokeWidth={4} 
 dot={{ r: 4, fill: '#EC4899', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#EC4899' }}
                  >
                    <LabelList dataKey="label" position="top" style={{ fill: '#EC4899', fontSize: 10, fontWeight: 900 }} offset={18} />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 mb-10 relative z-10">
          {[
            { icon: Award, titleEn: "Total Sales", titleCn: "(SALES)", value: "1,286,450", unit: "RM", trend: "18.6%", trendDir: "up" },
            { icon: ActivitySquare, titleEn: "Total Deals", titleCn: "(DEALS CLOSED)", value: "356", trend: "12.4%", trendDir: "up" },
            { icon: Target, titleEn: "Closing Rate", titleCn: "(CONVERSION RATE)", value: "22.7%", trend: "1.2pp", trendDir: "up" },
            { icon: Phone, titleEn: "Calls Connected", titleCn: "(CALLS OBJECTIVE)", value: "1,200", trend: "8.7%", trendDir: "up" },
            { icon: PieChart, titleEn: "Connection Rate", titleCn: "(CALL SUCCESS %)", value: "82.5%", trend: "4.7pp", trendDir: "up" },
            { icon: PhoneOff, titleEn: "Missed Calls", titleCn: "(MISSED)", value: "58", trend: "9.3%", trendDir: "down" },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-[#11111d] border border-white/5 rounded-[2rem] p-5 flex flex-col justify-between h-[180px] shadow-2xl group transition-all duration-300">
              {/* Top Row: Icon and Titles */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400/80 border border-indigo-500/10 shadow-inner shrink-0">
                  <kpi.icon size={20} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h4 className="text-[13px] font-black text-white tracking-tight leading-tight uppercase italic truncate">{kpi.titleEn}</h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1 truncate">{kpi.titleCn}</p>
                </div>
              </div>

              {/* Bottom Row: Value and Trend */}
              <div className="flex items-end justify-between relative z-10 mt-auto">
                <div className="flex items-baseline gap-0.5">
                  {kpi.unit === 'RM' && <span className="text-[10px] font-black text-white italic mr-0.5 opacity-60">RM</span>}
                  <span className="text-2xl font-black text-white tracking-tighter italic leading-none">{kpi.value}</span>
                  {kpi.unit !== 'RM' && kpi.unit && <span className="text-[9px] font-black text-slate-500 uppercase ml-0.5 italic opacity-70">{kpi.unit}</span>}
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-600 font-bold tracking-widest mb-0.5 uppercase">vs Last Month</p>
                  <div className={`flex items-center justify-end gap-0.5 font-black text-[15px] italic leading-none ${kpi.trendDir === 'up' ? 'text-[#00ff9d]' : 'text-[#ff2a5f]'}`}>
                    {kpi.trendDir === 'up' ? '↗' : '↘'} {kpi.trend}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Ads Performance & Payment Conversion Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        {/* Ads Performance Analysis (Left) */}
        <div className="bg-[#16162a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          {/* Background Grid Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col h-full relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 border border-white/10 shadow-inner">
                  <Megaphone size={18} />
                </div>
                <h3 className="text-sm font-black text-white uppercase italic tracking-[0.2em]">Ads Performance</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This Month</span>
                <ChevronDown size={12} className="text-slate-500" />
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
               {/* Hero Metric: Total Spent */}
               <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col items-end relative overflow-hidden group/spent hover:bg-white/[0.05] transition-all">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500/50" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Spent</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-[10px] font-black text-purple-400 italic">↗ 11.5% VS PREV</span>
                    <h3 className="text-6xl font-black text-white italic tracking-tighter filter drop-shadow-xl transition-transform group-hover/spent:scale-[1.02]">RM 58,420</h3>
                  </div>
               </div>

               {/* Secondary Metrics Grid */}
               <div className="grid grid-cols-4 divide-x divide-white/5 border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden">
                 {[
                   { label: "Leads", val: "325", trend: "8.1%", icon: Users, color: "text-blue-400" },
                   { label: "CPL", val: "RM 179.75", trend: "4.2%", icon: Target, color: "text-emerald-400" },
                   { label: "Appointment", val: "156", trend: "9.7%", icon: Calendar, color: "text-pink-400" },
                   { label: "ROAS", val: "4.38x", trend: "0.5x", icon: Activity, color: "text-blue-400" }
                 ].map((item, i) => (
                   <div key={i} className="p-6 flex flex-col items-center text-center group/sub hover:bg-white/[0.03] transition-colors">
                      <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${item.color} mb-3 group-hover/sub:scale-110 transition-transform`}>
                        <item.icon size={16} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{item.label}</p>
                      <p className="text-2xl font-black text-white italic tracking-tighter mb-2">{item.val}</p>
                      <span className="text-[11px] font-black text-[#00ff9d] italic flex items-center gap-1">
                        ↗ {item.trend}
                      </span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Payment Conversion (Right) */}
        <div className="bg-[#16162a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          {/* Background Grid Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-white/10 shadow-inner">
                  <Wallet size={18} />
                </div>
                <h3 className="text-sm font-black text-white uppercase italic tracking-[0.2em]">Payment Conversion</h3>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-px bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden mb-8">
                <div className="bg-white/[0.02] p-8 flex items-center justify-between group/paid">
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Paid Customer</p>
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-black text-white italic tracking-tighter">98</span>
                      <span className="text-xl font-black text-emerald-400 italic">15.6% <span className="text-[10px] font-bold text-slate-600 uppercase transition-opacity opacity-0 group-hover/paid:opacity-100 ml-1">Conv.</span></span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                    <Users size={18} />
                  </div>
                </div>
                <div className="bg-white/[0.02] p-8 flex items-center justify-between group/dep">
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Deposit Customer</p>
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-black text-white italic tracking-tighter">56</span>
                      <span className="text-xl font-black text-blue-400 italic">8.9% <span className="text-[10px] font-bold text-slate-600 uppercase transition-opacity opacity-0 group-hover/dep:opacity-100 ml-1">Conv.</span></span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                    <Landmark size={18} />
                  </div>
                </div>
              </div>

              {/* Chart Integration */}
              <div className="flex-1 min-h-[120px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dummyConversionData}>
                    <defs>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPaid)" />
                    <Area type="monotone" dataKey="deposit" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDeposit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 relative z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Industry Analysis (Donut Chart) */}
        <div className="lg:col-span-5 bg-[#151522]/80 backdrop-blur-md rounded-[3.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500/30" />
           <div className="flex flex-col h-full">
             <div className="flex items-center justify-between mb-10">
               <div className="flex flex-col">
                 <h3 className="text-sm font-black text-white uppercase italic tracking-[0.2em] mb-1">
                   Industry Analysis
                 </h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revenue Attribution %</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                 <PieChart size={14} />
               </div>
             </div>
             
             <div className="flex flex-col gap-10">
                <div className="relative w-full flex justify-center">
                  <div className="w-56 h-56 relative">
                    {/* Background glow for chart */}
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-2xl scale-75" />
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Real Estate', value: 35.1, color: '#8B5CF6' },
                            { name: 'Education & Training', value: 22.1, color: '#3B82F6' },
                            { name: 'Financial Services', value: 14.9, color: '#10B981' },
                            { name: 'Retail Trade', value: 11.1, color: '#F59E0B' },
                            { name: 'Technology & Mfg', value: 8.2, color: '#EC4899' },
                            { name: 'Others', value: 7.7, color: '#6366F1' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={75}
                          outerRadius={95}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {[
                            { color: '#8B5CF6' },
                            { color: '#3B82F6' },
                            { color: '#10B981' },
                            { color: '#F59E0B' },
                            { color: '#EC4899' },
                            { color: '#6366F1' },
                          ].map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              className="hover:opacity-80 transition-opacity cursor-pointer outline-none" 
                            />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none scale-110">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total Sales</p>
                       <p className="text-xl font-black text-white italic tracking-tighter">RM 1.28M</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full px-2">
                   {[
                     { name: 'Real Estate', pct: 35.1, val: '452,180', color: 'bg-[#8B5CF6]' },
                     { name: 'Education & Training', pct: 22.1, val: '206,743', color: 'bg-[#3B82F6]' },
                     { name: 'Financial Services', pct: 14.9, val: '191,540', color: 'bg-[#10B981]' },
                     { name: 'Retail Trade', pct: 11.1, val: '142,990', color: 'bg-[#F59E0B]' },
                     { name: 'Technology & Mfg', pct: 8.2, val: '105,650', color: 'bg-[#EC4899]' },
                   ].map((item, i) => (
                     <div key={i} className="group/item flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] font-black tracking-tight">
                           <div className="flex items-center gap-2.5 text-white/90">
                              <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_8px_rgba(139,92,246,0.3)]`} />
                              {item.name}
                           </div>
                           <div className="flex items-center gap-4 text-slate-400">
                              <span className="font-mono">RM {item.val}</span>
                              <span className="text-white w-10 text-right">{item.pct}%</span>
                           </div>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${item.pct}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           </div>
        </div>

        {/* Recent Closed Cases (Table) */}
        <div className="lg:col-span-7 bg-[#151522]/80 backdrop-blur-md rounded-[3.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-2 h-full bg-primary/30" />
           <div className="flex items-center justify-between mb-10">
             <div className="flex flex-col">
               <h3 className="text-sm font-black text-white uppercase italic tracking-[0.2em] mb-1">
                 Recent Closed Cases
               </h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Transaction Stream</p>
             </div>
             <button className="text-[10px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-[0.2em] flex items-center gap-1.5 group/btn bg-primary/5 px-4 py-2 rounded-full border border-primary/20">
               Market History <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
             </button>
           </div>
           
           <div className="overflow-x-auto -mx-2">
             <table className="w-full text-left min-w-[600px]">
               <thead>
                 <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5">
                   <th className="pb-6 px-4">Client Entity</th>
                    <th className="pb-6 px-4 text-indigo-400">Plan</th>
                   <th className="pb-6 px-4">Vertical</th>
                   <th className="pb-6 px-4">Project Status</th>
                   <th className="pb-6 px-4">Value (RM)</th>
                    <th className="pb-6 px-4 text-center">PIC (Assign)</th>
                   <th className="pb-6 px-4">Date</th>
                 </tr>
               </thead>
               <tbody className="text-[11px] font-bold text-white">
                 {[
                   { name: 'Sunshine Real Estate Co.', plan: 'Enterprise', industry: 'Real Estate', amount: '128,690', rep: 'Alex Wang', pic: 'Michael Tan', repImg: 'https://api.dicebear.com/7.x/notionists/svg?seed=wang', date: 'May 31', status: 'Implementation', statusColor: 'text-blue-400' },
                   { name: 'Qihang Education Group', plan: 'Business', industry: 'Education', amount: '98,540', rep: 'Sarah Li', pic: 'Wilson Khoo', repImg: 'https://api.dicebear.com/7.x/notionists/svg?seed=li', date: 'May 30', status: 'In Review', statusColor: 'text-amber-400' },
                   { name: 'Global Financial Services', plan: 'Professional', industry: 'Finance', amount: '76,320', rep: 'David Chen', pic: 'Michael Tan', repImg: 'https://api.dicebear.com/7.x/notionists/svg?seed=chen', date: 'May 29', status: 'Active', statusColor: 'text-emerald-400' },
                   { name: 'Smart Tech Manufacturing', plan: 'Enterprise', industry: 'Technology', amount: '112,300', rep: 'Alex Wang', pic: 'Wilson Khoo', repImg: 'https://api.dicebear.com/7.x/notionists/svg?seed=wang', date: 'May 28', status: 'Implementation', statusColor: 'text-blue-400' },
                   { name: 'Youyi Retail Trade', plan: 'Lite', industry: 'Retail', amount: '68,210', rep: 'Lily Zhang', pic: 'Michael Tan', repImg: 'https://api.dicebear.com/7.x/notionists/svg?seed=zhang', date: 'May 27', status: 'Pending', statusColor: 'text-slate-400' },
                 ].map((row, i) => (
                   <tr key={i} className="group/row hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0">
                     <td className="py-5 px-4">
                       <span className="font-black text-white/90 group-hover/row:text-primary transition-colors">{row.name}</span>
                     </td>
                     <td className="py-5 px-4">
                        <span className="text-[10px] bg-indigo-500/10 px-2 py-1 rounded border border-white/5 text-indigo-400 font-black">{row.plan}</span>
                      </td>
                      <td className="py-5 px-4 text-slate-500 uppercase tracking-widest text-[9px]">{row.industry}</td>
                     <td className="py-5 px-4 text-[9px] uppercase tracking-widest">
                       <span className={`font-black ${row.statusColor}`}>{row.status}</span>
                     </td>
                     <td className="py-5 px-4 font-black">
                       <span className="text-[#00ff9d] bg-[#00ff9d]/5 px-2 py-1 rounded-lg border border-[#00ff9d]/10">RM {row.amount}</span>
                     </td>
                     <td className="py-5 px-4 text-center">
                        <span className="text-slate-400 text-[10px] font-medium italic">by {row.pic}</span>
                      </td>
                      <td className="py-5 px-4 text-slate-500 font-mono text-[10px] tracking-tighter text-right">{row.date}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Assigned Department Template */}
      {activeTemplate === 'sales_dashboard_v1' && (
        <div className="w-screen ml-[calc(50%-50vw)] relative z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 mt-8 mb-8 pt-8 pb-12 border-y border-slate-200 dark:border-white/5">
          <div className="w-full">
            <div className="flex items-center justify-between mb-8 px-2 sm:px-4 md:px-6">
              <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2 text-slate-900 dark:text-white">
                 <div className="w-1.5 h-6 bg-secondary rounded-full" />
                 Sales Department Dashboard
              </h3>
              <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-full font-bold uppercase tracking-widest">Active Template</span>
            </div>
            <div className="w-full">
              <SalesDashboardTemplate />
            </div>
          </div>
        </div>
      )}

            {/* Task Manager (Kanban / Calendar) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2 text-slate-900 dark:text-white">
             <div className="w-1.5 h-6 bg-primary rounded-full" />
             Task Manager
          </h3>
          </div>
        </div>

        {/* Manager AI Assessment Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-4 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[30px] -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-500" />
           <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5 relative z-10 text-primary">
              <Activity size={20} />
           </div>
           <div className="relative z-10 flex-1">
             <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-wider flex items-center gap-2">
               AI Manager Insight
               <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-primary/20">Task Suggestion</span>
             </h4>
             <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
               Hey {user?.displayName?.split(' ')[0] || 'there'}, you have <strong>{todos.filter(t => !t.completed && t.status !== 'done').length}</strong> pending tasks. Try clearing your older "In Progress" items before Friday to maintain your solid closing rate! Let's get things moving.
             </p>
           </div>
        </div>

        {/* Task Board Area */}
        {taskView === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 min-h-[500px]">
             {['todo', 'in_progress', 'done'].map((status) => {
                const columnTasks = todos.filter(t => (status === 'todo' && (!t.status || t.status === 'todo')) || t.status === status);
                return (
                  <div 
                    key={status} 
                    className="bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-white/5 rounded-3xl p-4 sm:p-6 flex flex-col h-full shadow-sm"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const todoId = e.dataTransfer.getData('text/plain');
                      if (todoId) {
                         moveTodoStatus(todoId, status as any);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-4 shrink-0">
                       <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-widest text-sm">
                          {status === 'todo' && <><div className="w-2 h-2 rounded-full bg-slate-400" /> To Do</>}
                          {status === 'in_progress' && <><div className="w-2 h-2 rounded-full bg-blue-500" /> In Progress</>}
                          {status === 'done' && <><div className="w-2 h-2 rounded-full bg-emerald-500" /> Done</>}
                       </h4>
                       <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-4">
                       {columnTasks.map(todo => (
                         <div 
                           key={todo.id} 
                           draggable
                           onDragStart={(e) => {
                             e.dataTransfer.setData('text/plain', todo.id);
                           }}
                           className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm group hover:border-primary/30 transition-all flex flex-col gap-3 relative cursor-grab active:cursor-grabbing hover:shadow-md"
                         >
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 z-20">
                              <button onClick={() => setEditingTodo(todo)} className="p-1.5 text-slate-400 hover:text-blue-500 bg-slate-50 dark:bg-slate-900 rounded-md" title="Add Label"><Edit2 size={12} /></button>
                              <button onClick={() => deleteTodo(todo.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-900 rounded-md" title="Delete Task"><Trash2 size={12} /></button>
                            </div>

                            <p 
                               onClick={() => setEditingTodo(todo)}
                               className={cn("text-sm font-medium mt-1 pr-16 cursor-text hover:text-primary transition-colors", todo.completed ? "text-slate-400 line-through hover:text-slate-500" : "text-slate-700 dark:text-slate-200")}
                               title="Click to edit"
                            >
                               {todo.text}
                            </p>
                            <div className="flex items-center justify-between mt-auto">
                               <div className="flex items-center gap-2 flex-wrap">
                                 {todo.dueDate && (
                                   <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md">
                                     <Calendar size={10} /> {new Date(todo.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: todo.dueDate.includes('T') ? '2-digit' : undefined, minute: todo.dueDate.includes('T') ? '2-digit' : undefined })}
                                   </span>
                                 )}

                                 {todo.label && (
                                   <span className={`text-[9px] uppercase font-bold tracking-widest border px-1.5 py-0.5 rounded ${getLabelColor(todo.labelColor)}`}>
                                     {todo.label}
                                   </span>
                                 )}
                               </div>
                            </div>
                         </div>
                       ))}
                       
                       {status === 'todo' && (
                         <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50 mt-4">
                            <button 
                              onClick={() => setEditingTodo({id: '', text: '', completed: false, status: 'todo', createdAt: Date.now()})}
                              className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-bold uppercase tracking-widest"
                            >
                              <Plus size={14} /> Add New Task
                            </button>
                         </div>
                       )}

                       {columnTasks.length === 0 && status !== 'todo' && (
                         <div className="text-center py-8 text-xs text-slate-400 font-medium border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                           Drop tasks here
                         </div>
                       )}
                    </div>
                  </div>
                )
             })}
          </div>
        )}

        {/* Task Day Modal */}
      <AnimatePresence>
        {selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDate(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/10"
            >
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                   <Calendar className="text-primary" size={20} /> 
                   {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                 </h3>
                 <button
                   onClick={() => setSelectedDate(null)}
                   className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                 >
                   <X size={18} />
                 </button>
               </div>

               <div className="space-y-3 mb-6">
                 {todos.filter(t => t.dueDate === selectedDate).length === 0 ? (
                   <div className="text-center py-6 text-sm text-slate-400 italic">No tasks due on this date.</div>
                 ) : (
                   todos.filter(t => t.dueDate === selectedDate).map(todo => (
                     <div key={todo.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                           <input 
                             type="checkbox"
                             checked={todo.completed}
                             onChange={() => moveTodoStatus(todo.id, todo.completed ? 'todo' : 'done')}
                             className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                           />
                           <span className={cn("text-sm font-medium", todo.completed && "line-through text-slate-400")}>{todo.text}</span>
                        </div>
                     </div>
                   ))
                 )}
               </div>

               <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={newTodo}
                       onChange={e => setNewTodo(e.target.value)}
                       onKeyDown={e => {
                         if (e.key === 'Enter' && newTodo.trim()) {
                            const nt = {
                              id: Date.now().toString(),
                              text: newTodo,
                              completed: false,
                              createdAt: Date.now(),
                              status: 'todo',
                              dueDate: selectedDate
                            };
                            const updated = [nt, ...todos];
                            setTodos(updated);
                            setNewTodo('');
                            if (user) updateDoc(doc(db, 'users', user.uid), { todos: updated }).catch(console.error);
                         }
                       }}
                       placeholder="Add task for this day..."
                       className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                     />
                     <button
                       onClick={() => {
                         if (newTodo.trim()) {
                            const nt = {
                              id: Date.now().toString(),
                              text: newTodo,
                              completed: false,
                              createdAt: Date.now(),
                              status: 'todo',
                              dueDate: selectedDate
                            };
                            const updated = [nt, ...todos];
                            setTodos(updated);
                            setNewTodo('');
                            if (user) updateDoc(doc(db, 'users', user.uid), { todos: updated }).catch(console.error);
                         }
                       }}
                       className="bg-primary text-white p-2 rounded-xl"
                     >
                       <Plus size={16} />
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
{/* Upload & Crop Modal */}
      <AnimatePresence>
        {imageToCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImageToCrop(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col items-center overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="w-full flex items-center justify-between mb-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white italic flex items-center gap-2">
                  <Camera className="text-primary" size={20} /> Edit Avatar
                </h3>
                <button
                  onClick={() => setImageToCrop(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Crop Area */}
              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Zoom Control */}
              <div className="w-full mt-6 flex items-center gap-4 px-4">
                <ZoomOut size={18} className="text-slate-400" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => {
                    setZoom(Number(e.target.value));
                  }}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <ZoomIn size={18} className="text-slate-400" />
              </div>

              {/* Actions */}
              <button
                onClick={completeCropping}
                disabled={isUploading}
                className="mt-8 w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <RefreshCcw className="animate-spin" size={18} />
                ) : (
                  <>
                    <Check size={18} /> Update Avatar
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
          {editingTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Edit Task</h3>
              <button onClick={() => setEditingTodo(null)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-slate-500 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <input 
                  type="text" 
                  value={editingTodo.text}
                  onChange={e => setEditingTodo({...editingTodo, text: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Label Options</label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_LABELS.map(l => (
                      <button
                        key={l.name}
                        onClick={() => setEditingTodo({...editingTodo, label: l.name, labelColor: l.color})}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                          editingTodo.label === l.name 
                            ? getLabelColor(l.color === '' ? undefined : l.color)
                            : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        )}
                      >
                        {l.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setEditingTodo({...editingTodo, label: '', labelColor: ''})}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                        !editingTodo.label 
                          ? "bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent"
                      )}
                    >
                      None
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Custom Label Text</label>
                  <input 
                    type="text" 
                    placeholder="Or type a custom label..."
                    value={editingTodo.label || ''}
                    onChange={e => setEditingTodo({...editingTodo, label: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Label Color Override</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: '', color: 'bg-blue-500' },
                      { value: 'emerald', color: 'bg-emerald-500' },
                      { value: 'amber', color: 'bg-amber-500' },
                      { value: 'red', color: 'bg-red-500' },
                      { value: 'purple', color: 'bg-purple-500' },
                      { value: 'pink', color: 'bg-pink-500' },
                      { value: 'slate', color: 'bg-slate-500' }
                    ].map(c => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingTodo({ ...editingTodo, labelColor: c.value });
                        }}
                        className={`w-6 h-6 rounded-full transition-all ${c.color} ${(editingTodo.labelColor || '') === c.value ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Due Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={editingTodo.dueDate || ''}
                    onChange={e => setEditingTodo({...editingTodo, dueDate: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                  />
                </div>

              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setEditingTodo(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              {editingTodo.id !== '' && (
                <button 
                  onClick={() => {
                    const updated = todos.filter(t => t.id !== editingTodo.id);
                    setTodos(updated);
                    if (user) updateDoc(doc(db, 'users', user.uid), { todos: updated }).catch(console.error);
                    setEditingTodo(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  Delete
                </button>
              )}
              <button 
                onClick={() => {
                  let updated = [...todos];
                  if (editingTodo.id === '') {
                    updated.push({ ...editingTodo, id: Date.now().toString() });
                  } else {
                    updated = todos.map(t => t.id === editingTodo.id ? editingTodo : t);
                  }
                  setTodos(updated);
                  if (user) updateDoc(doc(db, 'users', user.uid), { todos: updated }).catch(console.error);
                  setEditingTodo(null);
                }}
                className="flex-[2] px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
