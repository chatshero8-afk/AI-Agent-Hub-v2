import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, UserCog, Check, AlertCircle, Plus, Trash2, Mail } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';

export default function Settings() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [whitelist, setWhitelist] = useState<{ id: string, email: string }[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  if (profile?.role !== 'admin') {
    return <Navigate to="/hub" />;
  }

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubWhitelist = onSnapshot(collection(db, 'allowedEmails'), (snapshot) => {
      const whitelistData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        email: doc.data().email 
      }));
      setWhitelist(whitelistData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'allowedEmails');
    });

    return () => {
      unsubUsers();
      unsubWhitelist();
    };
  }, []);

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || isAdding) return;
    
    setIsAdding(true);
    try {
      await addDoc(collection(db, 'allowedEmails'), {
        email: newEmail.toLowerCase().trim(),
        addedAt: serverTimestamp()
      });
      setNewEmail('');
    } catch (error) {
      console.error("Error adding to whitelist:", error);
      handleFirestoreError(error, OperationType.CREATE, 'allowedEmails');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveWhitelist = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'allowedEmails', id));
    } catch (error) {
      console.error("Error removing from whitelist:", error);
      handleFirestoreError(error, OperationType.DELETE, 'allowedEmails');
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    if (uid === profile?.uid) return; // Cannot change own role here
    try {
      await updateDoc(doc(db, 'users', uid), { 
        role: newRole,
        isAdmin: newRole === 'admin'
      });
    } catch (error) {
      console.error("Error updating role:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleUpdateInternshipEnd = async (uid: string, date: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { internshipEndDate: date });
    } catch (error) {
      console.error("Error updating internship date:", error);
    }
  };

  const handleUpdateAttendanceStreak = async (uid: string, streak: number) => {
    try {
      await updateDoc(doc(db, 'users', uid), { attendanceStreak: streak });
    } catch (error) {
      console.error("Error updating attendance streak:", error);
    }
  };

  // Auto-remove interns if period arrived
  useEffect(() => {
    if (loading || !users.length) return;
    
    users.forEach(async (u) => {
      if ((u.role === 'Intern IT' || u.role === 'Intern Graphic') && u.internshipEndDate) {
        if (new Date(u.internshipEndDate).getTime() < new Date().getTime()) {
          try {
            await updateDoc(doc(db, 'users', u.uid), { role: 'pending', internshipEndDate: '' });
          } catch (error) {
            console.error("Failed to auto-remove intern", error);
          }
        }
      }
    });
  }, [users, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Shield className="text-primary" size={32} />
          System Settings
        </h1>
        <p className="text-slate-500 font-medium max-w-2xl">
          Manage user access and roles. Only authorized administrators can view and modify these settings.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2 px-2">
            <UserCog className="text-slate-400" size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Employee Directory</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-950/50">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Current Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserCog className="w-full h-full p-2 text-slate-400" />
                            )}
                          </div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {u.name}
                            {u.uid === profile.uid && <span className="ml-2 text-[10px] text-primary uppercase tracking-widest">(You)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.role === 'admin' ? 'bg-primary/20 text-primary' :
                          u.role === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-emerald-500/20 text-emerald-500'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.uid !== profile.uid ? (
                          <div className="flex flex-col items-end gap-2">
                            <select 
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                              className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/50"
                            >
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="pending">Pending</option>
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="Intern IT">Intern IT</option>
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="Intern Graphic">Intern Graphic</option>
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="Junior IT">Junior IT</option>
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="Senior IT">Senior IT</option>
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="Private">Private</option>
                              <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" value="admin">Admin</option>
                            </select>
                            {(u.role === 'Intern IT' || u.role === 'Intern Graphic') && (
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] text-slate-400 font-bold uppercase">End Date:</span>
                                 <input 
                                   type="date" 
                                   value={u.internshipEndDate || ''} 
                                   onChange={(e) => handleUpdateInternshipEnd(u.uid, e.target.value)}
                                   className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/50"
                                 />
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase" title="Streak months">Bonus Streak:</span>
                              <input 
                                type="number" 
                                min="0"
                                value={u.attendanceStreak || 0} 
                                onChange={(e) => handleUpdateAttendanceStreak(u.uid, parseInt(e.target.value) || 0)}
                                className="w-16 bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/50 text-right"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-right text-xs text-slate-400 italic">No Actions</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dashboard Whitelist */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Mail className="text-primary" size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Dashboard Whitelist</h2>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-6">
            <form onSubmit={handleAddWhitelist} className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Trusted Email</p>
              <div className="flex gap-2">
                <input 
                  type="email"
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none text-sm font-medium rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50"
                  required
                />
                <button 
                  type="submit"
                  disabled={isAdding}
                  className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Access</p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {whitelist.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400 italic">No whitelisted emails yet.</p>
                  </div>
                ) : (
                  whitelist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Check className="text-emerald-500" size={14} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                          {item.email}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRemoveWhitelist(item.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
                
                {/* Visual indicator for hardcoded emails */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 italic">System Superusers (Always Whitelisted)</p>
                  <div className="space-y-2 opacity-60">
                    {['chatshero8@gmail.com', 'irishng01@gmail.com'].map(email => (
                      <div key={email} className="flex items-center gap-3 p-3 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                         <Shield className="text-slate-400" size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
