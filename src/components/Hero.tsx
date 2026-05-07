import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, User, History } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Agent } from '../types';
import AILoader from './AILoader';
import { useAuth } from './AuthProvider';

const availableImages = [
  '1.svg', '2.svg', '3.svg', '4.svg', '5.svg', '6.svg', '7.svg', '8.svg',
  '11.svg', '12.svg', '13.svg', '14.svg', '15.svg', '16.svg', '17.svg', '18.svg', '19.svg', '20.svg',
  '21.svg', '22.svg', '23.svg', '24.svg', '25.svg', '27.svg', '28.svg', '29.svg', '30.svg',
  '31.svg', '32.svg', '33.svg', '34.svg', '37.svg', '38.svg', '39.svg', '40.svg',
  '41.svg', '42.svg', '43.svg'
];

export default function Hero() {
  const { user, profile } = useAuth();
  const [latestAgents, setLatestAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'agents'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allAgents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
      
      const filtered = allAgents.filter(agent => {
        if (!agent.ownerId) return true;
        if (!agent.visibility || agent.visibility === 'public') return true;
        if (agent.ownerId === user?.uid) return true;
        if (profile?.role === 'admin') return true;
        if (profile?.role && agent.allowedRoles && agent.allowedRoles.includes(profile.role)) return true;
        if (profile?.email && agent.allowedEmails && agent.allowedEmails.includes(profile.email)) return true;
        return false;
      }).slice(0, 4);

      setLatestAgents(filtered);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const latest = latestAgents[0];
  const previous = latestAgents.slice(1);

  const getAgentImage = (agent: Agent | undefined) => {
    if (!agent) return `/images/${availableImages[0]}`;
    if (agent.imageUrl) {
      if (agent.imageUrl.startsWith('http')) return agent.imageUrl;
      const filename = agent.imageUrl.split('/').pop()?.split('?')[0];
      return `/images/${filename}`;
    }
    // Basic deterministic hash
    const hash = String(agent.id || agent.name || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const defaultFilename = availableImages[hash % availableImages.length];
    return `/images/${defaultFilename}`;
  };

  const praises = [
    "Absolute Game Changer",
    "God-Tier Efficiency",
    "Digital Masterpiece",
    "Peak Intelligence",
    "Legendary Forge",
    "Superior Architect"
  ];

  // Pick a praise that changes daily but is stable for the session
  const randomPraise = praises[Math.floor(Date.now() / 86400000) % praises.length];

  return (
    <div className="relative w-full h-[450px] md:h-[550px] rounded-[2rem] overflow-hidden group mb-12 shadow-xl shadow-primary/20 bg-slate-100/50 dark:bg-slate-900/10 backdrop-blur-3xl border border-slate-200/50 dark:border-white/10">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        {/* Stage Lights */}
        <div className="absolute -top-1/4 left-[59%] -translate-x-1/2 w-[600px] h-[600px] bg-primary/30 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Stage Floor */}
        <div className="absolute bottom-[15%] left-[59%] -translate-x-1/2 w-[400px] h-[40px] bg-primary/20 blur-xl rounded-[100%] pointer-events-none" />
        <div className="absolute bottom-[15%] left-[59%] -translate-x-1/2 w-[250px] h-[2px] bg-primary/60 blur-[2px] rounded-[100%] pointer-events-none shadow-[0_0_40px_10px_#8b5cf6]" />

        {/* Stage Lights / Spotlight Effect */}
        <div className="absolute top-[-20%] left-[59%] -translate-x-1/2 w-[600px] h-[150%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,rgba(139,92,246,0.1)_40%,transparent_70%)] pointer-events-none z-0 blur-2xl mix-blend-screen" />
        <div 
          className="absolute top-[-10%] left-[59%] -translate-x-1/2 w-[250px] h-[120%] bg-gradient-to-b from-white/30 via-primary/20 to-transparent blur-3xl pointer-events-none z-10 mix-blend-screen" 
          style={{ clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)' }}
        />
        <div 
          className="absolute top-[-10%] left-[59%] -translate-x-1/2 w-[120px] h-[120%] bg-gradient-to-b from-white/50 via-white/10 to-transparent blur-xl pointer-events-none z-10 mix-blend-screen" 
          style={{ clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)' }}
        />

        <AnimatePresence mode="wait">
          <div className="absolute left-[59%] -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 w-[60%] h-[60%] flex items-center justify-center">
            <motion.img 
              key={latest?.id || 'default'}
              initial={{ opacity: 0, scale: 1.1, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
              transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
              exit={{ opacity: 0 }}
              src={getAgentImage(latest)}
              alt="Hero Banner"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `/images/${availableImages[0]}`;
              }}
            />
          </div>
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent pointer-events-none z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/10 to-transparent pointer-events-none z-20"></div>
      </div>

      {/* Aura */}
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[80px] -ml-40 -mb-40 z-10"
      />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-20">
        {loading ? (
          <div className="mb-12">
            <AILoader />
          </div>
        ) : (
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="max-w-6xl"
          >
          {latest ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/30">
                  New Legend Forged
                </span>
                <span className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] italic">
                  <Sparkles size={12} /> {randomPraise}
                </span>
              </div>
              
              <h1 className={`font-black text-white tracking-tighter uppercase italic leading-[0.95] pb-2 pr-8 mb-6 shimmer-text drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] max-w-[65%] break-words ${latest.name.length > 12 ? "text-4xl md:text-5xl lg:text-7xl" : "text-5xl md:text-7xl lg:text-[7rem]"}`}>
                {latest.name}
              </h1>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-slate-300 font-bold uppercase tracking-widest text-xs">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-xl overflow-hidden border border-white/20">
                    <img src="/icons/chatshero.webp" alt={latest.owner} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-0.5">Architect</p>
                    <p className="text-white">{latest.owner}</p>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-white/10" />
                
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Forge Date</span>
                  <span className="text-white text-xs font-bold uppercase tracking-tighter">
                    {latest.createdAt?.toDate ? latest.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Initial Era'}
                  </span>
                </div>

                <div className="h-10 w-px bg-white/10" />
                
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Active Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-white text-xs font-bold uppercase tracking-tighter">Unit Operational</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-white font-black italic text-4xl uppercase opacity-20">
              {loading ? 'Synthesizing Realm...' : 'No Agents Detected in Sector'}
            </div>
          )}
        </motion.div>
        )}
      </div>

      {/* History Sidebar */}
      <div className="absolute top-8 right-8 z-20 hidden lg:block">
        <div className="bg-slate-950/40 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] min-w-[280px] shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <img src="/icons/chatshero.webp" alt="" className="w-4 h-4 rounded-full object-cover" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Vanguard History</span>
          </div>
          
          <div className="space-y-6">
            {previous.length > 0 ? previous.map((agent) => (
              <motion.div 
                key={agent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 group/item"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover/item:bg-primary/20 group-hover/item:border-primary/40 transition-all overflow-hidden">
                  <img src={getAgentImage(agent)} alt={agent.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase text-sm truncate w-32 tracking-tighter italic">
                    {agent.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <img src="/icons/chatshero.webp" alt="" className="w-2.5 h-2.5 rounded-full object-cover" /> {agent.owner}
                  </p>
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                    Forged: {agent.createdAt?.toDate ? agent.createdAt.toDate().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Alpha'}
                  </p>
                </div>
              </motion.div>
            )) : !loading && (
              <p className="text-[10px] text-slate-500 font-bold uppercase italic p-4 text-center border border-dashed border-white/5 rounded-2xl">
                Waiting for legends...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
