import { motion } from 'motion/react';
import { useAuth } from '../components/AuthProvider';
import { LogIn, Rocket, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/hub');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Glow behind the card */}
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full overflow-hidden" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={120} className="fill-current" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mb-8 shadow-inner border border-primary/20 overflow-hidden">
              <img src="/icons/chatshero.webp" alt="Chatshero" className="h-full w-full object-cover" />
            </div>

            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none mb-4">
              Chats<span className="text-primary underline decoration-primary/30 decoration-8 underline-offset-4">Hero</span> Elite
            </h1>

            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed max-w-[280px]">
              Deploy, customize, and evolve your AI agents within the ChatsHero ecosystem.
            </p>

            <div className="space-y-4 w-full">
              <button 
                onClick={() => login()}
                className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all shadow-lg active:scale-95 group"
              >
                <LogIn size={18} className="transition-transform group-hover:translate-x-1" />
                Sign In with Google
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4">
                <ShieldCheck size={14} className="text-emerald-500" />
                Secure Enterprise Authentication
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
