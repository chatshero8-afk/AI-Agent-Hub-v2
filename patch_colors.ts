import fs from 'fs';

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// 1. Remove call duration input
const inputToRemove = `                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Call Duration (min)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 15"
                    value={editingTodo.callDuration || ''}
                    onChange={e => setEditingTodo({...editingTodo, callDuration: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white"
                  />
                </div>`;
content = content.replace(inputToRemove, '');

// 2. Remove call duration display
const displayToRemove = `                                 {todo.callDuration && (
                                   <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-md">
                                     <Phone size={10} /> {todo.callDuration} min
                                   </span>
                                 )}`;
content = content.replace(displayToRemove, '');

// 3. Change label color
const selectColorToRemove = `<select 
                    value={editingTodo.labelColor || ''}
                    onChange={e => setEditingTodo({...editingTodo, labelColor: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none text-slate-900 dark:text-white appearance-none"
                  >
                    <option value="">Blue (Default)</option>
                    <option value="emerald">Emerald</option>
                    <option value="amber">Amber</option>
                    <option value="red">Red</option>
                    <option value="purple">Purple</option>
                  </select>`;
const newColorSelect = `<div className="flex gap-2">
                    {[
                      { value: '', color: 'bg-blue-500' },
                      { value: 'emerald', color: 'bg-emerald-500' },
                      { value: 'amber', color: 'bg-amber-500' },
                      { value: 'red', color: 'bg-red-500' },
                      { value: 'purple', color: 'bg-purple-500' }
                    ].map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingTodo({ ...editingTodo, labelColor: c.value });
                        }}
                        className={\`w-8 h-8 rounded-full \${c.color} \${(editingTodo.labelColor || '') === c.value ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-400' : 'opacity-70 hover:opacity-100'}\`}
                      />
                    ))}
                  </div>`;
content = content.replace(selectColorToRemove, newColorSelect);

fs.writeFileSync('src/pages/Profile.tsx', content);
