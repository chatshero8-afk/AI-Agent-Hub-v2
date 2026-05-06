import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from 'recharts';
import { ANALYTICS_HISTORY, TOP_BUILDERS, MOCK_AGENTS } from '@/src/constants';
import { 
  Trophy, TrendingUp, Cpu, Activity, Medal, Star, 
  Smartphone, Headphones, Gift 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Agent } from '../types';

export default function Analytics() {
  const [dbAgents, setDbAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'agents'), (snapshot) => {
      const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
      setDbAgents(agents);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'agents');
    });
    return unsubscribe;
  }, []);

  const allAgents = [...dbAgents, ...MOCK_AGENTS.filter(ma => !dbAgents.some(da => da.name === ma.name))];

  const totalTokens = allAgents.reduce((acc, curr) => acc + (curr.tokensConsumed || 0), 0);
  const mostPowerful = [...allAgents].sort((a, b) => (b.powerLevel || 0) - (a.powerLevel || 0))[0] || { name: 'None', tokensConsumed: 0, avatar: '🤖' };
  const mostPopular = [...allAgents].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0] || { name: 'None', popularity: 0, avatar: '🤖' };

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Attempt autoplay, catch if blocked
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log('Autoplay blocked. User interaction required:', err);
      });
    }
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="space-y-10 pb-20 relative overflow-hidden">
      <FireflyPersona />
      {/* Background Epic Mission Music */}
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" 
        loop 
        className="hidden" 
        onError={() => console.error('Audio load error: The source could not be played')}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2 uppercase italic leading-none">
            <span className="shimmer-text">ChatsHero</span> <span className="text-primary italic shimmer-text">Intelligence Center</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
            Analyzing unit efficiency and architect global rankings.
          </p>
        </div>
        
        <button 
          onClick={toggleAudio}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-primary hover:text-white transition-colors"
        >
          {isPlaying ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Music On
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              Music Off (Tap to Play)
            </>
          )}
        </button>
      </div>

      {/* Annual Vanguard Rewards Section */}
      <div className="game-card border-none overflow-visible relative mb-8">
        <div className="absolute -top-4 -right-4 bg-primary px-4 py-2 rounded-xl shadow-lg shadow-primary/30 rotate-12 flex items-center gap-2 z-30">
          <Gift size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Rewards Unlocked</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch relative z-20">
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic shimmer-text">Annual Vanguard Rewards</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Exclusive Gear for Elite Architects</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Grand Prize: iPhone */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="group relative h-full flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all overflow-hidden"
              >
                <div className="h-32 mb-4 rounded-xl overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=400" 
                    alt="iPhone 17 Pro Max"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-1">
                    <Trophy size={10} className="text-primary" />
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Grand Prix</span>
                  </div>
                  <h3 className="text-xs font-black tracking-tight italic">iPhone 17 Pro Max</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 font-bold uppercase">$1,299 Value</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-black">Top 1</span>
                  </div>
                </div>
              </motion.div>

              {/* Samsung Prize */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="group relative h-full flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#3b82f6]/50 transition-all overflow-hidden"
              >
                <div className="h-32 mb-4 rounded-xl overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=400" 
                    alt="Samsung Galaxy S25"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp size={10} className="text-blue-400" />
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">Performance</span>
                  </div>
                  <h3 className="text-xs font-black tracking-tight italic">Galaxy S25 Ultra</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 font-bold uppercase">$1,199 Value</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-400 text-[8px] font-black">Top 3</span>
                  </div>
                </div>
              </motion.div>

              {/* AirPods Prize */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="group relative h-full flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-400/50 transition-all overflow-hidden"
              >
                <div className="h-32 mb-4 rounded-xl overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1588423770574-f199ba460b10?auto=format&fit=crop&q=80&w=400" 
                    alt="AirPods Pro"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={10} className="text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Elite Gear</span>
                  </div>
                  <h3 className="text-xs font-black tracking-tight italic">AirPods Pro Gen 3</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 font-bold uppercase">$249 Value</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[8px] font-black">Division</span>
                  </div>
                </div>
              </motion.div>

              {/* MiniPod Prize */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="group relative h-full flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-orange-400/50 transition-all overflow-hidden"
              >
                <div className="h-32 mb-4 rounded-xl overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1610482215664-0c5a7515f247?auto=format&fit=crop&q=80&w=400" 
                    alt="HomePod Mini"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-1">
                    <Activity size={10} className="text-orange-400" />
                    <span className="text-[8px] font-black text-orange-400 uppercase tracking-[0.2em]">Starter Pak</span>
                  </div>
                  <h3 className="text-xs font-black tracking-tight italic">HomePod MiniPod</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[8px] text-slate-500 font-bold uppercase">$99 Value</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-400/20 text-orange-400 text-[8px] font-black">Monthly</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="w-px bg-white/10 hidden lg:block" />

          <div className="lg:w-64 flex flex-col justify-center items-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary ai-pulse">
              <Medal size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time Remaining</p>
              <p className="text-2xl font-black font-mono tracking-tighter text-primary">244D:12H:05M</p>
            </div>
            <button className="w-full py-3 bg-primary text-white hover:bg-primary/90 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
              Claim Progress
            </button>
          </div>
        </div>
      </div>

      {/* Token Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 game-card !overflow-visible shadow-xl shadow-primary/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic">External API Intelligence</h2>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Cross-Platform Consumption Tracking</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">Live Feedback</span>
              <span className="px-3 py-1 rounded-lg bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary ai-pulse">Synching...</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ChatGPT Stats */}
            <div className="p-6 rounded-[2rem] bg-[#10a37f]/5 border border-[#10a37f]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#10a37f] flex items-center justify-center text-white shadow-lg shadow-[#10a37f]/30">
                  <span className="font-black italic text-lg">G</span>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tighter">ChatGPT-4o</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model: gpt-4o-latest</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Usage</span>
                  <span className="text-2xl font-black tracking-tighter italic text-[#10a37f]">1.2M <span className="text-[10px] font-bold text-slate-400 not-italic uppercase tracking-widest">Tokens</span></span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    className="h-full bg-[#10a37f]"
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">65% of allocated budget consumed</p>
              </div>
            </div>

            {/* Claude Stats */}
            <div className="p-6 rounded-[2rem] bg-[#d97757]/5 border border-[#d97757]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#d97757] flex items-center justify-center text-white shadow-lg shadow-[#d97757]/30 text-xs text-center border-none">
                  <span className="font-black">CL</span>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tighter">Claude 3.5 Sonnet</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model: claude-3-5-sonnet</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Usage</span>
                  <span className="text-2xl font-black tracking-tighter italic text-[#d97757]">842K <span className="text-[10px] font-bold text-slate-400 not-italic uppercase tracking-widest">Tokens</span></span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '42%' }}
                    className="h-full bg-[#d97757]"
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">42% of allocated budget consumed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="game-card flex flex-col justify-center items-center text-center p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-xl shadow-primary/10">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40 mb-6 rotate-12">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none mb-2">Efficiency Rating</h3>
          <p className="text-4xl font-black text-primary tracking-tighter mb-4 italic shimmer-text">A+</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Your agents are currently 24% more efficient than industry standard baselines.
          </p>
        </div>
      </div>

      {/* Top 3 Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="game-card bg-primary/5 border-primary/20 overflow-visible">
             <div className="flex items-center gap-2 mb-6">
               <Trophy className="text-primary" size={20} />
               <h2 className="text-sm font-black uppercase tracking-widest italic">Hall of Champions</h2>
             </div>
             
             <div className="flex flex-col md:flex-row items-end justify-around gap-8 pt-10 px-4">
                {/* 2nd Place */}
                <LeaderboardPodium builder={TOP_BUILDERS[1]} height="h-28" delay={0.2} color="text-slate-400" />
                {/* 1st Place */}
                <LeaderboardPodium builder={TOP_BUILDERS[0]} height="h-40" delay={0} color="text-primary" isWinner />
                {/* 3rd Place */}
                <LeaderboardPodium builder={TOP_BUILDERS[2]} height="h-20" delay={0.4} color="text-amber-700" />
             </div>
          </section>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="game-card h-72">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-sm font-bold uppercase tracking-widest">Consumption</h2>
                   <p className="text-[10px] text-slate-400">Last 30 Days</p>
                 </div>
                 <Activity className="text-primary opacity-50" size={16} />
               </div>
               <div className="h-44">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={ANALYTICS_HISTORY}>
                     <defs>
                       <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#555" opacity={0.1} />
                     <XAxis dataKey="month" hide />
                     <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '10px'
                        }}
                     />
                     <Area type="monotone" dataKey="tokens" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </section>

            <section className="game-card h-72">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-sm font-bold uppercase tracking-widest">Active Units</h2>
                   <p className="text-[10px] text-slate-400">Historical Deployment</p>
                 </div>
                 <Cpu className="text-secondary opacity-50" size={16} />
               </div>
               <div className="h-44">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={ANALYTICS_HISTORY}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#555" opacity={0.1} />
                     <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                     <Tooltip 
                        cursor={{ fill: 'rgba(79,70,229,0.05)' }}
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '10px'
                        }}
                     />
                     <Bar dataKey="activeAgents" fill="#818cf8" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </section>
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-6">
          <div className="game-card">
             <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Revenue Cycles</p>
             <h3 className="text-2xl font-bold tracking-tight">{Intl.NumberFormat('en-US').format(totalTokens)}</h3>
             <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-tighter">
                <TrendingUp size={12} />
                +14.2% Growth
             </div>
          </div>

          <QuickStatCard 
            title="Elite Vanguard" 
            name={mostPowerful.name} 
            subtitle={`${Intl.NumberFormat('en-US', { notation: 'compact' }).format(mostPowerful.tokensConsumed)} Tokens`}
            icon={mostPowerful.avatar} 
          />
          
          <QuickStatCard 
            title="Fan Favorite" 
            name={mostPopular.name} 
            subtitle={`${mostPopular.popularity}% Interaction`}
            icon={mostPopular.avatar}
          />

          <div className="game-card bg-primary text-white border-none shadow-indigo-500/20">
             <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center text-xl">
                   👑
                </div>
                <div>
                   <h4 className="font-bold text-xs uppercase tracking-widest">Lead Builder</h4>
                   <p className="text-base font-bold italic underline decoration-white/30">Chatshero Admin</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardPodium({ builder, height, delay, color, isWinner }: { builder: any; height: string; delay: number; color: string; isWinner?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[100px]">
      <div className="relative">
        <div className={cn(
          "relative z-10 w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-950 flex items-center justify-center text-2xl shadow-lg overflow-hidden ring-2",
          isWinner ? "ring-primary" : "ring-transparent"
        )}>
          {builder.avatar}
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-tight mb-1 whitespace-nowrap">{builder.name}</p>
        <p className={cn("text-[10px] font-mono font-bold", color)}>{builder.score} UNITS</p>
      </div>

      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: height }}
        transition={{ delay, duration: 1, ease: 'backOut' }}
        className={cn(
          "w-12 rounded-t-xl flex items-start justify-center pt-1 relative shadow-md",
          isWinner ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
        )}
      >
        <div className={cn("font-bold text-sm", isWinner ? "text-white" : "text-slate-400 dark:text-slate-600")}>
          {builder.rank}
        </div>
      </motion.div>
    </div>
  );
}

