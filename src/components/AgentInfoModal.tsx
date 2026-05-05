import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Zap, Search, Shield } from 'lucide-react';
import { Agent } from '../types';
import { cn } from '../lib/utils';

interface AgentInfoModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  allAgents: Agent[];
}

export default function AgentInfoModal({ agent, isOpen, onClose, allAgents }: AgentInfoModalProps) {
  if (!agent) return null;

  const isMaster = agent.id === 'master-archivist';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl border border-white/20 dark:border-white/5 flex flex-col overflow-hidden max-h-[85vh]",
              isMaster ? "max-w-5xl" : "max-w-xl"
            )}
          >
            {/* Header / Avatar Section - Hidden for Master Archivist to save space */}
            {!isMaster && (
              <div className="relative h-40 bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent flex items-center justify-center overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.3),transparent_70%)]" />
                  </div>
                  
                  <motion.img 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      src={agent.imageUrl} 
                      alt={agent.name}
                      className="h-32 w-32 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] z-10"
                  />
                  
                  <button 
                      onClick={onClose}
                      className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl text-white transition-all z-20 border border-white/10"
                  >
                      <X size={18} />
                  </button>
              </div>
            )}

            {/* Content Area */}
            <div className={cn("space-y-4 overflow-y-auto no-scrollbar", isMaster ? "p-8" : "p-6")}>
                <div className="flex justify-between items-start">
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                            "px-1.5 py-0.5 rounded-full text-white text-[7px] font-black uppercase tracking-widest",
                            isMaster ? "bg-primary" : "bg-primary/20 text-primary border border-primary/20"
                            )}>
                                {isMaster ? 'CORE SYSTEM' : agent.department}
                            </span>
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Shield size={7} /> {agent.visibility || 'public'}
                            </span>
                        </div>
                        <h2 className={cn(
                            "font-black tracking-tighter uppercase italic leading-none",
                            isMaster ? "text-4xl text-primary" : "text-3xl text-slate-900 dark:text-white"
                        )}>
                            {agent.name}
                        </h2>
                        <p className={cn(
                            "font-bold tracking-tight mt-1",
                            isMaster ? "text-sm text-slate-400" : "text-sm text-primary opacity-80"
                        )}>
                            {agent.role}
                        </p>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className={cn(
                  "rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5",
                  isMaster ? "p-6" : "p-5"
                )}>
                    <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
                        <Info size={9} className="text-primary" /> Briefing
                    </h4>
                    <p className={cn(
                      "text-slate-600 dark:text-slate-400 font-medium leading-relaxed",
                      isMaster ? "text-sm" : "text-sm"
                    )}>
                        {agent.description || "No specialized intelligence briefing provided for this unit."}
                    </p>
                </div>

                {isMaster && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Search size={12} className="text-primary" /> Intelligence Registry ({allAgents.length} Units)
                        </h4>
                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/40">
                            <div className="overflow-x-auto no-scrollbar max-h-[500px]">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-[110px]">Unit</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-[200px]">Designation</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Specialization</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest w-[150px] text-right">Architect</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {allAgents.map((a) => (
                                            <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-slate-100 dark:bg-white/5 group-hover:scale-110 transition-all shadow-md">
                                                        <img 
                                                            src={a.imageUrl} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[14px] font-black text-slate-900 dark:text-white block tracking-tighter uppercase leading-none">{a.name}</span>
                                                    <span className="text-[9px] font-bold text-primary/70 uppercase mt-1 block">{a.department}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-normal block">
                                                        {a.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{a.owner || 'System'}</span>
                                                        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary capitalize border border-primary/20">
                                                            {a.owner?.charAt(0) || '?'}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button 
                        onClick={onClose}
                        className="flex-grow px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-white/10"
                    >
                        Dismiss
                    </button>
                    <button 
                        onClick={() => {
                            onClose();
                            // If it's a normal agent, we could trigger run or chat here
                        }}
                        className="flex-grow px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                    >
                        Initiate Link <Zap size={14} className="fill-current" />
                    </button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
