import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Plus, Database, Sparkles } from 'lucide-react';
import { Department, Agent, UserRole } from '../types';
import { collection, addDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import { DEPARTMENTS } from '../constants';
import { playSuccessSound } from '../lib/sounds';
import { cn } from '../lib/utils';

const availableImages = [
  '1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg', '8.svg',
  '11.svg', '12.svg', '13.svg', '14.svg', '15.svg', '16.svg', '17.svg', '18.svg', '19.svg', '20.svg',
  '21.svg', '22.svg', '23.svg', '24.svg', '25.svg', '27.svg', '28.svg', '29.svg', '30.svg',
  '31.svg', '32.svg', '33.svg', '34.svg', '37.svg', '38.svg', '39.svg', '40.svg',
  '41.svg', '42.svg', '43.svg'
];

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
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'updated'>('idle');

  // Compute used images excluding the current agent (if editing)
  const getFilename = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return url.split('/').pop()?.split('?')[0] || '';
  };

  const usedImages = new Set<string>(
    existingAgents
      .filter(a => a.id !== agentToEdit?.id)
      .map(a => getFilename(a.imageUrl || ''))
      .filter(filename => !!filename && !filename.startsWith('http'))
  );

  React.useEffect(() => {
    if (agentToEdit) {
      setName(agentToEdit.name || '');
      setRole(agentToEdit.role || '');
      setDepartment((agentToEdit.department as Department) || 'IT');
      setDescription(agentToEdit.description || '');
      setExternalLink(agentToEdit.externalLink || '');
      setImageUrl(getFilename(agentToEdit.imageUrl || ''));
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
      let finalImageUrl = getFilename(imageUrl);
      
      // If no image selected, pick the first available and NOT used one
      if (!finalImageUrl) {
        const unused = availableImages.find(img => !usedImages.has(img)) || availableImages[0];
        finalImageUrl = unused;
      }

      const finalDescription = description || `A professional ${role} in the ${department} department, dedicated to excellence and innovation within the ChatsHero ecosystem.`;
      
      const payload: any = {
        name: name.trim(),
        role: role.trim(),
        department,
        description: finalDescription,
        avatar: '🤖',
        externalLink: externalLink.trim(),
        imageUrl: finalImageUrl,
        visibility,
        allowedRoles,
        allowedEmails: allowedEmails.split(',').map(e => e.trim()).filter(Boolean),
        isDeleted: false,
      };

      if (agentToEdit?.id) {
        const updateData: any = {
          ...payload,
          ownerId: agentToEdit.ownerId || user.uid,
          owner: agentToEdit.owner || profile?.name || user.displayName || 'ChatsHero Elite',
          createdAt: agentToEdit.createdAt || serverTimestamp(),
        };
        
        if (agentToEdit.ownerId === 'system') {
          updateData.ownerId = user.uid; // take ownership of mock agent
        }

        await setDoc(doc(db, 'agents', agentToEdit.id), updateData, { merge: true });
        
        playSuccessSound();
        setSubmitStatus('updated');
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
          setIsSubmitting(false);
        }, 1000);
        return;
      } else {
        await addDoc(collection(db, 'agents'), {
          ...payload,
          owner: profile?.name || user.displayName || 'ChatsHero Elite',
          ownerId: user.uid,
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
                        <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white" key={d.id} value={d.id}>{d.label.split(' ')[0]}</option>
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
                          disabled={isUsed}
                          title={isUsed ? "This visual persona is already deployed to another Agent" : "Select this visual persona"}
                          onClick={() => !isUsed && setImageUrl(opt)}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                            imageUrl === opt ? "border-primary ring-2 ring-primary/20 scale-95" : "border-slate-200 dark:border-white/5 opacity-60",
                            isUsed ? "opacity-30 cursor-not-allowed grayscale border-slate-800" : "hover:opacity-100 hover:border-primary/50"
                          )}
                        >
                          <img src={`/images/${opt}`} alt={`Option ${i+1}`} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                          {imageUrl === opt && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                              <Sparkles className="text-primary" size={20} />
                            </div>
                          )}
                          {isUsed && (
                             <div className="absolute inset-0 bg-slate-950/50 flex flex-col items-center justify-center pointer-events-none">
                                <Shield className="text-slate-400 mb-1" size={16} />
                                <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest px-1 text-center bg-slate-900/80 rounded block leading-tight">Taken</span>
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
                className={cn(
                  "w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2",
                  submitStatus === 'updated' 
                    ? "bg-emerald-500 shadow-emerald-500/30" 
                    : "bg-primary shadow-primary/30 disabled:opacity-50"
                )}
              >
                {submitStatus === 'updated' 
                  ? 'Updated!' 
                  : isSubmitting 
                    ? (agentToEdit ? 'Updating...' : 'Adding...') 
                    : (agentToEdit ? 'Update Agent' : 'Add Agent')}
                {submitStatus !== 'updated' && <Plus size={18} />}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
