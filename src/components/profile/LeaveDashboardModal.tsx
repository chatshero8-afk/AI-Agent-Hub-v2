import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, ArrowRight, ChevronDown, Paperclip, Phone, Bookmark, Send, Info } from 'lucide-react';

interface LeaveDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const recentRequests = [
  {
    dateStr: "20 May 2025",
    dayStr: "Tue",
    type: "Annual Leave (AL)",
    duration: "2 days",
    durationSub: "20 May – 21 May",
    status: "Approved",
  },
  {
    dateStr: "15 May 2025",
    dayStr: "Thu",
    type: "Medical Leave (MC)",
    duration: "1 day",
    durationSub: "15 May",
    status: "Approved",
  },
  {
    dateStr: "02 May 2025",
    dayStr: "Fri",
    type: "Emergency Leave (EL)",
    duration: "1 day",
    durationSub: "02 May",
    status: "Pending",
  },
  {
    dateStr: "18 Apr 2025",
    dayStr: "Fri",
    type: "Annual Leave (AL)",
    duration: "3 days",
    durationSub: "18 Apr – 20 Apr",
    status: "Rejected",
  },
  {
    dateStr: "05 Apr 2025",
    dayStr: "Sat",
    type: "Medical Leave (MC)",
    duration: "2 days",
    durationSub: "05 Apr – 06 Apr",
    status: "Approved",
  },
];

const statusStyles: Record<string, string> = {
  Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function LeaveDashboardModal({ isOpen, onClose }: LeaveDashboardModalProps) {
  const [leaveType, setLeaveType] = useState('Medical Leave (MC)');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [hasFile, setHasFile] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0f172a] rounded-2xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 pointer-events-auto"
            >
              <div className="p-6 sm:p-8 relative">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Balance Overview Card */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-8 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <Calendar size={22} className="stroke-[2.5px]"/>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">Leave Balance Overview</h3>
                        <p className="text-slate-400 text-sm">Balance as of today</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 divide-x divide-slate-700/50">
                    <div className="text-center px-4">
                      <p className="text-slate-400 font-medium mb-1">MC Left</p>
                      <p className="text-3xl font-bold text-emerald-400 tracking-tight">6 <span className="text-sm font-medium text-emerald-400/80 tracking-normal">days</span></p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-slate-400 font-medium mb-1">AL Left</p>
                      <p className="text-3xl font-bold text-blue-400 tracking-tight">12 <span className="text-sm font-medium text-blue-400/80 tracking-normal">days</span></p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-slate-400 font-medium mb-1">EL Left</p>
                      <p className="text-3xl font-bold text-teal-400 tracking-tight">3 <span className="text-sm font-medium text-teal-400/80 tracking-normal">days</span></p>
                    </div>
                  </div>
                </div>

                {/* Leave Application Form */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-8">
                  <h3 className="text-white font-semibold text-lg mb-6">Leave Application</h3>
                  
                  <div className="space-y-6">
                    {/* Leave Type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Leave Type <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          className="w-full sm:w-1/2 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          value={leaveType}
                          onChange={(e) => setLeaveType(e.target.value)}
                        >
                          <option className="bg-slate-900 text-slate-200">Medical Leave (MC)</option>
                          <option className="bg-slate-900 text-slate-200">Annual Leave (AL)</option>
                          <option className="bg-slate-900 text-slate-200">Emergency Leave (EL)</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      {/* Start Date */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Start Date <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            defaultValue="29 May 2025 (Thu)"
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                          <X size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-slate-300" />
                        </div>
                      </div>
                      
                      {/* End Date */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            End Date <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              defaultValue="31 May 2025 (Sat)"
                              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                            <X size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-slate-300" />
                          </div>
                        </div>
                        {/* Half Day */}
                        <div className="pt-7 min-w-[140px]">
                            <label className="flex items-center cursor-pointer gap-3">
                              <div className="relative">
                                <input 
                                  type="checkbox" 
                                  className="sr-only" 
                                  checked={isHalfDay}
                                  onChange={() => setIsHalfDay(!isHalfDay)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${isHalfDay ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isHalfDay ? 'translate-x-4' : ''}`}></div>
                              </div>
                              <span className="text-sm font-medium text-slate-300">Apply for half day</span>
                            </label>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Reason <span className="text-red-400">*</span>
                      </label>
                      <textarea 
                        rows={2}
                        defaultValue="Fever and cold. Advised rest by doctor."
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                      />
                      <div className="text-right text-xs text-slate-500 mt-1">45/500</div>
                    </div>

                    {/* Upload MC Proof */}
                    {leaveType.includes('MC') && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Upload MC Proof <span className="text-red-400">* (Required for MC)</span>
                        </label>
                        {hasFile ? (
                          <div className="border border-dashed border-slate-600 rounded-xl p-4 flex items-center justify-between bg-slate-900/30">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-slate-800 rounded-lg text-slate-400">
                                <Paperclip size={20} />
                              </div>
                              <div>
                                <p className="text-slate-200 text-sm font-medium">MC-May-29-31.pdf</p>
                                <p className="text-slate-500 text-xs mt-0.5">PDF • 245 KB</p>
                              </div>
                            </div>
                            <button onClick={() => setHasFile(false)} className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors">
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="border border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-900/30 text-center cursor-pointer hover:bg-slate-900/50 transition-colors">
                            <Paperclip size={24} className="text-slate-400 mb-2" />
                            <p className="text-slate-300 text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-slate-500 text-xs mt-1">PDF, JPG or PNG (max. 10MB)</p>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2">Please upload a clear copy of your medical certificate.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      {/* Handover Notes */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Handover / Work Notes <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <textarea 
                          rows={2}
                          defaultValue="Handover tasks to Ankit. Project update doc shared in Drive."
                          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                        />
                        <div className="text-right text-xs text-slate-500 mt-1">58/500</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700/50">
                      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all">
                        <Send size={18} /> Submit Leave Request
                      </button>
                    </div>

                  </div>
                </div>

                {/* Recent Leave Requests */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Recent Leave Requests</h3>
                    <button className="text-blue-400 text-sm hover:text-blue-300 font-semibold flex items-center gap-1 group transition-colors">
                      View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                  </div>
                  
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[600px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700/50 bg-slate-800/30">
                          <th className="px-6 py-4 text-sm font-medium text-slate-400">Date</th>
                          <th className="px-6 py-4 text-sm font-medium text-slate-400">Leave Type</th>
                          <th className="px-6 py-4 text-sm font-medium text-slate-400">Duration</th>
                          <th className="px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {recentRequests.map((req, i) => (
                          <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-slate-200 text-sm font-medium">{req.dateStr}</div>
                              <div className="text-slate-500 text-xs mt-1">{req.dayStr}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-slate-200 text-sm">{req.type}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-slate-200 text-sm font-medium">{req.duration}</div>
                              <div className="text-slate-500 text-xs mt-1">{req.durationSub}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold border ${statusStyles[req.status]}`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-4 sm:p-5 border-t border-slate-700/50">
                    <button className="text-blue-400 text-sm hover:text-blue-300 font-semibold flex items-center gap-2 group transition-colors">
                      View More History <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
