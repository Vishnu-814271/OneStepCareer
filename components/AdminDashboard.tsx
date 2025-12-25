import React, { useState, useEffect } from 'react';
import { User, Problem, Difficulty, TestCase } from '../types';
import { LogOut, Plus, Users, BarChart3, Trash2, Edit, Code, Save, X, ChevronRight, ArrowLeft, LayoutGrid, CheckCircle, MessageSquare, Shield, Database, Activity, FileCode, Beaker, Eye, EyeOff } from 'lucide-react';
import { dataService } from '../services/dataService';
import CommunityChat from './CommunityChat';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'labs' | 'students' | 'community'>('overview');
  const [labView, setLabView] = useState<'folders' | 'questions'>('folders');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  
  const [isEditingProblem, setIsEditingProblem] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Partial<Problem>>({
    language: '', difficulty: 'L0', title: '', description: '', starterCode: '', testCases: [], module: 'Basics'
  });

  useEffect(() => { refreshData(); }, [activeTab]); 

  const refreshData = () => {
    setLanguages(dataService.getLanguages());
    setProblems(dataService.getProblems());
    setUsersList(dataService.getUsers().filter(u => u.role === 'STUDENT'));
  };

  const handleEditProblem = (prob: Problem) => {
    setCurrentProblem(prob);
    setIsEditingProblem(true);
  };

  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProblem.title || !selectedLanguage) return;

    const prob: Problem = {
      id: currentProblem.id || Math.random().toString(36).substr(2, 9),
      title: currentProblem.title,
      description: currentProblem.description || '',
      language: selectedLanguage,
      difficulty: (currentProblem.difficulty as Difficulty) || 'L0',
      starterCode: currentProblem.starterCode || '',
      testCases: currentProblem.testCases || [],
      module: currentProblem.module || 'Basics',
      points: currentProblem.points || 10
    };

    if (currentProblem.id) dataService.updateProblem(prob);
    else dataService.addProblem(prob);
    
    setIsEditingProblem(false);
    refreshData();
  };

  const addTestCase = () => {
    const updatedTestCases = [...(currentProblem.testCases || []), { input: '', expectedOutput: '', isHidden: false }];
    setCurrentProblem({ ...currentProblem, testCases: updatedTestCases });
  };

  const removeTestCase = (index: number) => {
    const updatedTestCases = (currentProblem.testCases || []).filter((_, i) => i !== index);
    setCurrentProblem({ ...currentProblem, testCases: updatedTestCases });
  };

  const updateTestCase = (index: number, updates: Partial<TestCase>) => {
    const updatedTestCases = (currentProblem.testCases || []).map((tc, i) => i === index ? { ...tc, ...updates } : tc);
    setCurrentProblem({ ...currentProblem, testCases: updatedTestCases });
  };

  const stats = [
    { title: 'Student Population', value: usersList.length.toString(), icon: Users, color: 'text-brand-gold', bg: 'bg-brand-green/10' },
    { title: 'Training Modules', value: problems.length.toString(), icon: Database, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { title: 'System Pulse', value: 'Stable', icon: Activity, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans admin-theme-gradient">
      <nav className="h-20 border-b border-brand-green/30 bg-brand-forest-dark/40 backdrop-blur-3xl flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center font-black text-white">A</div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl text-white tracking-tighter">TECHNEXUS <span className="text-brand-green font-normal">ADMIN</span></span>
            <span className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.2em] opacity-80">Industrial Command Unit</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Operator</span>
              <span className="text-xs font-bold text-white uppercase">{user.name}</span>
           </div>
           <button onClick={onLogout} className="p-3 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white rounded-xl transition-all border border-brand-orange/20"><LogOut size={20} /></button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-80px)]">
        <aside className="w-72 border-r border-slate-800/50 bg-brand-forest-dark/5 hidden md:block p-8 space-y-4">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'overview' ? 'bg-brand-green/20 text-brand-gold border border-brand-gold/30' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'}`}>
            <BarChart3 size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Monitor</span>
          </button>
          <button onClick={() => setActiveTab('labs')} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'labs' ? 'bg-brand-green/20 text-brand-gold border border-brand-gold/30' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'}`}>
            <LayoutGrid size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Curriculums</span>
          </button>
          <button onClick={() => setActiveTab('students')} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'students' ? 'bg-brand-green/20 text-brand-gold border border-brand-gold/30' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'}`}>
            <Users size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Directory</span>
          </button>
          <button onClick={() => setActiveTab('community')} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'community' ? 'bg-brand-green/20 text-brand-gold border border-brand-gold/30' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'}`}>
            <MessageSquare size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Comms</span>
          </button>
        </aside>

        <main className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-12">
               <h1 className="text-4xl font-heading font-black text-white">Console Overview</h1>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {stats.map((stat, idx) => (
                   <div key={idx} className="glass-card p-10 rounded-3xl flex flex-col items-center text-center gap-6">
                     <div className={`p-5 rounded-2xl ${stat.bg}`}>
                       <stat.icon className={stat.color} size={32} />
                     </div>
                     <div>
                       <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">{stat.title}</div>
                       <div className="text-4xl font-heading font-black text-white">{stat.value}</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'labs' && (
             <div className="animate-fade-in space-y-8">
                {labView === 'folders' ? (
                   <>
                      <h1 className="text-3xl font-heading font-black text-white mb-2">Technical Tracks</h1>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
                        {languages.map(lang => (
                          <div key={lang} onClick={() => { setSelectedLanguage(lang); setLabView('questions'); }} className="glass-card p-8 rounded-2xl cursor-pointer hover:border-brand-gold/50 transition-all group relative overflow-hidden">
                             <div className="text-5xl font-black text-slate-800/30 group-hover:text-brand-green/20 absolute -top-2 -right-2 uppercase">{lang[0]}</div>
                             <h3 className="text-2xl font-heading font-bold text-white mb-2">{lang}</h3>
                             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{problems.filter(p => p.language === lang).length} Active Challenges</p>
                          </div>
                        ))}
                      </div>
                   </>
                ) : (
                   <div className="space-y-6">
                      <div className="flex items-center justify-between mb-10">
                        <button onClick={() => setLabView('folders')} className="flex items-center gap-2 text-brand-green font-bold text-sm uppercase tracking-widest hover:text-brand-gold transition-colors">
                           <ArrowLeft size={18} /> Module Exit
                        </button>
                        <button onClick={() => { 
                           setCurrentProblem({ language: selectedLanguage!, difficulty: 'L0', title: '', description: '', testCases: [], module: 'Basics', starterCode: '', points: 10 }); 
                           setIsEditingProblem(true); 
                        }} className="btn-orange px-8 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-xl">Deploy New Challenge</button>
                      </div>

                      <div className="glass-card rounded-3xl overflow-hidden border-brand-green/20">
                        <table className="w-full text-left">
                          <thead className="bg-brand-forest-dark/40 text-brand-gold text-[10px] uppercase font-black tracking-widest border-b border-brand-green/20">
                            <tr>
                              <th className="p-6">Assessment Title</th>
                              <th className="p-6">Curriculum</th>
                              <th className="p-6 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {problems.filter(p => p.language === selectedLanguage).map(p => (
                              <tr key={p.id} className="hover:bg-brand-green/5 transition-colors">
                                <td className="p-6 font-bold text-slate-200">{p.title}</td>
                                <td className="p-6"><span className="px-3 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 uppercase">{p.module || 'CORE'}</span></td>
                                <td className="p-6 text-right flex justify-end gap-3">
                                   <button onClick={() => handleEditProblem(p)} className="p-2 text-slate-400 hover:text-white transition-all"><Edit size={16}/></button>
                                   <button onClick={() => { if(confirm('Delete?')) dataService.deleteProblem(p.id); refreshData(); }} className="p-2 text-slate-400 hover:text-brand-orange transition-all"><Trash2 size={16}/></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                )}
             </div>
          )}
          {/* ... other tabs ... */}
          {activeTab === 'students' && (
             <div className="animate-fade-in space-y-8">
               <h1 className="text-3xl font-heading font-black text-white">Student Directory</h1>
               <div className="glass-card rounded-3xl overflow-hidden border-brand-green/20">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-brand-forest-dark/40 text-brand-gold text-[10px] uppercase font-black border-b border-brand-green/20 tracking-widest">
                     <tr>
                       <th className="p-6 pl-10">User Identity</th>
                       <th className="p-6">Registry Detail</th>
                       <th className="p-6">Clearance</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     {usersList.map((student) => (
                       <tr key={student.id} className="hover:bg-brand-green/5 transition-colors">
                         <td className="p-6 pl-10 font-bold text-white tracking-tight">{student.name}</td>
                         <td className="p-6 text-slate-500 text-xs font-mono">{student.email}</td>
                         <td className="p-6">
                            <span className="px-3 py-1 bg-brand-green/10 text-brand-green text-[10px] font-black rounded-full border border-brand-green/30 tracking-widest uppercase">Validated</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}
          {activeTab === 'community' && <div className="h-full"><CommunityChat currentUser={user} /></div>}
        </main>
      </div>

      {isEditingProblem && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-brand-night/90 backdrop-blur-2xl animate-fade-in">
            <form onSubmit={handleSaveProblem} className="bg-brand-navy-dark border border-brand-green/20 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
               <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-brand-forest-dark/10">
                  <h3 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Lab Provisioning Protocol</h3>
                  <button type="button" onClick={() => setIsEditingProblem(false)} className="text-slate-500 hover:text-white"><X size={28}/></button>
               </div>
               
               <div className="flex flex-col md:flex-row h-[70vh]">
                  {/* Left Column: Basic Info */}
                  <div className="w-full md:w-1/2 p-10 space-y-6 overflow-y-auto custom-scrollbar border-r border-slate-800">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assessment Label</label>
                       <input type="text" value={currentProblem.title} onChange={e => setCurrentProblem({...currentProblem, title: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-brand-green outline-none" placeholder="e.g. Master-Worker Architecture" required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Difficulty Tier</label>
                         <select value={currentProblem.difficulty} onChange={e => setCurrentProblem({...currentProblem, difficulty: e.target.value as Difficulty})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none">
                            <option value="L0">L0 - Foundations</option>
                            <option value="L1">L1 - Industrial</option>
                            <option value="L2">L2 - Mastery</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">XP Value</label>
                         <input type="number" value={currentProblem.points} onChange={e => setCurrentProblem({...currentProblem, points: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Instructions</label>
                       <textarea value={currentProblem.description} onChange={e => setCurrentProblem({...currentProblem, description: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-brand-green outline-none h-32" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><FileCode size={12}/> Starter Code</label>
                       <textarea value={currentProblem.starterCode} onChange={e => setCurrentProblem({...currentProblem, starterCode: e.target.value})} className="w-full bg-brand-night border border-slate-800 rounded-2xl px-5 py-4 text-emerald-400 font-mono text-xs focus:border-brand-green outline-none h-48" required />
                    </div>
                  </div>

                  {/* Right Column: Test Cases */}
                  <div className="w-full md:w-1/2 p-10 bg-brand-night/30 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                       <label className="text-[10px] font-bold text-brand-gold uppercase tracking-widest flex items-center gap-2"><Beaker size={14}/> Validation Test Cases</label>
                       <button type="button" onClick={addTestCase} className="text-[10px] bg-brand-green/20 text-brand-green px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-brand-green hover:text-white transition-all">Add Case</button>
                    </div>

                    <div className="space-y-6">
                       {currentProblem.testCases?.map((tc, idx) => (
                          <div key={idx} className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4 relative group">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Case #{idx + 1}</span>
                                <div className="flex items-center gap-4">
                                   <button type="button" onClick={() => updateTestCase(idx, { isHidden: !tc.isHidden })} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${tc.isHidden ? 'text-brand-orange' : 'text-slate-500'}`}>
                                      {tc.isHidden ? <><EyeOff size={12}/> Hidden</> : <><Eye size={12}/> Public</>}
                                   </button>
                                   <button type="button" onClick={() => removeTestCase(idx)} className="text-slate-700 hover:text-brand-orange transition-colors"><Trash2 size={14}/></button>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                   <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Stdin</div>
                                   <input type="text" value={tc.input} onChange={e => updateTestCase(idx, { input: e.target.value })} className="w-full bg-brand-night border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-brand-gold outline-none" placeholder="Input string..." />
                                </div>
                                <div className="space-y-1">
                                   <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Expected Stdout</div>
                                   <input type="text" value={tc.expectedOutput} onChange={e => updateTestCase(idx, { expectedOutput: e.target.value })} className="w-full bg-brand-night border border-slate-800 rounded-xl px-4 py-2 text-xs text-emerald-400 font-bold focus:border-brand-gold outline-none" placeholder="Expected result..." />
                                </div>
                             </div>
                          </div>
                       ))}
                       {(!currentProblem.testCases || currentProblem.testCases.length === 0) && (
                          <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                             <Beaker size={32} className="mx-auto text-slate-800 mb-2" />
                             <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">No validation cases defined</p>
                          </div>
                       )}
                    </div>
                  </div>
               </div>

               <div className="p-10 border-t border-slate-800 flex gap-4 bg-brand-forest-dark/5">
                  <button type="button" onClick={() => setIsEditingProblem(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold">Discard</button>
                  <button type="submit" className="flex-1 py-4 btn-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Commit Deployment</button>
               </div>
            </form>
         </div>
      )}
    </div>
  );
};

export default AdminDashboard;