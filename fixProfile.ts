import fs from 'fs';
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// 1. Add Countdown
const countdownTarget = `<div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Current Month Sales
               </div>`;

const countdownNew = `<div className="flex items-center justify-between mb-2">
                 <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Current Month Sales
                 </div>
                 <div className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md border border-rose-200 dark:border-rose-800">
                   ⏳ {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} Days Left
                 </div>
               </div>`;
content = content.replace(countdownTarget, countdownNew);

// 2. RM 40k Bonus
const rmTarget = `<h5 className="font-black text-white text-lg leading-none mb-2 drop-shadow-sm uppercase italic">Close RM 40k Gap</h5>`;
const rmNew = `<h5 className="font-black text-white text-lg leading-none mb-2 drop-shadow-sm uppercase italic">Close RM 40k Gap for RM800 Bonus</h5>`;
content = content.replace(rmTarget, rmNew);

// 3. New Task Button instead of Input under To Do List
const newTaskBtnOld = `{status === 'todo' && (
                         <div className="flex gap-2 shrink-0 pt-2 border-t border-slate-200 dark:border-slate-700/50 mt-4">
                            <input 
                              type="text" 
                              value={newTodo}
                              onChange={(e) => setNewTodo(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                              placeholder="New task..."
                              className="flex-1 min-w-0 bg-white dark:bg-slate-800/50 border-[1px] border-slate-200 dark:border-slate-700/50 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                            <button 
                              onClick={addTodo}
                              className="p-2 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors shrink-0"
                            >
                              <Plus size={14} />
                            </button>
                         </div>
                       )}`;

const newTaskBtnNew = `{status === 'todo' && (
                         <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50 mt-4">
                            <button 
                              onClick={() => setEditingTodo({id: '', text: '', completed: false, status: 'todo', createdAt: Date.now()})}
                              className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-bold uppercase tracking-widest"
                            >
                              <Plus size={14} /> Add New Task
                            </button>
                         </div>
                       )}`;
content = content.replace(newTaskBtnOld, newTaskBtnNew);

const saveBtnOld = `              <button 
                onClick={() => {
                  const updated = todos.map(t => t.id === editingTodo.id ? editingTodo : t);
                  setTodos(updated);
                  if (user) updateDoc(doc(db, 'users', user.uid), { todos: updated }).catch(console.error);
                  setEditingTodo(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>`;

const saveBtnNew = `              <button 
                onClick={() => {
                  let updated = [...todos];
                  if (editingTodo.id === '') {
                    updated.push({ ...editingTodo, id: Date.now().toString() });
                  } else {
                    updated = todos.map(t => t.id === editingTodo.id ? editingTodo : t);
                  }
                  setTodos(updated);
                  if (user) updateDoc(doc(db, 'users', user.uid), { todos: updated }).catch(console.error);
                  setEditingTodo(null);
                }}
                className="flex-[2] px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Save
              </button>`;
content = content.replace(saveBtnOld, saveBtnNew);

const cancelBtnOld = `<button 
                onClick={() => setEditingTodo(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>`;

const cancelBtnNew = `<button 
                onClick={() => setEditingTodo(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              {editingTodo.id !== '' && (
                <button 
                  onClick={() => {
                    const updated = todos.filter(t => t.id !== editingTodo.id);
                    setTodos(updated);
                    if (user) updateDoc(doc(db, 'users', user.uid), { todos: updated }).catch(console.error);
                    setEditingTodo(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  Delete
                </button>
              )}`;
content = content.replace(cancelBtnOld, cancelBtnNew);

fs.writeFileSync('src/pages/Profile.tsx', content);
