import React from 'react';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'motion/react';

export default function Profile() {
  const { user } = useAuth();
  const email = (user?.email || '').toLowerCase();
  const dashboardUrl = email ? `https://chatshero-dashboard.web.app/?email=${encodeURIComponent(email)}` : 'https://chatshero-dashboard.web.app/';
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 overflow-hidden"
    >
      <iframe
        src={dashboardUrl}
        title="ChatsHero Sales Dashboard"
        className="w-full h-full border-none"
        allow="clipboard-write"
        referrerPolicy="no-referrer"
      />
    </motion.div>
  );
}
