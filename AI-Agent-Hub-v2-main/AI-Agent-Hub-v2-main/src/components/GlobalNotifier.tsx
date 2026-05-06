import React, { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { GlobalEvent } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { playEpicGamingAlert } from '../lib/sounds';

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) {
    if (diffInSeconds < 7200) return 'An hour ago';
    // If it's today, show time
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  }
  if (diffInSeconds < 172800) return 'Yesterday';
  return date.toLocaleDateString();
}

export default function GlobalNotifier() {
  const [notifications, setNotifications] = useState<GlobalEvent[]>([]);

  const playTTS = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    let sexyManVoice = voices.find(v => 
      v.name.includes('Google UK English Male') || 
      v.name.includes('Daniel') || 
      v.name.includes('Alex') || 
      v.name.includes('Microsoft Mark') ||
      v.name.includes('Male')
    ) || voices.find(v => v.lang.startsWith('en-'));
    
    if (sexyManVoice) utterance.voice = sexyManVoice;
    utterance.pitch = 0.65; 
    utterance.rate = 0.9; 
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleNewEvent = useCallback((event: GlobalEvent) => {
    playEpicGamingAlert();
    setTimeout(() => playTTS(event.message), 700);
    
    setNotifications((prev) => {
      const newNotif = { ...event, id: Math.random().toString() };
      // Keep only last 3
      const updated = [newNotif, ...prev];
      return updated.slice(0, 3);
    });
  }, [playTTS]);

  useEffect(() => {
    const q = query(collection(db, 'global_events'), orderBy('createdAt', 'desc'), limit(10));
    let isFirstLoad = true;
    const processedIds = new Set<string>();
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isFirstLoad) {
        snapshot.docs.forEach(doc => processedIds.add(doc.id));
        isFirstLoad = false;
        return;
      }
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          if (!processedIds.has(change.doc.id)) {
            processedIds.add(change.doc.id);
            const data = { ...change.doc.data(), id: change.doc.id } as GlobalEvent;
            handleNewEvent(data);
          }
        }
      });
    }, (error) => {
      console.error("Global events snapshot error:", error);
    });

    return () => unsubscribe();
  }, [handleNewEvent]);

  // Handle voices loading
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => { window.speechSynthesis.getVoices(); };
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const removeNotification = (id?: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTitle = (notif: GlobalEvent) => {
    if (notif.title) return notif.title;
    switch (notif.type) {
      case 'agent_created': return 'New AI Agent Deploy';
      case 'target_hit': return 'Achievement Unlocked';
      case 'announcement': return 'Broadcast';
      default: return 'Global Event';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => {
          const date = notif.createdAt?.toDate ? notif.createdAt.toDate() : new Date();
          return (
            <motion.div
              layout
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, transition: { duration: 0.2 } }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-primary/20 shadow-2xl shadow-primary/20 rounded-2xl p-4 flex items-start gap-4 max-w-sm pointer-events-auto relative group"
            >
              <button 
                onClick={() => removeNotification(notif.id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>

              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Bell size={20} />
              </div>
              
              <div className="pr-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    {getTitle(notif)}
                  </h4>
                  <span className="text-[9px] font-bold text-primary/50 uppercase tracking-widest whitespace-nowrap">
                    • {formatRelativeTime(date)}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
