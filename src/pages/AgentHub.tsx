import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEPARTMENTS, MOCK_AGENTS } from '@/constants';
import AgentCard from '@/components/AgentCard';
import Hero from '@/components/Hero';
import ChatModal from '@/components/ChatModal';
import CreateAgentModal from '@/components/CreateAgentModal';
import AgentInfoModal from '@/components/AgentInfoModal';
import { cn } from '@/lib/utils';
import { Search, SlidersHorizontal, Plus, Database, ArchiveRestore, Trash2 } from 'lucide-react';
import { Agent } from '../types';
import { collection, onSnapshot, query, orderBy, deleteDoc, updateDoc, doc, where, or, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { playWinningSound } from '../lib/sounds';
import HolidayBar from '../components/HolidayBar';

export default function AgentHub() {
  const { user, profile } = useAuth();
  const [activeDept, setActiveDept] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [dbAgents, setDbAgents] = useState<Agent[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoAgent, setInfoAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrashView, setIsTrashView] = useState(false);

  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Sound and TTS announcement
  const announceCreation = useCallback((userName: string) => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(`${userName} has successfully created AI agent!`);
        msg.rate = 1.0;
        msg.pitch = 1.1;
        window.speechSynthesis.speak(msg);
      }
    } catch (e) {
      console.warn('Notification error:', e);
    }
  }, []);

  // Listen for global creation events
  useEffect(() => {
    const q = query(
      collection(db, 'global_events'), 
      where('type', '==', 'agent_created'),
      orderBy('createdAt', 'desc'), 
      limit(1)
    );
    
    let isFirstLoad = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoad) {
        isFirstLoad = false;
        return;
      }
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Only announce if it's not from the current user
          if (data.userId !== user?.uid) {
            announceCreation(data.userName || 'A user');
          }
        }
      });
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'global_events');
    });
    
    return () => unsubscribe();
  }, [announceCreation]);

  useEffect(() => {
    if (!user) return;
    
    // Build a secure query that aligns with Firestore rules
    // Rule allows: public agents OR owner's agents OR (for admin) anything
    let q;
    if (profile?.role === 'admin') {
      q = query(collection(db, 'agents'), orderBy('createdAt', 'desc'));
    } else {
      q = query(
        collection(db, 'agents'), 
        or(
          where('visibility', '==', 'public'),
          where('ownerId', '==', user.uid)
        ),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
      
      // Auto-delete logic
      const now = new Date();
      agents.forEach(async (agent) => {
        if (agent.isDeleted && agent.deletedAt) {
          const deletedDate = new Date(agent.deletedAt);
          const diffDays = (now.getTime() - deletedDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays >= 360) {
            try {
              await deleteDoc(doc(db, 'agents', agent.id));
            } catch (err) {
              console.error("Failed to auto-delete agent", err);
            }
          }
        }
      });

      setDbAgents(agents);
      setLoading(false);
    }, (error) => {
      console.error("Agents snapshot error:", error);
      setLoading(false); // Stop spinner even if error
    });
    return unsubscribe;
  }, []);

  const allAgents = [...dbAgents, ...MOCK_AGENTS.filter(ma => !dbAgents.some(da => da.name === ma.name))];
  
  // Ensure "The Shop" is always first
  allAgents.sort((a, b) => {
    if (a.id === 'master-archivist') return -1;
    if (b.id === 'master-archivist') return 1;
    return 0;
  });

  const canViewAgent = (agent: Agent) => {
    if (!agent.ownerId) return true;
    if (!agent.visibility || agent.visibility === 'public') return true;
    if (agent.ownerId === user?.uid) return true;
    if (profile?.role === 'admin') return true; // Admins can see everything
    if (profile?.role && agent.allowedRoles && agent.allowedRoles.includes(profile.role)) return true;
    if (profile?.email && agent.allowedEmails && agent.allowedEmails.includes(profile.email)) return true;
    return false;
  };

  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);

  const filteredAgents = allAgents.filter(agent => {
    if (!canViewAgent(agent)) return false;
    
    // Trash / Active check
    if (isTrashView) {
      if (!agent.isDeleted) return false;
    } else {
      if (agent.isDeleted) return false;
    }

    const matchesDept = activeDept === 'All' || agent.department === activeDept;
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase()) || 
                          agent.role.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleDeleteClick = (agent: Agent) => {
    setDeletingAgent(agent);
  };

  const confirmDelete = async () => {
    if (!deletingAgent) return;
    if (!deletingAgent.id) {
      setDeletingAgent(null);
      return; 
    }
    if (deletingAgent.ownerId !== user?.uid && profile?.role !== 'admin') {
      console.error("You don't have permission to delete this agent.");
      setDeletingAgent(null);
      return;
    }
    try {
      if (isTrashView) {
        // Hard delete
        await deleteDoc(doc(db, 'agents', deletingAgent.id));
      } else {
        // Soft delete
        await updateDoc(doc(db, 'agents', deletingAgent.id), {
          isDeleted: true,
          deletedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error deleting agent:", err);
    } finally {
      setDeletingAgent(null);
    }
  };

  const handleRestore = async (agent: Agent) => {
    if (!agent.id) return;
    try {
      await updateDoc(doc(db, 'agents', agent.id), {
        isDeleted: false,
        deletedAt: null
      });
    } catch (err) {
      console.error("Error restoring agent:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Holiday Notification Bar */}
      <HolidayBar />

      {/* Hero Spotlight */}
      <Hero />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-6 rounded-[2rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 uppercase italic leading-none">
            <span className="shimmer-text">ChatsHero</span> <br className="hidden md:block"/> <span className="text-primary shimmer-text">Intelligence Hub</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">
            Assemble your elite AI workforce. <br className="hidden sm:block"/> Optimized for peak business synergy.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Locate AI Units..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
            <button 
              onClick={() => setIsTrashView(!isTrashView)}
              className={cn(
                "p-3 rounded-2xl transition-all shadow-sm border backdrop-blur-xl",
                isTrashView ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 shadow-red-500/20" : "bg-white/50 dark:bg-slate-950/50 text-slate-500 border-white/60 dark:border-white/10 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20"
              )}
              title={isTrashView ? "Back to Agents" : "View Trash"}
            >
              {isTrashView ? <ArchiveRestore size={20} /> : <Trash2 size={20} />}
            </button>
            {!isTrashView && profile?.role !== 'Intern IT' && profile?.role !== 'Intern Graphic' && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/30 ai-pulse"
              >
                <Plus size={18} />
                Add Agent
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
        <button
          onClick={() => setActiveDept('All')}
          className={cn(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border backdrop-blur-md",
            activeDept === 'All' 
              ? "bg-primary text-white border-transparent shadow-lg shadow-primary/20" 
              : "bg-white/70 dark:bg-slate-900/40 text-slate-500 border-slate-200/50 dark:border-white/10 hover:border-primary/30 hover:bg-white/90 dark:hover:bg-slate-800/60"
          )}
        >
          All Units
        </button>
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setActiveDept(dept.id)}
            className={cn(
               "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border backdrop-blur-md",
               activeDept === dept.id 
                 ? "bg-primary text-white border-transparent shadow-lg shadow-primary/20" 
                 : "bg-white/70 dark:bg-slate-900/40 text-slate-500 border-slate-200/50 dark:border-white/10 hover:border-primary/30 hover:bg-white/90 dark:hover:bg-slate-800/60"
            )}
          >
            <span className="text-base">{dept.icon}</span>
            {dept.label}
          </button>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[3rem] border-4 border-dashed border-slate-200/50 dark:border-white/10 shadow-xl">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Agent Registry...</p>
          </div>
        ) : filteredAgents.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredAgents.map((agent, index) => (
                <AgentCard 
                  key={agent.id} 
                  agent={agent} 
                  index={index} 
                  level={
                    allAgents
                      .filter(a => a.ownerId === agent.ownerId)
                      .length - 
                    allAgents
                      .filter(a => a.ownerId === agent.ownerId)
                      .findIndex(a => a.id === agent.id)
                  }
                  onRun={(agent) => {
                    playWinningSound();
                    setInfoAgent(agent);
                    setShowInfoModal(true);
                  }}
                  onEdit={(agent) => {
                    setEditingAgent(agent);
                    setShowCreateModal(true);
                  }}
                  onDelete={handleDeleteClick}
                  onRestore={handleRestore}
                  isTrashView={isTrashView}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[3rem] border-4 border-dashed border-slate-200/50 dark:border-white/10 shadow-xl"
          >
            <p className="text-slate-400 font-black uppercase tracking-tighter text-3xl italic opacity-50">
              {isTrashView ? "Trash is empty." : "Sector clear. No AI units detected."}
            </p>
          </motion.div>
        )}
      </div>

      <ChatModal 
        agent={selectedAgent} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      <CreateAgentModal 
        isOpen={showCreateModal}
        agentToEdit={editingAgent}
        existingAgents={dbAgents}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAgent(null);
        }}
      />

      <AgentInfoModal 
        isOpen={showInfoModal}
        agent={infoAgent}
        allAgents={allAgents}
        onClose={() => {
          setShowInfoModal(false);
          setInfoAgent(null);
        }}
      />

      <AnimatePresence>
        {deletingAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20 dark:border-white/10"
            >
              <h3 className="text-2xl font-black mb-4">{isTrashView ? "Permanently Delete" : "Send to Trash"}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                {isTrashView 
                  ? `Are you sure you want to permanently delete "${deletingAgent.name}"? This action cannot be undone.`
                  : `Are you sure you want to move "${deletingAgent.name}" to the trash? It will be auto-deleted after 360 days.`}
              </p>
              <div className="flex gap-4 justify-end">
                <button 
                  onClick={() => setDeletingAgent(null)}
                  className="px-6 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-6 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/20"
                >
                  {isTrashView ? "Delete Permanently" : "Move to Trash"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
