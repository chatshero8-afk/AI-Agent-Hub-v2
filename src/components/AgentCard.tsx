import React from 'react';
import { motion } from 'motion/react';
import { Agent } from '@/types';
import { Shield, Zap, TrendingUp, User, ExternalLink, Pencil, Trash, ArchiveRestore } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

const availableImages = [
  '1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg', '8.svg',
  '11.svg', '12.svg', '13.svg', '14.svg', '15.svg', '16.svg', '17.svg', '18.svg', '19.svg', '20.svg',
  '21.svg', '22.svg', '23.svg', '24.svg', '25.svg', '27.svg', '28.svg', '29.svg', '30.svg',
  '31.svg', '32.svg', '33.svg', '34.svg', '37.svg', '38.svg', '39.svg', '40.svg',
  '41.svg', '42.svg', '43.svg'
];

export interface AgentCardProps {
  agent: Agent;
  index: number;
  level?: number;
  onRun?: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onRestore?: (agent: Agent) => void;
  isTrashView?: boolean;
  key?: string | number;
}

export default function AgentCard({ agent, index, level, onRun, onEdit, onDelete, onRestore, isTrashView }: AgentCardProps) {
  // Determine color based on department for the aura
  const getDeptColor = (dept: string) => {
    switch (dept) {
      case 'IT': return 'from-violet-500/30 to-transparent';
      case 'SalesMarketing': return 'from-fuchsia-500/30 to-transparent';
      case 'Graphic': return 'from-purple-500/30 to-transparent';
      case 'FinancialAdmin': return 'from-indigo-500/30 to-transparent';
      default: return 'from-primary/30 to-transparent';
    }
  };

  const { user, profile } = useAuth(); // We need to import useAuth
  const isOwner = user?.uid === agent.ownerId || profile?.role === 'admin';
  
  const canAccessLink = () => {
    if (!agent.ownerId) return true;
    if (isOwner) return true;
    if (agent.visibility === 'private') return false; // Viewers can't access link
    return true;
  };

  const getImageUrl = () => {
    if (agent.imageUrl) {
      if (agent.imageUrl.startsWith('http')) return agent.imageUrl;
      const filename = agent.imageUrl.split('/').pop()?.split('?')[0];
      return `/images/${filename}`;
    }
    // Basic deterministic hash from ID
    const hash = String(agent.id || agent.name || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const defaultFilename = availableImages[hash % availableImages.length];
    return `/images/${defaultFilename}`;
  };

  const isMaster = agent.id === 'master-archivist';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        delay: Math.min(index * 0.02, 0.2), 
        duration: 0.3, 
        ease: "easeOut"
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-2",
        isMaster && "scale-[1.02] z-10"
      )}
    >
      {/* Hero Portrait Area */}
      <div className={cn(
        "relative w-full aspect-[4/5] overflow-hidden rounded-3xl border transition-all duration-500 backdrop-blur-xl",
        isMaster 
          ? "border-amber-400/50 bg-slate-900/80 shadow-[0_0_30px_rgba(251,191,36,0.2)] group-hover:shadow-[0_0_60px_rgba(251,191,36,0.6)] group-hover:border-amber-400" 
          : "border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 shadow-[0_0_15px_rgba(139,92,246,0.1)] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] group-hover:border-primary/50"
      )}>
        
        {/* Card Main Image */}
        <div className="absolute inset-0 overflow-hidden z-0 border-none flex items-center justify-center">
          <img 
            src={getImageUrl()} 
            alt="" 
            className={cn(
              "w-[85%] h-[85%] object-contain transition-transform duration-700 group-hover:scale-[1.05]",
              isMaster && "drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]"
            )}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `/images/${availableImages[0]}`;
            }}
          />
          
          {/* Animated Background Aura (Overlaying Image slightly for blending) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 mix-blend-overlay">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className={cn(
                "absolute w-64 h-64 rounded-full bg-gradient-to-r blur-3xl opacity-50 group-hover:opacity-80 transition-opacity",
                isMaster ? "from-amber-500/40 to-transparent" : getDeptColor(agent.department)
              )}
            />
          </div>

          {/* Constant pulse glow overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent z-20 pointer-events-none" />
        </div>

        {/* Hero Branding Overlays */}
        <div className="absolute bottom-6 left-6 z-30">
          <motion.div 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-widest mb-2 inline-block",
              isMaster ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]"
            )}
          >
            {isMaster ? 'SYSTEM CORE' : 
             (agent.department === 'SalesMarketing' ? 'Marketing' : 
              agent.department === 'FinancialAdmin' ? 'Admin' : agent.department)}
          </motion.div>
          <h3 className={cn(
            "text-3xl font-black tracking-tighter leading-none transition-colors drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]",
            isMaster ? "text-amber-400 group-hover:text-amber-300" : "text-white group-hover:text-primary"
          )}>
            {agent.name}
          </h3>
          <p className="text-[12px] font-bold text-slate-300 uppercase tracking-[0.25em] mt-1 group-hover:text-white transition-colors">
            {agent.role.length > 40 ? agent.role.substring(0, 37) + '...' : agent.role}
          </p>
        </div>

        {/* Level Banner */}
        <div className="absolute top-6 left-0 z-30">
          <div className={cn(
            "backdrop-blur-md border-r border-y border-white/10 px-4 py-1 rounded-r-lg text-[10px] font-black text-white italic shadow-lg",
            isMaster ? "bg-amber-600/90 shadow-amber-500/20" : "bg-primary/90 shadow-primary/20"
          )}>
            {isMaster ? 'MAX LEVEL' : `LVL ${level || Math.floor(agent.tokensConsumed / 100000) + 1}`}
          </div>
        </div>

        {/* External Link Overlay */}
        {agent.externalLink && canAccessLink() && !isTrashView && (
          <a 
            href={agent.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-6 right-6 z-30 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all shadow-lg overflow-hidden group/link pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        )}

        {/* Trash Banner */}
        {isTrashView && agent.deletedAt && (
          <div className="absolute top-6 right-6 z-30">
            <div className="bg-red-500/90 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-white shadow-lg flex items-center gap-1.5">
              <Trash size={12} />
              {(() => {
                const deletedDate = new Date(agent.deletedAt!);
                const diffDays = Math.floor((new Date().getTime() - deletedDate.getTime()) / (1000 * 3600 * 24));
                const daysLeft = Math.max(0, 360 - diffDays);
                return `${daysLeft} days left`;
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Transparent Bottom Details */}
      <div className="mt-4 px-2 flex flex-col flex-grow">
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Architect</span>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase italic leading-tight">
                <img src="/icons/chatshero.webp" alt="ChatsHero" className="w-4 h-4 rounded-full object-cover" />
                {agent.owner}
              </span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                Forged {agent.createdAt?.toDate ? agent.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {(isOwner || !agent.ownerId) && !isTrashView && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(agent);
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary hover:border-primary/50 transition-all"
                  title="Edit Agent"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(agent);
                  }}
                  className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 hover:border-red-500/50 transition-all pointer-events-auto"
                  title="Delete Agent"
                >
                  <Trash size={14} />
                </button>
              </>
            )}
            
            {isTrashView ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore?.(agent);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                  title="Restore"
                >
                  <ArchiveRestore size={12} /> Restore
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(agent);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                  title="Permanent Delete"
                >
                  <Trash size={12} /> Delete
                </button>
              </>
            ) : (
              <button 
                onClick={() => onRun?.(agent)}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 hover:shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all shadow-lg active:scale-95 group-hover:shadow-primary/30"
              >
                Run <Zap size={10} className="fill-current" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
