import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Database, LayoutTemplate, Settings2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../components/AuthProvider';
import { Department } from '../types';
import { DEPARTMENTS } from '../constants';

interface DepartmentTemplate {
  id?: string;
  title: string;
  department: Department | 'All';
  type: string;
  ownerId: string;
}

export default function TemplatesAdmin() {
  const { user, profile } = useAuth();
  const [templates, setTemplates] = useState<DepartmentTemplate[]>([]);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<Department | 'All'>('All');
  const [type, setType] = useState('sales_dashboard_v1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'templates');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const templateList: DepartmentTemplate[] = [];
      snapshot.forEach(doc => {
        templateList.push({ id: doc.id, ...doc.data() } as DepartmentTemplate);
      });
      setTemplates(templateList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'templates');
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'templates'), {
        title,
        department,
        type,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTitle('');
    } catch (err) {
      console.error(err);
      alert('Failed to deploy template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this template?')) {
      await deleteDoc(doc(db, 'templates', id));
    }
  };

  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Access Denied. Admins only.</div>;
  }

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <LayoutTemplate size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Template Builder</h1>
          <p className="text-sm font-bold text-slate-500">Assign full-screen templates to departments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl h-fit sticky top-8">
          <h2 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2"><Settings2 size={16} /> Assign Template</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g., Q3 Sales Layout" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Target Department</label>
              <select value={department} onChange={e => setDepartment(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none">
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Template Store Collection</label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                <label className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${type === 'sales_dashboard_v1' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 bg-white dark:bg-slate-950'}`}>
                  <input type="radio" value="sales_dashboard_v1" checked={type === 'sales_dashboard_v1'} onChange={e => setType(e.target.value)} className="hidden" />
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
                    <LayoutTemplate size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">Sales Department<br/>Pro Dashboard</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1 leading-tight">Advanced tracking with integrated funnels and leaderboards.</p>
                  </div>
                </label>
                <label className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${type === 'marketing_dashboard_v1' ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 bg-white dark:bg-slate-950'}`}>
                  <input type="radio" value="marketing_dashboard_v1" checked={type === 'marketing_dashboard_v1'} onChange={e => setType(e.target.value)} className="hidden" />
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0 shadow-inner">
                    <LayoutTemplate size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">Marketing Analytics<br/>V1 Blueprint</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1 leading-tight">Campaign stats, robust engagement tracking.<br/>(Coming soon)</p>
                  </div>
                </label>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> Deploy to Department
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2"><LayoutTemplate size={16} /> Deployed Templates ({templates.length})</h2>
          {templates.map(w => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{w.title}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">{w.department}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{w.type.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <button onClick={() => w.id && handleDelete(w.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
          {templates.length === 0 && <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-bold">No templates deployed yet.</div>}
        </div>
      </div>
    </div>
  );
}
