import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Zap, Loader2 } from 'lucide-react';
import { Agent } from '../types';
import { chatWithAgent, ChatMessage } from '../services/geminiService';
import { cn } from '../lib/utils';

interface ChatModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ agent, isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!agent) return null;

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    if (!agent) return;
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithAgent(
        agent.name,
        agent.role,
        agent.description,
        messages,
        input
      );

      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Error: I'm currently unable to process your request. Please try again later." }] }]);
    } finally {
      setIsLoading(false);
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
            className="relative w-full max-w-2xl h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
                  {agent.avatar}
                </div>
                <div>
                  <h3 className="font-black tracking-tight text-lg">{agent.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary">{agent.role}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50 dark:bg-slate-900/50"
            >
              <div className="flex flex-col items-center py-8 text-center space-y-2 opacity-50">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Zap size={32} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">Connection Established</p>
                <p className="text-[10px] max-w-xs">{agent.description}</p>
              </div>

              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[80%] space-y-1",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div 
                    className={cn(
                      "px-4 py-3 rounded-3xl text-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-tl-none shadow-sm"
                    )}
                  >
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2 mr-auto">
                  <div className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-3xl rounded-tl-none flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 size={14} className="animate-spin" />
                    Processing bit-streams...
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Communicate with ${agent.name}...`}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl pl-6 pr-14 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
