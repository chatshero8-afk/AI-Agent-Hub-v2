import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, UserCog, Check, AlertCircle } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';

export default function Settings() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  if (profile?.role !== 'admin') {
    return <Navigate to="/hub" />;
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return unsubscribe;
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    if (uid === profile.uid) return; // Cannot change own role here
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleUpdateInternshipEnd = async (uid: string, date: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { internshipEndDate: date });
    } catch (error) {
      console.error("Error updating internship date:", error);
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

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none relative">
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
                          <option value="pending">Pending</option>
                          <option value="Intern IT">Intern IT</option>
                          <option value="Intern Graphic">Intern Graphic</option>
                          <option value="Junior IT">Junior IT</option>
                          <option value="Senior IT">Senior IT</option>
                          <option value="Private">Private</option>
                          <option value="admin">Admin</option>
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
                      </div>
                    ) : (
                      <div className="text-right text-xs text-slate-400 italic">Cannot edit own role</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
