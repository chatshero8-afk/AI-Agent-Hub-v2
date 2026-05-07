import React from 'react';
import { motion } from 'motion/react';

export default function Sales() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-[calc(100vh-64px)] overflow-hidden"
    >
      <iframe 
        src="https://chatshero-dashboard.web.app/" 
        className="w-full h-full border-none" 
        title="Sales Dashboard"
      />
    </motion.div>
  );
}
