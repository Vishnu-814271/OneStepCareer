
import React, { useState, useEffect } from 'react';
import { User, GlobalSettings, CourseModule, Problem, Difficulty, TestCase } from '../types';
import { LogOut, Users, BarChart3, ShieldCheck, Settings, Save, Lock, Smartphone, LayoutGrid, MessageSquare, AlertCircle, ShieldAlert, Clock, BookOpen, Plus, Trash2, Edit, ChevronRight, ArrowLeft, Code2, CheckSquare, Layers, Folder, X, Bold, Italic, Underline, AlignLeft, List, Type, FileCode2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import CommunityChat from './CommunityChat';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'security' | 'personnel' | 'community' | 'academy'>('telemetry');
  const [settings, setSettings] = useState<GlobalSettings>(dataService.getSettings());
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Python');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isEditingModule, setIsEditingModule] = useState<boolean>(false);
  const [editingModule, setEditingModule] = useState<Partial<CourseModule>>({});

  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('L0');
  const [moduleProblems, setModuleProblems] = useState<Problem[]>([]);
  const [isEditingProblem, setIsEditingProblem] = useState<boolean>(false);
  const [editingProblem, setEditingProblem] = useState<Partial<Problem>>({});

  useEffect(() => {
    setModules(dataService.getModulesByLanguage(selectedLanguage));
    setActiveModule(null);
  }, [selectedLanguage, activeTab]);

  useEffect(() => {
    if (activeModule) loadProblems(activeModule);
  }, [activeModule, selectedDifficulty]);

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
        if (dataService.getProblems().find(p => p.id === editingProblem.id)) {
           dataService.updateProblem(editingProblem as Problem);
        } else {
           dataService.addProblem(editingProblem as Problem);
        }
        loadProblems(activeModule);
        setIsEditingProblem(false);
     }
  };

  const RichToolbar = () => (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-200 bg-slate-50 overflow-x-auto">
       <Bold size={14} className="text-slate-400 cursor-pointer hover:text-slate-900 shrink-0" />
       <Italic size={14} className="text-slate-400 cursor-pointer hover:text-slate-900 shrink-0" />
       <Underline size={14} className="text-slate-400 cursor-pointer hover:text-slate-900 shrink-0" />
       <Type size={14} className="text-slate-400 cursor-pointer hover:text-slate-900 ml-2 shrink-0" />
       <div className="w-px h-4 bg-slate-200 mx-2 shrink-0"></div>
       <AlignLeft size={14} className="text-slate-400 cursor-pointer hover:text-slate-900 shrink-0" />
       <List size={14} className="text-slate-400 cursor-pointer hover:text-slate-900 shrink-0" />
    </div>
  );

  const groupedModules = modules.reduce((acc, mod) => {
      if (!acc[mod.category]) acc[mod.category] = [];
      acc[mod.category].push(mod);
      return acc;
  }, {} as Record<string, CourseModule[]>);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
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
                        </div>
                    </div>
                )}

                {isEditingProblem && (
                    <div className="fixed inset-0 z-[100] bg-slate-200/40 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-in fade-in">
                        <div className="bg-white w-full max-w-5xl h-full md:max-h-[95vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                            <div className="px-4 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h3 className="text-lg md:text-xl font-heading font-black text-slate-800 uppercase tracking-tight">Edit Question</h3>
                                <button onClick={() => setIsEditingProblem(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-10 bg-white">
                                <form id="mainProblemForm" onSubmit={handleSaveProblem} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Question Type</label>
                                                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#ff8c00]">
                                                    <option>Programming</option>
                                                    <option>Multiple Choice</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Question Title</label>
                                                <input 
                                                    type="text" 
                                                    value={editingProblem.title || ''} 
                                                    onChange={e => setEditingProblem({...editingProblem, title: e.target.value})}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#ff8c00]"
                                                    placeholder="Print the following output"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Marks</label>
                                                <input 
                                                    type="number" 
                                                    value={editingProblem.points || 0} 
                                                    onChange={e => setEditingProblem({...editingProblem, points: Number(e.target.value)})}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#ff8c00]"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Level</label>
                                                <select 
                                                    value={editingProblem.difficulty} 
                                                    onChange={e => setEditingProblem({...editingProblem, difficulty: e.target.value as Difficulty})}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#ff8c00]"
                                                >
                                                    <option value="L0">Level - 0</option>
                                                    <option value="L1">Level - 1</option>
                                                    <option value="L2">Level - 2</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Language</label>
                                                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#ff8c00]">
                                                    <option>English</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Question Data</label>
                                        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#ff8c00] transition-colors bg-slate-50">
                                            <RichToolbar />
                                            <textarea 
                                                value={editingProblem.description} 
                                                onChange={e => setEditingProblem({...editingProblem, description: e.target.value})}
                                                className="w-full h-48 p-4 text-sm text-slate-600 outline-none resize-none bg-transparent"
                                                placeholder="Enter detailed question statement..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Input Format</label>
                                        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#ff8c00] transition-colors bg-slate-50">
                                            <RichToolbar />
                                            <textarea 
                                                value={editingProblem.inputFormat} 
                                                onChange={e => setEditingProblem({...editingProblem, inputFormat: e.target.value})}
                                                className="w-full h-32 p-4 text-sm text-slate-600 outline-none resize-none bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Output Format</label>
                                        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#ff8c00] transition-colors bg-slate-50">
                                            <RichToolbar />
                                            <textarea 
                                                value={editingProblem.outputFormat} 
                                                onChange={e => setEditingProblem({...editingProblem, outputFormat: e.target.value})}
                                                className="w-full h-32 p-4 text-sm text-slate-600 outline-none resize-none bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Constraints</label>
                                        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#ff8c00] transition-colors bg-slate-50">
                                            <RichToolbar />
                                            <textarea 
                                                value={editingProblem.constraints} 
                                                onChange={e => setEditingProblem({...editingProblem, constraints: e.target.value})}
                                                className="w-full h-32 p-4 text-sm text-slate-600 outline-none resize-none bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Answer Reference</label>
                                        <div className="border border-[#ff8c00]/20 rounded-xl overflow-hidden font-mono bg-orange-50/30">
                                            <div className="px-4 py-2 border-b border-[#ff8c00]/10 flex items-center gap-2">
                                                <FileCode2 size={14} className="text-[#ff8c00]" />
                                                <span className="text-[10px] text-[#ff8c00] uppercase tracking-widest font-bold">Solution Reference</span>
                                            </div>
                                            <textarea 
                                                value={editingProblem.sampleAnswer || ''} 
                                                onChange={e => setEditingProblem({...editingProblem, sampleAnswer: e.target.value})}
                                                className="w-full h-40 p-4 text-sm text-slate-700 bg-transparent outline-none resize-none"
                                                spellCheck="false"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Code Stub</label>
                                        </div>
                                        <div className="border border-slate-200 rounded-xl overflow-hidden p-6 space-y-4 bg-slate-50">
                                            <select className="w-full md:w-48 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-500">
                                                <option>Python</option>
                                            </select>
                                            <textarea 
                                                value={editingProblem.starterCode}
                                                onChange={e => setEditingProblem({...editingProblem, starterCode: e.target.value})}
                                                className="w-full h-32 p-4 bg-white border border-slate-200 rounded-lg outline-none text-xs font-mono text-slate-700"
                                                placeholder="Enter boiler plate code stub here..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Test cases</label>
                                            <button 
                                                type="button" 
                                                onClick={() => setEditingProblem({...editingProblem, testCases: [...(editingProblem.testCases || []), { input: '', expectedOutput: '', isHidden: false, isSample: false }]})}
                                                className="px-5 py-2 bg-[#ff8c00] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md hover:bg-orange-600 transition-colors"
                                            >
                                                Add Test case
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {editingProblem.testCases?.map((tc, idx) => (
                                                <div key={idx} className="border border-slate-200 rounded-xl p-4 md:p-8 relative space-y-6 group bg-white shadow-sm">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setEditingProblem({...editingProblem, testCases: editingProblem.testCases?.filter((_, i) => i !== idx)})}
                                                        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>

                                                    <div className="w-full md:w-1/3">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Is Sample</label>
                                                        <select 
                                                            value={tc.isSample ? 'Yes' : 'No'}
                                                            onChange={e => {
                                                                const newTC = [...(editingProblem.testCases || [])];
                                                                newTC[idx].isSample = e.target.value === 'Yes';
                                                                setEditingProblem({...editingProblem, testCases: newTC});
                                                            }}
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#ff8c00]"
                                                        >
                                                            <option>No</option>
                                                            <option>Yes</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Input Data</label>
                                                        <textarea 
                                                            value={tc.input}
                                                            onChange={e => {
                                                                const newTC = [...(editingProblem.testCases || [])];
                                                                newTC[idx].input = e.target.value;
                                                                setEditingProblem({...editingProblem, testCases: newTC});
                                                            }}
                                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#ff8c00] h-20 resize-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Output Data</label>
                                                        <textarea 
                                                            value={tc.expectedOutput}
                                                            onChange={e => {
                                                                const newTC = [...(editingProblem.testCases || [])];
                                                                newTC[idx].expectedOutput = e.target.value;
                                                                setEditingProblem({...editingProblem, testCases: newTC});
                                                            }}
                                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-[#ff8c00] h-20 resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-10 pb-20 md:pb-0">
                                        <button 
                                            type="submit"
                                            className="px-10 py-3 bg-[#ff8c00] text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl hover:scale-105 transition-transform"
                                        >
                                            Submit Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
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
