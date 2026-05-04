import { motion } from 'motion/react';

export default function AILoader() {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6">
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
        />
        {/* Inner Scanning Line */}
        <motion.div 
          animate={{ 
            top: ['0%', '100%', '0%'],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-0 right-0 h-0.5 bg-primary/60 shadow-[0_0_15px_rgba(139,92,246,0.8)] z-10"
        />
        {/* Neural Core */}
        <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center ai-pulse">
           <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_rgba(139,92,246,1)] animate-ping" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">
          Neural Scan in Progress
        </span>
        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          Synchronizing with Hero Registry...
        </span>
      </div>
    </div>
  );
}
