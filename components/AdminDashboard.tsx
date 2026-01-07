
import React, { useState, useEffect } from 'react';
import { User, GlobalSettings, CourseModule, Problem, Difficulty, TestCase } from '../types';
import { LogOut, Users, BarChart3, ShieldCheck, Settings, Save, Lock, Smartphone, LayoutGrid, MessageSquare, AlertCircle, ShieldAlert, Clock, BookOpen, Plus, Trash2, Edit, ChevronRight, ArrowLeft, Code2, CheckSquare, Layers, Folder, X, Bold, Italic, Underline, AlignLeft, List, Type, FileCode2, UploadCloud, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { dataService } from '../services/dataService';
import CommunityChat from './CommunityChat';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'security' | 'personnel' | 'community' | 'academy'>('telemetry');
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Python');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isEditingModule, setIsEditingModule] = useState<boolean>(false);
  const [editingModule, setEditingModule] = useState<Partial<CourseModule>>({});

  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('L0');
  const [moduleProblems, setModuleProblems] = useState<Problem[]>([]);
  const [isEditingProblem, setIsEditingProblem] = useState<boolean>(false);
  const [editingProblem, setEditingProblem] = useState<Partial<Problem>>({});

  // Bulk Upload State
  const [csvData, setCsvData] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Student Registry State
  const [allStudents, setAllStudents] = useState<User[]>([]);

  useEffect(() => {
    setModules(dataService.getModulesByLanguage(selectedLanguage));
    setActiveModule(null);
  }, [selectedLanguage, activeTab]);

  useEffect(() => {
    if (activeModule) loadProblems(activeModule);
  }, [activeModule, selectedDifficulty]);
  
  useEffect(() => {
     if(activeTab === 'personnel') {
        const users = dataService.getUsers().filter(u => u.role === 'STUDENT');
        setAllStudents(users);
     }
  }, [activeTab]);

  const refreshStudents = () => {
    const users = dataService.getUsers().filter(u => u.role === 'STUDENT');
    setAllStudents(users);
  };

  const loadProblems = (module: CourseModule) => {
     const allProblems = dataService.getProblemsByModule(module.language, module.title);
     setModuleProblems(allProblems.filter(p => p.difficulty === selectedDifficulty));
  };

  const handleSaveModule = (e: React.FormEvent) => {
     e.preventDefault();
     if (editingModule.title && editingModule.description && editingModule.category) {
        if (editingModule.id) {
           dataService.updateModule(editingModule as CourseModule);
        } else {
           const newModule: CourseModule = {
              id: `${selectedLanguage.toLowerCase()}-${Date.now()}`,
              language: selectedLanguage,
              title: editingModule.title!,
              category: editingModule.category!,
              description: editingModule.description!,
              icon: 'BookOpen'
           };
           dataService.addModule(newModule);
        }
        setModules(dataService.getModulesByLanguage(selectedLanguage));
        setIsEditingModule(false);
        setEditingModule({});
     }
  };

  const handleCreateProblem = () => {
    if (!activeModule) return;
    setEditingProblem({
       id: `PROB-${Date.now()}`,
       language: activeModule.language,
       allowedLanguages: ['Python'],
       module: activeModule.title,
       difficulty: selectedDifficulty,
       title: 'New Programming Problem',
       description: '',
       inputFormat: 'NA',
       outputFormat: '',
       constraints: 'NA',
       points: 10,
       starterCode: '',
       sampleAnswer: '',
       testCases: [{ input: 'NA', expectedOutput: '', isHidden: false, isSample: false }]
    });
    setIsEditingProblem(true);
  };

  const handleEditProblem = (prob: Problem) => {
     setEditingProblem(JSON.parse(JSON.stringify(prob)));
     setIsEditingProblem(true);
  };

  const handleSaveProblem = (e: React.FormEvent) => {
     e.preventDefault();
     if (editingProblem.title && activeModule) {
        // Ensure module is set correctly
        editingProblem.module = activeModule.title;
        
        if (dataService.getProblems().find(p => p.id === editingProblem.id)) {
           dataService.updateProblem(editingProblem as Problem);
        } else {
           dataService.addProblem(editingProblem as Problem);
        }
        loadProblems(activeModule);
        setIsEditingProblem(false);
     }
  };

  const handleBulkUpload = () => {
    if(!csvData.trim()) return;
    
    // Parse CSV: Name,Email,Password,College
    const lines = csvData.split('\n');
    const usersToRegister = [];
    
    for(let line of lines) {
        const [name, email, password, college] = line.split(',');
        if(name && email && password && college) {
            usersToRegister.push({
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
                college: college.trim()
            });
        }
    }

    if(usersToRegister.length > 0) {
        const count = dataService.bulkRegisterUsers(usersToRegister);
        setUploadStatus(`Successfully registered ${count} new students.`);
        setCsvData('');
        refreshStudents();
    } else {
        setUploadStatus('Invalid Data Format. Use: Name,Email,Password,College');
    }

    setTimeout(() => setUploadStatus(''), 5000);
  };
  
  const approveStudent = (id: string) => {
      if(window.confirm('Approve payment and grant access?')) {
          dataService.approvePayment(id);
          refreshStudents();
      }
  };

  const rejectStudent = (id: string) => {
      if(window.confirm('Reject payment request?')) {
          dataService.rejectPayment(id);
          refreshStudents();
      }
  };

  const groupedModules = modules.reduce((acc, mod) => {
      if (!acc[mod.category]) acc[mod.category] = [];
      acc[mod.category].push(mod);
      return acc;
  }, {} as Record<string, CourseModule[]>);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans">
      <nav className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 md:w-11 md:h-11 bg-[#ff8c00] rounded-xl flex items-center justify-center font-black text-white shadow-lg text-xs md:text-base">NC</div>
          <h1 className="font-heading font-black text-lg md:text-2xl tracking-tighter uppercase text-slate-800">Nexus <span className="text-[#ff8c00]">Command</span></h1>
        </div>
        <div className="flex items-center gap-6">
           <button onClick={onLogout} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"><LogOut size={20}/></button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-4 md:p-8 space-y-4 shrink-0 overflow-y-auto max-h-[200px] md:max-h-full">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">System Control</span>
             <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                <button onClick={() => setActiveTab('telemetry')} className={`w-auto md:w-full text-left px-5 py-3 rounded-xl flex items-center gap-3 transition-all whitespace-nowrap ${activeTab === 'telemetry' ? 'bg-[#ff8c00] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <BarChart3 size={18} /> <span className="text-xs font-bold uppercase tracking-wider">Stats</span>
                </button>
                <button onClick={() => setActiveTab('academy')} className={`w-auto md:w-full text-left px-5 py-3 rounded-xl flex items-center gap-3 transition-all whitespace-nowrap ${activeTab === 'academy' ? 'bg-[#ff8c00] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <BookOpen size={18} /> <span className="text-xs font-bold uppercase tracking-wider">Curriculum</span>
                </button>
                <button onClick={() => setActiveTab('personnel')} className={`w-auto md:w-full text-left px-5 py-3 rounded-xl flex items-center gap-3 transition-all whitespace-nowrap ${activeTab === 'personnel' ? 'bg-[#ff8c00] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Users size={18} /> <span className="text-xs font-bold uppercase tracking-wider">Personnel</span>
                </button>
             </div>
        </aside>

        <main className="flex-1 p-4 md:p-12 overflow-y-auto custom-scrollbar bg-[#f9fafb]">
          {activeTab === 'academy' && (
             <div className="max-w-6xl mx-auto space-y-8">
                {!activeModule && !isEditingModule && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <h2 className="text-2xl md:text-3xl font-heading font-black text-slate-800 uppercase tracking-tighter">Academic <span className="text-[#ff8c00]">Library</span></h2>
                            <div className="flex gap-2 flex-wrap">
                                {dataService.getLanguages().map(lang => (
                                    <button key={lang} onClick={() => setSelectedLanguage(lang)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${selectedLanguage === lang ? 'bg-[#ff8c00] text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>{lang}</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => { setIsEditingModule(true); setEditingModule({}); }} className="px-6 py-3 bg-[#ff8c00] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus size={16}/> New Module</button>
                        
                        {(Object.entries(groupedModules) as [string, CourseModule[]][]).map(([category, catModules]) => (
                            <div key={category} className="space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">{category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {catModules.map(mod => (
                                        <div key={mod.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between group hover:border-[#ff8c00] transition-all h-48 shadow-sm">
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-1">{mod.title}</h4>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{mod.language}</p>
                                            </div>
                                            <button onClick={() => setActiveModule(mod)} className="w-full py-2.5 rounded-lg bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-[#ff8c00] hover:text-white transition-all">Enter Lab</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeModule && !isEditingProblem && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <button onClick={() => setActiveModule(null)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold text-xs uppercase tracking-widest"><ArrowLeft size={16} /> Back to Modules</button>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase">{activeModule.title} <span className="text-slate-300">/</span> {selectedDifficulty}</h3>
                            <button onClick={handleCreateProblem} className="px-6 py-3 bg-[#ff8c00] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus size={16}/> Add Question</button>
                        </div>
                        <div className="flex gap-2 mb-8">
                            {['L0', 'L1', 'L2'].map(d => (
                                <button key={d} onClick={() => setSelectedDifficulty(d as Difficulty)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedDifficulty === d ? 'bg-[#ff8c00] text-white' : 'bg-slate-200 text-slate-500'}`}>{d}</button>
                            ))}
                        </div>
                        <div className="grid gap-3">
                            {moduleProblems.map(p => (
                                <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-[#ff8c00] shadow-sm">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{p.title}</h4>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">Marks: {p.points} • {p.testCases.length} Test Cases</p>
                                    </div>
                                    <button onClick={() => handleEditProblem(p)} className="p-2 text-slate-300 hover:text-[#ff8c00] transition-colors"><Edit size={16}/></button>
                                </div>
                            ))}
                            {moduleProblems.length === 0 && (
                                <div className="p-8 text-center text-slate-400 italic">No problems added for this difficulty yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Edit Problem Modal Logic would go here (Simplified for view) */}
                 {isEditingProblem && (
                    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                       <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl">
                          <div className="flex justify-between items-center mb-6">
                             <h3 className="font-bold text-lg">Edit Problem</h3>
                             <button onClick={() => setIsEditingProblem(false)}><X size={20} className="text-slate-400"/></button>
                          </div>
                          <form onSubmit={handleSaveProblem} className="space-y-4">
                             <input className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" placeholder="Problem Title" value={editingProblem.title} onChange={e => setEditingProblem({...editingProblem, title: e.target.value})} required/>
                             <textarea className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 h-24" placeholder="Description" value={editingProblem.description} onChange={e => setEditingProblem({...editingProblem, description: e.target.value})} required/>
                             <textarea className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-sm rounded-xl h-32" placeholder="Starter Code" value={editingProblem.starterCode} onChange={e => setEditingProblem({...editingProblem, starterCode: e.target.value})} required/>
                             <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 py-2 bg-[#ff8c00] text-white font-bold rounded-xl uppercase text-xs tracking-widest">Save Changes</button>
                             </div>
                          </form>
                       </div>
                    </div>
                 )}
             </div>
          )}
          
          {activeTab === 'personnel' && (
             <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in">
                 
                 {/* Student Registry Table */}
                 <div>
                    <h2 className="text-3xl font-heading font-black text-slate-800 uppercase tracking-tighter mb-6">Student <span className="text-[#ff8c00]">Registry</span></h2>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                       <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-100">
                             <tr>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">College</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Status</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {allStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50/50">
                                   <td className="p-4 text-sm font-bold text-slate-700">{student.name}</td>
                                   <td className="p-4 text-xs font-medium text-slate-500">{student.email}</td>
                                   <td className="p-4 text-xs font-bold text-slate-600">{student.college || 'N/A'}</td>
                                   <td className="p-4">
                                      {student.paymentStatus === 'APPROVED' ? (
                                         <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center w-fit gap-1">
                                            <CheckCircle size={10}/> Active
                                         </span>
                                      ) : student.paymentStatus === 'PENDING_APPROVAL' ? (
                                         <span className="px-2 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center w-fit gap-1 animate-pulse">
                                            <Clock size={10}/> Pending
                                         </span>
                                      ) : (
                                         <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                                            Unpaid
                                         </span>
                                      )}
                                   </td>
                                   <td className="p-4 text-right">
                                      {student.paymentStatus === 'PENDING_APPROVAL' && (
                                         <div className="flex justify-end gap-2">
                                            <button onClick={() => approveStudent(student.id)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">Approve</button>
                                            <button onClick={() => rejectStudent(student.id)} className="px-3 py-1 bg-red-50 text-red-500 hover:bg-red-100 text-[10px] font-bold uppercase tracking-widest rounded">Reject</button>
                                         </div>
                                      )}
                                   </td>
                                </tr>
                             ))}
                             {allStudents.length === 0 && (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-xs uppercase tracking-widest">No Students Found</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>

                 <div className="border-t border-slate-200 pt-8">
                    <div>
                        <h2 className="text-xl font-heading font-black text-slate-800 uppercase tracking-tighter mb-2">Bulk <span className="text-slate-400">Import</span></h2>
                        <p className="text-sm text-slate-500 mb-6">Upload batch data to register multiple students at once.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-start gap-4 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm">
                            <FileSpreadsheet className="shrink-0 mt-0.5" size={18}/>
                            <div>
                                <p className="font-bold mb-1">CSV Format Required</p>
                                <p className="font-mono text-xs">Name, Email, Password, College</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <textarea 
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 focus:border-[#ff8c00] outline-none"
                            placeholder={`John Doe, john@example.com, 123456, JNTU\nJane Smith, jane@example.com, securepass, OU`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-emerald-600">{uploadStatus}</p>
                            <button 
                            onClick={handleBulkUpload}
                            className="px-8 py-3 bg-[#ff8c00] hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
                            >
                            <UploadCloud size={16}/> Process Upload
                            </button>
                        </div>
                    </div>
                 </div>
             </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-300">
               <BarChart3 size={48} className="animate-pulse" />
               <p className="font-bold text-xs uppercase tracking-widest text-slate-400">Awaiting Registry Sync...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
