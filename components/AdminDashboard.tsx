
import React, { useState, useEffect } from 'react';
import { User, GlobalSettings, CourseModule, Problem, Difficulty, TestCase } from '../types';
import { LogOut, Users, BarChart3, ShieldCheck, Settings, Save, Lock, Smartphone, LayoutGrid, MessageSquare, AlertCircle, ShieldAlert, Clock, BookOpen, Plus, Trash2, Edit, ChevronRight, ArrowLeft, Code2, CheckSquare, Layers, Folder } from 'lucide-react';
import { dataService } from '../services/dataService';
import CommunityChat from './CommunityChat';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'security' | 'personnel' | 'community' | 'academy'>('telemetry');
  const [settings, setSettings] = useState<GlobalSettings>(dataService.getSettings());
  const [saveStatus, setSaveStatus] = useState(false);
  
  // Academy State
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Python');
  const [modules, setModules] = useState<CourseModule[]>([]);
  
  // Module Editing
  const [isEditingModule, setIsEditingModule] = useState<boolean>(false);
  const [editingModule, setEditingModule] = useState<Partial<CourseModule>>({});

  // Problem Management State
  const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('L0');
  const [moduleProblems, setModuleProblems] = useState<Problem[]>([]);
  const [isEditingProblem, setIsEditingProblem] = useState<boolean>(false);
  const [editingProblem, setEditingProblem] = useState<Partial<Problem>>({});

  useEffect(() => {
    setModules(dataService.getModulesByLanguage(selectedLanguage));
    setActiveModule(null); // Reset drill down when language changes
  }, [selectedLanguage, activeTab]);

  useEffect(() => {
    if (activeModule) {
       loadProblems(activeModule);
    }
  }, [activeModule, selectedDifficulty]);

  const loadProblems = (module: CourseModule) => {
     const allProblems = dataService.getProblemsByModule(module.language, module.title);
     setModuleProblems(allProblems.filter(p => p.difficulty === selectedDifficulty));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateSettings(settings);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  // --- Module Handlers ---

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

  const handleDeleteModule = (id: string) => {
     if(window.confirm("Are you sure? This will delete the module and all associated problems.")) {
        dataService.deleteModule(id);
        setModules(dataService.getModulesByLanguage(selectedLanguage));
     }
  };

  // --- Problem Handlers ---

  const handleCreateProblem = () => {
    if (!activeModule) return;
    setEditingProblem({
       id: `${activeModule.id}-${Date.now()}`,
       language: activeModule.language,
       module: activeModule.title,
       difficulty: selectedDifficulty,
       title: 'New Problem',
       description: '',
       points: selectedDifficulty === 'L0' ? 10 : selectedDifficulty === 'L1' ? 20 : 30,
       starterCode: '',
       testCases: [{ input: '', expectedOutput: '', isHidden: false }]
    });
    setIsEditingProblem(true);
  };

  const handleEditProblem = (prob: Problem) => {
     setEditingProblem(JSON.parse(JSON.stringify(prob))); // Deep copy
     setIsEditingProblem(true);
  };

  const handleDeleteProblem = (id: string) => {
     if(window.confirm("Delete this problem?")) {
        dataService.deleteProblem(id);
        if (activeModule) loadProblems(activeModule);
     }
  };

  const handleSaveProblem = (e: React.FormEvent) => {
     e.preventDefault();
     if (editingProblem.title && editingProblem.description && activeModule) {
        if (dataService.getProblems().find(p => p.id === editingProblem.id)) {
           dataService.updateProblem(editingProblem as Problem);
        } else {
           dataService.addProblem(editingProblem as Problem);
        }
        loadProblems(activeModule);
        setIsEditingProblem(false);
     }
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: any) => {
     if (editingProblem.testCases) {
        const newCases = [...editingProblem.testCases];
        newCases[index] = { ...newCases[index], [field]: value };
        setEditingProblem({ ...editingProblem, testCases: newCases });
     }
  };

  const addTestCase = () => {
     setEditingProblem({
        ...editingProblem,
        testCases: [...(editingProblem.testCases || []), { input: '', expectedOutput: '', isHidden: false }]
     });
  };

  const removeTestCase = (index: number) => {
     if (editingProblem.testCases) {
        setEditingProblem({
           ...editingProblem,
           testCases: editingProblem.testCases.filter((_, i) => i !== index)
        });
     }
  };

  // Helper to group modules by category
  const groupedModules = modules.reduce((acc, mod) => {
      if (!acc[mod.category]) acc[mod.category] = [];
      acc[mod.category].push(mod);
      return acc;
  }, {} as Record<string, CourseModule[]>);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <nav className="h-20 bg-brand-blue border-b border-white/10 flex items-center justify-between px-10 text-white shrink-0 z-20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center font-black shadow-inner">NC</div>
          <h1 className="font-heading font-black text-2xl tracking-tighter uppercase">Nexus <span className="text-brand-cyan">Command</span></h1>
        </div>
        <div className="flex items-center gap-6">
           <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              System Online
           </div>
           <button onClick={onLogout} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all shadow-lg"><LogOut size={20}/></button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-slate-200 bg-white p-10 space-y-4 shrink-0 overflow-y-auto">
          <div className="mb-10">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Navigation Console</span>
             <div className="space-y-2">
                <button onClick={() => setActiveTab('telemetry')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'telemetry' ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <BarChart3 size={20} /> <span className="text-xs font-black uppercase tracking-widest">Telemetry</span>
                </button>
                <button onClick={() => setActiveTab('security')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'security' ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <ShieldCheck size={20} /> <span className="text-xs font-black uppercase tracking-widest">Protocols</span>
                </button>
                <button onClick={() => setActiveTab('personnel')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'personnel' ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <Users size={20} /> <span className="text-xs font-black uppercase tracking-widest">Personnel</span>
                </button>
                <button onClick={() => setActiveTab('academy')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'academy' ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <BookOpen size={20} /> <span className="text-xs font-black uppercase tracking-widest">Academy</span>
                </button>
                <button onClick={() => setActiveTab('community')} className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'community' ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                  <MessageSquare size={20} /> <span className="text-xs font-black uppercase tracking-widest">Comms</span>
                </button>
             </div>
          </div>
        </aside>

        <main className="flex-1 p-16 overflow-y-auto custom-scrollbar bg-slate-50">
          
          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="max-w-4xl animate-fade-in space-y-16">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-[9px] font-black uppercase tracking-widest">
                    <ShieldAlert size={12}/> Security Infrastructure
                  </div>
                  <h2 className="text-5xl font-heading font-black text-brand-blue uppercase tracking-tighter">Integrity <span className="text-brand-cyan">Protocols</span></h2>
                  <p className="text-slate-500 font-medium max-w-xl">Configure system-wide behavioral heuristics and automated proctoring termination thresholds for all technical assessments.</p>
               </div>

               <form onSubmit={handleSaveSettings} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-4 text-brand-blue">
                           <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-brand-orange">
                             <Lock size={24} />
                           </div>
                           <h3 className="font-black text-xs uppercase tracking-widest">Anti-Cheat Engine</h3>
                        </div>
                        <div className="space-y-6">
                           <label className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 cursor-pointer hover:border-brand-cyan transition-all group">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">Allow Code Migration</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enable Copy-Paste Logic</span>
                              </div>
                              <input 
                                 type="checkbox" 
                                 checked={settings.allowCopyPaste} 
                                 onChange={e => setSettings({...settings, allowCopyPaste: e.target.checked})}
                                 className="w-6 h-6 accent-brand-cyan"
                              />
                           </label>
                           <div className="space-y-3">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><AlertCircle size={12}/> Tab Switch Threshold</span>
                              <input 
                                 type="number" 
                                 value={settings.tabSwitchLimit} 
                                 min="1"
                                 max="10"
                                 onChange={e => setSettings({...settings, tabSwitchLimit: Number(e.target.value)})}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-8 py-5 text-lg font-black text-brand-blue focus:border-brand-cyan outline-none transition-all shadow-inner"
                              />
                              <p className="text-[9px] text-slate-400 font-bold px-1 uppercase tracking-widest italic">User will be automatically terminated after reaching this infraction count.</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 space-y-8">
                        <div className="flex items-center gap-4 text-brand-blue">
                           <div className="w-12 h-12 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan">
                             <Clock size={24} />
                           </div>
                           <h3 className="font-black text-xs uppercase tracking-widest">Chrono Configuration</h3>
                        </div>
                        <div className="space-y-3">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Smartphone size={12}/> Standard Unit Duration</span>
                           <input 
                              type="number" 
                              value={settings.standardTimeLimit} 
                              onChange={e => setSettings({...settings, standardTimeLimit: Number(e.target.value)})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-8 py-5 text-lg font-black text-brand-blue focus:border-brand-cyan outline-none transition-all shadow-inner"
                           />
                           <div className="flex items-center justify-between px-2 pt-2">
                              <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em]">{Math.floor(settings.standardTimeLimit / 60)} minutes total</span>
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Target: 90min</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <button type="submit" className="w-full py-6 btn-orange text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-3xl flex items-center justify-center gap-5 hover:scale-[1.02] active:scale-95 transition-all">
                    {saveStatus ? <><ShieldCheck size={24}/> Protocols Synchronized</> : <><Save size={24}/> Update Security Registry</>}
                  </button>
               </form>
            </div>
          )}

          {/* ACADEMY TAB */}
          {activeTab === 'academy' && (
             <div className="max-w-7xl animate-fade-in space-y-12">
                
                {/* Header Section */}
                <div className="flex items-center justify-between">
                   <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 text-brand-cyan rounded-full text-[9px] font-black uppercase tracking-widest">
                        <BookOpen size={12}/> Curriculum Control
                      </div>
                      <h2 className="text-4xl font-heading font-black text-brand-blue uppercase tracking-tighter">Academy <span className="text-brand-cyan">Manager</span></h2>
                   </div>
                   
                   {!activeModule && (
                      <div className="flex gap-4">
                        {dataService.getLanguages().map(lang => (
                            <button 
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${selectedLanguage === lang ? 'bg-brand-blue text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                            >
                                {lang}
                            </button>
                        ))}
                      </div>
                   )}
                </div>

                {/* VIEW 1: Module List (Grouped by Category) */}
                {!activeModule && !isEditingModule && (
                    <div className="space-y-12 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-end">
                            <button 
                            onClick={() => { setIsEditingModule(true); setEditingModule({}); }}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-500 transition-all"
                            >
                                <Plus size={16} /> New Module
                            </button>
                        </div>

                        {Object.entries(groupedModules).map(([category, catModules]) => (
                            <div key={category} className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-700 border-b border-slate-200 pb-2 flex items-center gap-2">
                                    <Folder size={20} className="text-brand-blue" />
                                    {category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {catModules.map(mod => (
                                        <div key={mod.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between group hover:border-brand-cyan/30 hover:shadow-xl transition-all h-full">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-cyan group-hover:text-white transition-colors">
                                                        <BookOpen size={20} />
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingModule(mod); setIsEditingModule(true); }} className="p-2 hover:bg-slate-100 rounded-lg text-brand-blue"><Edit size={14}/></button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={14}/></button>
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-slate-800 mb-2">{mod.title}</h4>
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{mod.description}</p>
                                            </div>
                                            <button 
                                                onClick={() => setActiveModule(mod)}
                                                className="mt-6 w-full py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                Manage Content <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        {Object.keys(groupedModules).length === 0 && (
                             <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                                <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-400 font-medium">No courses found for {selectedLanguage}.</p>
                                <p className="text-xs text-slate-300 uppercase tracking-widest mt-2">Create a new module to get started.</p>
                             </div>
                        )}
                    </div>
                )}

                {/* VIEW 2: Problem Management (Drill Down) */}
                {activeModule && !isEditingProblem && (
                    <div className="animate-in slide-in-from-right-4 space-y-8">
                        <button 
                            onClick={() => setActiveModule(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-brand-blue font-bold text-xs uppercase tracking-widest"
                        >
                            <ArrowLeft size={16} /> Back to Modules
                        </button>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-64 bg-white p-6 rounded-[24px] border border-slate-200 space-y-6 shrink-0">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Module</span>
                                    <h3 className="text-xl font-black text-brand-blue">{activeModule.title}</h3>
                                    <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-1 rounded-md">{activeModule.category}</span>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Difficulty Tier</span>
                                    <div className="flex flex-col gap-2">
                                        {['L0', 'L1', 'L2'].map((diff) => (
                                            <button 
                                                key={diff}
                                                onClick={() => setSelectedDifficulty(diff as Difficulty)}
                                                className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-between transition-all ${selectedDifficulty === diff ? 'bg-brand-cyan text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                {diff === 'L0' ? 'Basic (L0)' : diff === 'L1' ? 'Inter (L1)' : 'Adv (L2)'}
                                                {selectedDifficulty === diff && <CheckSquare size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                                        <Layers size={20} className="text-slate-400"/>
                                        Problem Set <span className="text-slate-300">/</span> {selectedDifficulty}
                                    </h3>
                                    <button 
                                        onClick={handleCreateProblem}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-cyan transition-all shadow-lg"
                                    >
                                        <Plus size={16} /> Add Problem
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {moduleProblems.map(prob => (
                                        <div key={prob.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-brand-blue/30 transition-all">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm mb-1">{prob.title}</h4>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{prob.testCases.length} Test Cases • {prob.points} XP</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditProblem(prob)} className="p-2 bg-slate-50 hover:bg-brand-blue hover:text-white rounded-lg text-slate-400 transition-colors"><Edit size={14}/></button>
                                                <button onClick={() => handleDeleteProblem(prob.id)} className="p-2 bg-slate-50 hover:bg-red-500 hover:text-white rounded-lg text-slate-400 transition-colors"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {moduleProblems.length === 0 && (
                                        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-sm font-medium">
                                            No problems found for this difficulty tier.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW 3: Editor Panel (Module or Problem) */}
                {(isEditingModule || isEditingProblem) && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                         <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h3 className="font-black text-brand-blue uppercase tracking-tight text-lg">
                                    {isEditingModule ? (editingModule.id ? 'Edit Module' : 'Create Module') : (editingProblem.id ? 'Edit Problem' : 'New Problem')}
                                </h3>
                                <button onClick={() => { setIsEditingModule(false); setIsEditingProblem(false); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400"><Trash2 size={20} className="rotate-45" /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {isEditingModule ? (
                                    <form id="moduleForm" onSubmit={handleSaveModule} className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Title</label>
                                            <input 
                                                type="text" 
                                                value={editingModule.title || ''} 
                                                onChange={e => setEditingModule({...editingModule, title: e.target.value})}
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand-cyan transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Category (Course Name)</label>
                                            <input 
                                                type="text" 
                                                value={editingModule.category || ''} 
                                                onChange={e => setEditingModule({...editingModule, category: e.target.value})}
                                                placeholder="e.g. Basic Python Programming"
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand-cyan transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                                            <textarea 
                                                value={editingModule.description || ''} 
                                                onChange={e => setEditingModule({...editingModule, description: e.target.value})}
                                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none focus:border-brand-cyan resize-none transition-all"
                                                required
                                            />
                                        </div>
                                    </form>
                                ) : (
                                    <form id="problemForm" onSubmit={handleSaveProblem} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Title</label>
                                                <input 
                                                    type="text" 
                                                    value={editingProblem.title || ''} 
                                                    onChange={e => setEditingProblem({...editingProblem, title: e.target.value})}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand-cyan"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">XP Points</label>
                                                <input 
                                                    type="number" 
                                                    value={editingProblem.points || 0} 
                                                    onChange={e => setEditingProblem({...editingProblem, points: Number(e.target.value)})}
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-brand-cyan"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Problem Description</label>
                                            <textarea 
                                                value={editingProblem.description || ''} 
                                                onChange={e => setEditingProblem({...editingProblem, description: e.target.value})}
                                                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none focus:border-brand-cyan resize-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Starter Code</label>
                                            <textarea 
                                                value={editingProblem.starterCode || ''} 
                                                onChange={e => setEditingProblem({...editingProblem, starterCode: e.target.value})}
                                                className="w-full h-32 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-cyan-400 font-mono outline-none focus:border-brand-cyan resize-none"
                                            />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Test Cases</label>
                                                <button type="button" onClick={addTestCase} className="text-[10px] font-bold text-brand-blue uppercase tracking-widest hover:text-brand-cyan">+ Add Case</button>
                                            </div>
                                            {editingProblem.testCases?.map((tc, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group">
                                                    <button type="button" onClick={() => removeTestCase(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-400"><Trash2 size={12}/></button>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input 
                                                            placeholder="Input"
                                                            value={tc.input}
                                                            onChange={e => handleTestCaseChange(idx, 'input', e.target.value)}
                                                            className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                                        />
                                                        <input 
                                                            placeholder="Expected Output"
                                                            value={tc.expectedOutput}
                                                            onChange={e => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                                                            className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={tc.isHidden} 
                                                            onChange={e => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                                                            className="accent-brand-cyan"
                                                        /> Hidden Test Case
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </form>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                                <button 
                                    onClick={() => isEditingModule ? document.getElementById('moduleForm')?.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true})) : document.getElementById('problemForm')?.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}))}
                                    className="flex-1 py-4 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-cyan transition-all shadow-lg"
                                >
                                    Save Changes
                                </button>
                                <button onClick={() => { setIsEditingModule(false); setIsEditingProblem(false); }} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50">
                                    Cancel
                                </button>
                            </div>
                         </div>
                    </div>
                )}
             </div>
          )}
          
          {activeTab === 'telemetry' && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-30 animate-pulse">
               <div className="w-20 h-20 bg-brand-blue rounded-3xl flex items-center justify-center text-white">
                  <BarChart3 size={40} />
               </div>
               <span className="text-[11px] font-black uppercase tracking-[1em] text-brand-blue">Telemetry Stream Initializing...</span>
            </div>
          )}
          
          {activeTab === 'personnel' && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-30 animate-pulse">
               <div className="w-20 h-20 bg-brand-cyan rounded-3xl flex items-center justify-center text-white">
                  <Users size={40} />
               </div>
               <span className="text-[11px] font-black uppercase tracking-[1em] text-brand-cyan">Registry Loading...</span>
            </div>
          )}
          
          {activeTab === 'community' && <CommunityChat currentUser={user} />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
