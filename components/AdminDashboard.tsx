import React, { useState, useEffect } from 'react';
import { User, Problem, Difficulty, TestCase } from '../types';
import { LogOut, Plus, Users, BarChart3, Settings, BookOpen, Trash2, Edit, Code, Save, X, Folder, ChevronRight, ArrowLeft, LayoutGrid, CheckCircle, AlertCircle, XCircle, MessageSquare } from 'lucide-react';
import { dataService } from '../services/dataService';
import CommunityChat from './CommunityChat';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'labs' | 'students' | 'community'>('overview');
  
  // Lab Management State
  const [labView, setLabView] = useState<'folders' | 'questions'>('folders');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Modal States
  const [isEditingProblem, setIsEditingProblem] = useState(false);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [newLanguageName, setNewLanguageName] = useState('');
  
  const [currentProblem, setCurrentProblem] = useState<Partial<Problem>>({
    language: 'Python',
    difficulty: 'L0',
    title: '',
    description: '',
    starterCode: '',
    testCases: [],
    module: ''
  });

  // Initial Load
  useEffect(() => {
    refreshData();
  }, [activeTab]); 

  const refreshData = () => {
    // Force reload from local storage
    setLanguages(dataService.getLanguages());
    setProblems(dataService.getProblems());
    setUsersList(dataService.getUsers().filter(u => u.role === 'STUDENT'));
  };

  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLanguageName.trim()) return;
    
    dataService.addLanguage(newLanguageName.trim());
    setIsAddingLanguage(false);
    setNewLanguageName('');
    refreshData();
  };

  const handleSaveProblem = () => {
    if (!currentProblem.title || !currentProblem.description || !selectedLanguage) return;
    
    const problemToSave: Problem = {
      id: currentProblem.id || Math.random().toString(36).substr(2, 9),
      title: currentProblem.title!,
      description: currentProblem.description!,
      language: selectedLanguage, // Force current folder language
      difficulty: (currentProblem.difficulty as Difficulty) || 'L0',
      starterCode: currentProblem.starterCode || '// Write code here',
      testCases: currentProblem.testCases || [],
      module: currentProblem.module || 'General' // Default to General if empty
    };

    if (currentProblem.id) {
      dataService.updateProblem(problemToSave);
    } else {
      dataService.addProblem(problemToSave);
    }
    
    setIsEditingProblem(false);
    setCurrentProblem({ language: selectedLanguage, difficulty: 'L0', title: '', description: '', starterCode: '', testCases: [], module: '' });
    refreshData();
  };

  const handleDeleteProblem = (id: string) => {
    if(window.confirm("Are you sure you want to delete this question?")) {
      dataService.deleteProblem(id);
      refreshData();
    }
  };

  const handleEditProblem = (prob: Problem) => {
    setCurrentProblem(JSON.parse(JSON.stringify(prob))); 
    setIsEditingProblem(true);
  };

  const handleApprovePayment = (studentId: string) => {
    // Explicitly ask for confirmation
    if (window.confirm("Grant portal access to this student?")) {
      const approvedUser = dataService.approvePayment(studentId);
      refreshData(); // Immediate UI update
      if (approvedUser) {
        // Explicit success feedback as requested
        alert(`Successfully Approved! ${approvedUser.name} now has access.`);
      }
    }
  };

  const handleRejectPayment = (studentId: string) => {
    if (window.confirm("Reject access for this student?")) {
      dataService.rejectPayment(studentId);
      refreshData();
    }
  };
  
  // Test Case Management inside Modal
  const addTestCase = () => {
    const newCase: TestCase = { input: '', expectedOutput: '', isHidden: false };
    setCurrentProblem({
      ...currentProblem,
      testCases: [...(currentProblem.testCases || []), newCase]
    });
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: any) => {
    const updatedCases = [...(currentProblem.testCases || [])];
    updatedCases[index] = { ...updatedCases[index], [field]: value };
    setCurrentProblem({ ...currentProblem, testCases: updatedCases });
  };

  const removeTestCase = (index: number) => {
    const updatedCases = [...(currentProblem.testCases || [])];
    updatedCases.splice(index, 1);
    setCurrentProblem({ ...currentProblem, testCases: updatedCases });
  };

  const availableModules = selectedLanguage ? dataService.getModulesByLanguage(selectedLanguage) : [];

  const stats = [
    { title: 'Total Students', value: usersList.length.toString(), icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { title: 'Total Problems', value: problems.length.toString(), icon: Code, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { title: 'Pending Payments', value: usersList.filter(u => u.paymentStatus === 'PENDING_APPROVAL').length.toString(), icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 font-sans">
      <nav className="h-16 border-b border-slate-800 bg-[#0a101f]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">A</div>
          <span className="font-bold text-lg text-white tracking-tight">TechNexus <span className="text-cyan-400">Admin</span></span>
        </div>
        <div className="flex items-center gap-6">
           <span className="text-sm text-slate-400">Session: <span className="text-cyan-300 font-medium">{user.name}</span></span>
           <button onClick={onLogout} className="text-slate-400 hover:text-red-400 transition-colors">
             <LogOut size={20} />
           </button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-64 border-r border-slate-800 bg-[#0a101f]/50 hidden md:block p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'overview' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <BarChart3 size={18} />
            Overview
          </button>
          <button 
            onClick={() => { setActiveTab('students'); refreshData(); }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'students' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={18} />
            Students List
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'community' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <MessageSquare size={18} />
            Student Community
          </button>
          <button 
            onClick={() => setActiveTab('labs')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'labs' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutGrid size={18} />
            Labs & Languages
          </button>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-8">
               <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {stats.map((stat, idx) => (
                   <div key={idx} className="glass-panel p-6 rounded-xl flex items-center gap-4 hover:border-cyan-500/30 transition-all duration-300">
                     <div className={`p-4 rounded-xl ${stat.bg}`}>
                       <stat.icon className={stat.color} size={24} />
                     </div>
                     <div>
                       <div className="text-slate-400 text-sm font-medium">{stat.title}</div>
                       <div className="text-3xl font-bold text-white mt-1">{stat.value}</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'community' && (
             <div className="animate-fade-in h-[calc(100vh-140px)]">
                <CommunityChat currentUser={user} />
             </div>
          )}

          {activeTab === 'students' && (
             <div className="animate-fade-in">
               <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-white">Enrolled Students</h1>
                  <button onClick={refreshData} className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-xs font-bold">Refresh List</button>
               </div>
               
               <div className="glass-panel rounded-xl overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-[#0f172a] text-slate-400 text-xs uppercase font-bold border-b border-slate-700">
                     <tr>
                       <th className="p-4 pl-6">Name</th>
                       <th className="p-4">Email</th>
                       <th className="p-4">Status</th>
                       <th className="p-4">Plan</th>
                       <th className="p-4 text-right pr-6">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {usersList.map((student) => (
                       <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                         <td className="p-4 pl-6 font-medium text-white">{student.name}</td>
                         <td className="p-4 text-slate-400">{student.email}</td>
                         <td className="p-4">
                           {student.paymentStatus === 'APPROVED' ? (
                             <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 flex w-fit items-center gap-1">
                               <CheckCircle size={10} /> Active
                             </span>
                           ) : student.paymentStatus === 'PENDING_APPROVAL' ? (
                             <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30 flex w-fit items-center gap-1 animate-pulse">
                               <AlertCircle size={10} /> Pending
                             </span>
                           ) : student.paymentStatus === 'REJECTED' ? (
                             <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 flex w-fit items-center gap-1">
                               <XCircle size={10} /> Rejected
                             </span>
                           ) : (
                             <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs font-bold rounded-full border border-slate-600">
                               Not Paid
                             </span>
                           )}
                         </td>
                         <td className="p-4 text-slate-300 text-sm">{student.plan || '-'}</td>
                         <td className="p-4 text-right pr-6">
                            {student.paymentStatus === 'PENDING_APPROVAL' ? (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleApprovePayment(student.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-colors shadow-lg shadow-emerald-900/20"
                                >
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button 
                                  onClick={() => handleRejectPayment(student.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 hover:text-white text-red-400 text-xs font-bold rounded transition-colors border border-red-900/30"
                                >
                                  <XCircle size={12} /> Reject
                                </button>
                              </div>
                            ) : (
                               <div className="flex justify-end">
                                 <span className="text-slate-600 text-xs italic">No actions available</span>
                               </div>
                            )}
                         </td>
                       </tr>
                     ))}
                     {usersList.length === 0 && (
                       <tr>
                         <td colSpan={5} className="p-8 text-center text-slate-500">No students found.</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === 'labs' && (
            <div className="animate-fade-in space-y-6">
              {labView === 'folders' ? (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">Practice Labs</h1>
                      <p className="text-slate-400">Select a language module to manage its questions.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddingLanguage(true)}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg shadow-violet-500/20 hover:scale-105"
                    >
                      <Plus size={18} />
                      New Language
                    </button>
                  </div>

                  {isAddingLanguage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                       <form onSubmit={handleAddLanguage} className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-xl p-6 shadow-2xl">
                          <h3 className="text-xl font-bold text-white mb-4">Introduce New Language</h3>
                          <input 
                             autoFocus
                             type="text" 
                             value={newLanguageName}
                             onChange={e => setNewLanguageName(e.target.value)}
                             placeholder="e.g. Rust, Go, Ruby"
                             className="w-full bg-[#1e293b] border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none mb-6"
                          />
                          <div className="flex justify-end gap-3">
                             <button type="button" onClick={() => setIsAddingLanguage(false)} className="text-slate-400 hover:text-white px-4 py-2">Cancel</button>
                             <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold">Create Module</button>
                          </div>
                       </form>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {languages.map(lang => {
                      const count = problems.filter(p => p.language === lang).length;
                      return (
                        <div 
                          key={lang}
                          onClick={() => { setSelectedLanguage(lang); setLabView('questions'); }}
                          className="glass-panel p-6 rounded-xl cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all duration-300 group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <ChevronRight className="text-cyan-400" />
                          </div>
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                             <Folder size={28} className="text-cyan-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">{lang}</h3>
                          <p className="text-slate-400 text-sm">{count} Questions</p>
                          <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                             <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-1/3"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => { setLabView('folders'); setSelectedLanguage(null); }}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                         <ArrowLeft size={20} />
                      </button>
                      <nav className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Labs</span>
                        <ChevronRight size={14} className="text-slate-600" />
                        <span className="text-cyan-400 font-bold text-lg">{selectedLanguage}</span>
                      </nav>
                    </div>
                    <button 
                      onClick={() => {
                        setCurrentProblem({ language: selectedLanguage!, difficulty: 'L0', title: '', description: '', starterCode: '', testCases: [], module: '' });
                        setIsEditingProblem(true);
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-lg shadow-cyan-500/20"
                    >
                      <Plus size={18} />
                      Add Question
                    </button>
                  </div>

                  {isEditingProblem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                       <div className="bg-[#0f172a] border border-slate-700 w-full max-w-3xl rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                               <Code className="text-cyan-400" />
                               {currentProblem.id ? 'Edit Question' : `New ${selectedLanguage} Question`}
                            </h2>
                            <button onClick={() => setIsEditingProblem(false)} className="text-slate-400 hover:text-white"><X /></button>
                          </div>
                          
                          <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Language (Fixed)</label>
                                 <input 
                                   disabled 
                                   value={selectedLanguage!} 
                                   className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-400 cursor-not-allowed"
                                 />
                               </div>
                               <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Module Name</label>
                                 <input 
                                    list="module-suggestions"
                                    type="text"
                                    value={currentProblem.module}
                                    onChange={e => setCurrentProblem({...currentProblem, module: e.target.value})}
                                    placeholder="e.g. Basic Python, Arrays"
                                    className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none"
                                 />
                                 <datalist id="module-suggestions">
                                    {availableModules.map(m => <option key={m} value={m} />)}
                                 </datalist>
                               </div>
                            </div>

                            <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Difficulty</label>
                                 <select 
                                   value={currentProblem.difficulty} 
                                   onChange={e => setCurrentProblem({...currentProblem, difficulty: e.target.value as Difficulty})}
                                   className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none"
                                 >
                                   {['L0', 'L1', 'L2'].map(l => <option key={l} value={l}>{l}</option>)}
                                 </select>
                             </div>
                            
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                              <input 
                                type="text" 
                                value={currentProblem.title}
                                onChange={e => setCurrentProblem({...currentProblem, title: e.target.value})}
                                className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-white focus:border-cyan-500 outline-none"
                                placeholder="e.g. Sum of Array"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                              <textarea 
                                value={currentProblem.description}
                                onChange={e => setCurrentProblem({...currentProblem, description: e.target.value})}
                                className="w-full bg-[#1e293b] border border-slate-600 rounded p-2 text-white h-24 focus:border-cyan-500 outline-none"
                                placeholder="Describe the problem..."
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Starter Code Template</label>
                              <textarea 
                                value={currentProblem.starterCode}
                                onChange={e => setCurrentProblem({...currentProblem, starterCode: e.target.value})}
                                className="w-full bg-[#050b14] border border-slate-700 rounded p-3 text-emerald-400 font-mono text-sm h-40 focus:border-emerald-500 outline-none"
                                placeholder="// Code here..."
                                spellCheck="false"
                              />
                            </div>

                            <div className="border-t border-slate-700 pt-4">
                              <div className="flex justify-between items-center mb-3">
                                <label className="block text-xs font-bold text-slate-400 uppercase">Test Cases</label>
                                <button type="button" onClick={addTestCase} className="text-cyan-400 text-xs hover:underline">+ Add Case</button>
                              </div>
                              <div className="space-y-3">
                                {currentProblem.testCases?.map((tc, index) => (
                                  <div key={index} className="flex gap-2 items-start bg-slate-900 p-2 rounded border border-slate-700">
                                    <div className="flex-1">
                                      <input 
                                        type="text" 
                                        placeholder="Input"
                                        value={tc.input}
                                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white mb-2 font-mono"
                                      />
                                      <input 
                                        type="text" 
                                        placeholder="Expected Output"
                                        value={tc.expectedOutput}
                                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-emerald-400 font-mono"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-2 items-center">
                                       <button onClick={() => removeTestCase(index)} className="text-slate-500 hover:text-red-400"><X size={14} /></button>
                                       <label className="text-[10px] text-slate-500 flex flex-col items-center cursor-pointer">
                                         <input 
                                            type="checkbox" 
                                            checked={tc.isHidden} 
                                            onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                                            className="accent-cyan-500"
                                         />
                                         Hidden
                                       </label>
                                    </div>
                                  </div>
                                ))}
                                {(!currentProblem.testCases || currentProblem.testCases.length === 0) && (
                                  <div className="text-center text-xs text-slate-500 py-2 border border-dashed border-slate-700 rounded">No test cases added.</div>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                              <button onClick={() => setIsEditingProblem(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                              <button onClick={handleSaveProblem} className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded font-bold flex items-center gap-2 shadow-lg">
                                <Save size={16} /> Save Changes
                              </button>
                            </div>
                          </div>
                       </div>
                    </div>
                  )}

                  <div className="glass-panel rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#0f172a] text-slate-400 text-xs uppercase font-bold border-b border-slate-700">
                        <tr>
                          <th className="p-4 pl-6">Title</th>
                          <th className="p-4">Module</th>
                          <th className="p-4">Level</th>
                          <th className="p-4 text-right pr-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {problems.filter(p => p.language === selectedLanguage).map(prob => (
                          <tr key={prob.id} className="hover:bg-slate-800/50 transition-colors group">
                            <td className="p-4 pl-6">
                              <div className="font-medium text-slate-200">{prob.title}</div>
                              <div className="text-xs text-slate-500 truncate max-w-xs">{prob.description}</div>
                            </td>
                             <td className="p-4">
                              <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-400">
                                {prob.module || 'General'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                prob.difficulty === 'L0' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                prob.difficulty === 'L1' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              }`}>
                                {prob.difficulty}
                              </span>
                            </td>
                            <td className="p-4 pr-6 flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditProblem(prob)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDeleteProblem(prob.id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 rounded hover:bg-slate-700 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {problems.filter(p => p.language === selectedLanguage).length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-slate-500">
                               <div className="flex flex-col items-center gap-2">
                                  <Code size={40} className="opacity-20" />
                                  <p>No questions added to this module yet.</p>
                               </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;