function QuickStatCard({ title, name, subtitle, icon }: { title: string; name: string; subtitle: string; icon: string }) {
  return (
    <div className="game-card group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">{title}</p>
       <div className="flex items-center gap-4">
          <div className="h-10 w-10 text-xl flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-transform group-hover:scale-110">
             {icon}
          </div>
          <div>
             <h4 className="font-black tracking-tight">{name}</h4>
             <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{subtitle}</p>
          </div>
       </div>
    </div>
  );
}

/**
 * Persona AI agent character
 * Slowly rising from below upwards, a subtle feeling from afar.
 * Firefly-like effect.
 */
function FireflyPersona() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background clusters of fireflies */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: "110vh", 
            x: `${10 + Math.random() * 80}vw`,
            opacity: 0,
            scale: 0.2 + Math.random() * 0.4
          }}
          animate={{ 
            y: ["110vh", "50vh", "-20vh"],
            opacity: [0, 0.4, 0.4, 0],
            scale: [0.5, 1.2, 1.2, 0.5],
            x: [
              `${10 + Math.random() * 80}vw`, 
              `${15 + Math.random() * 70}vw`, 
              `${10 + Math.random() * 80}vw`
            ]
          }}
          transition={{ 
            duration: 20 + Math.random() * 15,
            repeat: Infinity,
            delay: i * 4,
            ease: "easeInOut"
          }}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/40 blur-[3px] shadow-[0_0_15px_rgba(79,70,229,0.5)]"
        />
      ))}
      
      {/* The main persona character - subtle firefly orb */}
      <motion.div
        initial={{ y: "120vh", x: "20vw", opacity: 0, scale: 0 }}
        animate={{ 
          y: ["110vh", "60vh", "20vh", "-10vh"],
          x: ["20vw", "30vw", "15vw", "25vw"],
          opacity: [0, 0.7, 0.7, 0],
          scale: [0.5, 1, 1, 0.5],
        }}
        transition={{ 
          duration: 35,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.3, 0.8, 1]
        }}
        className="absolute flex flex-col items-center justify-center mix-blend-screen"
      >
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.6, 1, 0.6],
              filter: ["blur(4px)", "blur(2px)", "blur(4px)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-4 h-4 rounded-full bg-white shadow-[0_0_25px_#4f46e5,0_0_10px_#818cf8]"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full" />
        </div>
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mt-3 text-[7px] font-black uppercase tracking-[0.4em] text-primary/40 italic flex items-center gap-2"
        >
          <span className="w-1 h-[1px] bg-primary/20" />
          Persona
          <span className="w-1 h-[1px] bg-primary/20" />
        </motion.div>
      </motion.div>

      {/* Second persona core - drifting from other side */}
      <motion.div
        initial={{ y: "120vh", x: "80vw", opacity: 0, scale: 0 }}
        animate={{ 
          y: ["110vh", "40vh", "-10vh"],
          x: ["80vw", "70vw", "85vw"],
          opacity: [0, 0.5, 0.5, 0],
          scale: [0.4, 0.8, 0.8, 0.4],
        }}
        transition={{ 
          duration: 45,
          repeat: Infinity,
          delay: 15,
          ease: "linear",
          times: [0, 0.5, 1]
        }}
        className="absolute flex flex-col items-center justify-center mix-blend-screen"
      >
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
              filter: ["blur(5px)", "blur(3px)", "blur(5px)"]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-primary/40 shadow-[0_0_20px_#4f46e5]"
          />
        </div>
      </motion.div>
    </div>
  );
}
