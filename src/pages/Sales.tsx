import React from 'react';
import { motion } from 'motion/react';

export default function Sales() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-[calc(100vh-140px)] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl"
    >
      <iframe 
        src="https://chatshero-dashboard.web.app/" 
        className="w-full h-full border-none" 
        title="Sales Dashboard"
      />
    </motion.div>
  );
}
