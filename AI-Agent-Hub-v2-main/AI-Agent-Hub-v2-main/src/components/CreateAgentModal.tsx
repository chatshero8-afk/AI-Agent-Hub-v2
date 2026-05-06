import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Plus, Database, Sparkles } from 'lucide-react';
import { Department, Agent, UserRole } from '../types';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import { DEPARTMENTS } from '../constants';
import { playSuccessSound } from '../lib/sounds';

const localImagesGlob = import.meta.glob('/public/images/*.{svg,png,jpg,jpeg,webp,avif,gif}', { eager: true, import: 'default' });
const loadedImages = Object.values(localImagesGlob) as string[];
const availableImages = loadedImages.length > 0 ? loadedImages.slice().sort((a, b) => {
  const numA = parseInt(a.match(/(\d+)\./)?.[1] || '0', 10);
  const numB = parseInt(b.match(/(\d+)\./)?.[1] || '0', 10);
  return numA - numB;
}) : ['https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=2000'];

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentToEdit?: Agent | null;
  existingAgents?: Agent[];
}

export default function CreateAgentModal({ isOpen, onClose, agentToEdit, existingAgents = [] }: CreateAgentModalProps) {
  const { user, profile } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<Department>('IT');
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [allowedRoles, setAllowedRoles] = useState<UserRole[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute used images excluding the current agent (if editing)
  // We use the last part of the URL (the filename) to be robust against path changes
  const getFilename = (url: string) => url ? url.split('/').pop()?.split('?')[0] : null;
  const usedImages = new Set<string>(
    existingAgents
      .filter(a => a.id !== agentToEdit?.id)
      .map(a => a.imageUrl ? getFilename(a.imageUrl) as string : '')
      .filter(filename => !!filename)
  );

  React.useEffect(() => {
    if (agentToEdit) {
      setName(agentToEdit.name || '');
      setRole(agentToEdit.role || '');
      setDepartment((agentToEdit.department as Department) || 'IT');
      setDescription(agentToEdit.description || '');
      setExternalLink(agentToEdit.externalLink || '');
      setImageUrl(agentToEdit.imageUrl || '');
      setVisibility(agentToEdit.visibility || 'public');
      setAllowedRoles(agentToEdit.allowedRoles || []);
      setAllowedEmails(agentToEdit.allowedEmails?.join(', ') || '');
    } else {
      // Reset
      setName('');
      setRole('');
      setDepartment('IT');
      setDescription('');
      setExternalLink('');
      setImageUrl('');
      setVisibility('public');
      setAllowedRoles([]);
      setAllowedEmails('');
    }
  }, [agentToEdit, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const finalDescription = description || `A professional ${role} in the ${department} department, dedicated to excellence and innovation within the ChatsHero ecosystem.`;
      
      const payload = {
        name,
        role,
        department,
        description: finalDescription,
        avatar: '🤖',
        externalLink,
        imageUrl,
        visibility,
        allowedRoles,
        allowedEmails: allowedEmails.split(',').map(e => e.trim()).filter(Boolean),
      };

      if (agentToEdit?.id) {
        await updateDoc(doc(db, 'agents', agentToEdit.id), payload);
      } else {
        await addDoc(collection(db, 'agents'), {
          ...payload,
          owner: profile?.name || user.displayName || 'ChatsHero Elite',
          ownerId: user.uid,
          userId: user.uid,
          tokensConsumed: 0,
          powerLevel: Math.floor(Math.random() * 40) + 60,
          popularity: 0,
          createdAt: serverTimestamp(),
        });

        // Broadcast to all users
        await addDoc(collection(db, 'global_events'), {
          type: 'agent_created',
          userId: user.uid,
          userName: profile?.name || user.displayName || 'A user',
          message: `${profile?.name || user.displayName || 'A user'} has developed a new AI Agent!`,
          createdAt: serverTimestamp()
        });
      }

      playSuccessSound();
      onClose();
    } catch (error: any) {
      console.error('Error saving agent:', error);
      alert('Error saving agent: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-3">
                <Sparkles className="text-primary" size={24} />
                <h3 className="font-black tracking-tight text-xl italic uppercase">
                  {agentToEdit ? 'Update Agent' : 'Add New Agent'}
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-grow">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Agent Name</label>
                    <input 
                      required
                      type="text"
                      maxLength={15}
                      value={name}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^[A-Za-z\s]*$/.test(val)) {
                          setName(val);
                        }
                      }}
                      placeholder="e.g. Master Byte"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Dept</label>
                    <select 
                      value={department}
                      onChange={e => setDepartment(e.target.value as Department)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 h-[46px]"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d.id} value={d.id}>{d.label.split(' ')[0]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Professional Role</label>
                  <input 
                    required
                    type="text" 
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Lead Dev Advocate"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">External Portal (Link)</label>
                  <input 
                    type="url" 
                    value={externalLink}
                    onChange={e => setExternalLink(e.target.value)}
                    placeholder="https://chatshero.app/agent-x"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Visibility</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibility('public')}
                        className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${visibility === 'public' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibility('private')}
                        className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${visibility === 'private' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                      >
                         Private
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Allowed Roles (Private only)</label>
                    <div className={`grid grid-cols-2 gap-2 mt-1 ${visibility === 'public' ? 'opacity-50 pointer-events-none' : ''}`}>
                      {['Senior IT', 'Junior IT', 'Intern IT', 'Intern Graphic', 'Private'].map((r) => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-white/5">
                          <input 
                            type="checkbox" 
                            className="bg-slate-200 dark:bg-slate-900 border-none rounded text-primary focus:ring-0"
                            checked={allowedRoles.includes(r as UserRole)}
                            onChange={(e) => {
                              if (e.target.checked) setAllowedRoles([...allowedRoles, r as UserRole]);
                              else setAllowedRoles(allowedRoles.filter(role => role !== r));
                            }}
                          />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Visual Persona</label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableImages.map((opt, i) => {
                      const filename = getFilename(opt);
                      const isUsed = filename ? usedImages.has(filename) : false;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => !isUsed && setImageUrl(opt)}
                          disabled={isUsed}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            imageUrl === opt ? 'border-primary ring-2 ring-primary/20 scale-95' : 'border-slate-200 dark:border-white/5 opacity-60 hover:opacity-100 hover:border-primary/50'
                          } ${isUsed ? 'opacity-20 hover:opacity-20 cursor-not-allowed filter grayscale bg-slate-100 dark:bg-slate-800' : ''}`}
                        >
                          <img src={opt} alt={`Option ${i+1}`} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                          {imageUrl === opt && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                              <Sparkles className="text-primary" size={20} />
                            </div>
                          )}
                          {isUsed && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-[10px] font-black uppercase text-slate-500 bg-white/80 dark:bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">Taken</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (agentToEdit ? 'Updating...' : 'Adding...') : (agentToEdit ? 'Update Agent' : 'Add Agent')}
                <Plus size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
