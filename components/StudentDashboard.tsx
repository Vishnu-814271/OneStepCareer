
import React, { useState, useEffect } from 'react';
import { User, Problem, Difficulty, CourseModule, ProjectDefinition } from '../types';
import CodeLab from './CodeLab';
import { dataService } from '../services/dataService';
import { Terminal, BookOpen, ChevronRight, Trophy, User as UserIcon, LogOut, ShieldAlert, Zap, Target, Globe, MessageSquare, Clock, ArrowLeft, Layers, CheckCircle, Play, Cpu, AlertCircle, Signal, Lock, Briefcase, FileText, LayoutGrid, Database, Binary, Code, Library, Star, FolderGit2 } from 'lucide-react';
import CommunityChat from './CommunityChat';
import ResumeBuilder from './ResumeBuilder';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

type View = 'curriculum' | 'comms' | 'career';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<View>('curriculum');
  
  // State for Navigation Flow
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Difficulty | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);
  const [activeProblemSet, setActiveProblemSet] = useState<Problem[]>([]);
  
  const [showProjectModal, setShowProjectModal] = useState<ProjectDefinition | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(user);

  useEffect(() => {
     const freshUser = dataService.getUserById(currentUser.id);
     if (freshUser) setCurrentUser(freshUser);
  }, [isExamActive, activeView, showProjectModal]);

  // Filter problems for the selected track, module and level
  const getStandardProblems = () => {
    return selectedTrack && selectedLevel && selectedModule
      ? dataService.getProblems().filter(p => p.language === selectedTrack && p.module === selectedModule.title && p.difficulty === selectedLevel)
      : [];
  };

  const handleTrackSelect = (lang: string) => {
    setSelectedTrack(lang);
    setSelectedCategory(null);
    setSelectedModule(null);
    setSelectedLevel(null);
    setIsExamActive(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedModule(null);
  }

  const handleModuleSelect = (module: CourseModule) => {
     setSelectedModule(module);
     setSelectedLevel(null);
  }

  const handleStartExam = () => {
    if (selectedLevel) {
      setActiveProblemSet(getStandardProblems());
      setIsExamActive(true);
    }
  };

  const handleStartGrandTest = (lang: string) => {
      const grandTest = dataService.getGrandTest(lang);
      if (grandTest) {
          setActiveProblemSet([grandTest]);
          setIsExamActive(true);
      } else {
          alert("Grand Test not available for this track yet.");
      }
  };

  const handleBackToModules = () => {
     setSelectedModule(null);
     setSelectedLevel(null);
  };

  const handleBackToCategories = () => {
     setSelectedCategory(null);
     setSelectedModule(null);
  };

  const handleBackToDashboard = () => {
    setSelectedTrack(null);
    setSelectedCategory(null);
    setSelectedModule(null);
    setSelectedLevel(null);
    setIsExamActive(false);
  };

  // Helper to get problem count for level within a module
  const getProblemCountForLevel = (level: Difficulty) => {
    if (!selectedTrack || !selectedModule) return 0;
    return dataService.getProblems().filter(p => p.language === selectedTrack && p.module === selectedModule.title && p.difficulty === level).length;
  };

  // Icon Helper
  const getModuleIcon = (iconName?: string) => {
     switch(iconName) {
        case 'Terminal': return <Terminal size={32} />;
        case 'Cpu': return <Cpu size={32} />;
        case 'Database': return <Database size={32} />;
        case 'Binary': return <Binary size={32} />;
        case 'Layers': return <Layers size={32} />;
        case 'Code': return <Code size={32} />;
        default: return <BookOpen size={32} />;
     }
  }

  // 1. RENDER: EXAM MODE (CodeLab)
  if (isExamActive) {
    return <CodeLab problemSet={activeProblemSet} onExit={() => setIsExamActive(false)} currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* TechNexus Student Sidebar */}
      <aside className="w-20 md:w-80 bg-[#0f172a] flex flex-col sticky top-0 h-screen z-40 text-white shadow-3xl border-r border-slate-800">
        <div className="p-10">
           <div className="flex items-center gap-4">
             <div className="bg-brand-cyan p-3 rounded-2xl shadow-xl shadow-brand-cyan/20">
                <Terminal size={24} className="text-white" />
             </div>
             <div className="hidden md:block">
                <span className="font-heading font-black text-2xl text-white tracking-tighter uppercase block leading-none">TECH<span className="text-brand-cyan">NEXUS</span></span>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Student Portal</span>
             </div>
           </div>
        </div>

        <nav className="flex-1 p-8 space-y-4 mt-2">
          <button onClick={() => { setActiveView('curriculum'); setSelectedTrack(null); setSelectedCategory(null); setSelectedModule(null); }} className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all group ${activeView === 'curriculum' ? 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <BookOpen size={20} />
            <span className="hidden md:block font-black text-[11px] uppercase tracking-[0.2em]">Academy</span>
          </button>
          
          <button onClick={() => { setActiveView('career'); setSelectedTrack(null); }} className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all group ${activeView === 'career' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Briefcase size={20} />
            <span className="hidden md:block font-black text-[11px] uppercase tracking-[0.2em]">ATS Resume</span>
          </button>

          <button onClick={() => { setActiveView('comms'); setSelectedTrack(null); }} className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all group ${activeView === 'comms' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <MessageSquare size={20} />
            <span className="hidden md:block font-black text-[11px] uppercase tracking-[0.2em]">Student Community</span>
          </button>
        </nav>

        <div className="p-10 space-y-6">
           <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hidden md:block">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Progress</span>
                <Trophy size={14} className="text-brand-orange" />
              </div>
              <div className="text-3xl font-black text-white">{currentUser.score || 0} <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">XP Earned</span></div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-brand-cyan" style={{ width: `${Math.min((currentUser.score || 0) / 10, 100)}%` }}></div>
              </div>
           </div>
           <button onClick={onLogout} className="w-full p-5 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-4 justify-center md:justify-start font-black uppercase text-[10px] tracking-widest">
             <LogOut size={18} />
             <span className="hidden md:block">Log Out</span>
           </button>
        </div>
      </aside>

      {/* Main Student Console */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-12 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                {selectedModule ? `MODULE: ${selectedModule.title.toUpperCase()}` :
                 selectedCategory ? `COURSE: ${selectedCategory.toUpperCase()}` : 
                 selectedTrack ? `TRACK: ${selectedTrack.toUpperCase()}` : 
                 activeView === 'curriculum' ? 'Academy Dashboard' : 
                 activeView === 'career' ? 'ATS Resume Builder' : 'Student Chat'}
             </h2>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
                <span className="text-xs font-black text-[#0f172a] uppercase tracking-tight block">{currentUser.name}</span>
                <span className="text-[9px] text-brand-orange font-black uppercase tracking-widest">Active Student</span>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0f172a] shadow-sm">
                <UserIcon size={20} />
             </div>
          </div>
        </header>

        <main className="p-12 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* 2. RENDER: DIFFICULTY SELECTION VIEW */}
          {activeView === 'curriculum' && selectedTrack && selectedCategory && selectedModule && (
             <div className="max-w-6xl mx-auto animate-fade-in space-y-12">
                {/* Back Button */}
                <button 
                  onClick={handleBackToModules}
                  className="flex items-center gap-2 text-slate-400 hover:text-brand-cyan transition-colors text-xs font-black uppercase tracking-widest"
                >
                  <ArrowLeft size={16} /> Return to Modules
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   {/* Left Column: Course Info */}
                   <div className="lg:col-span-2 space-y-10">
                      <div>
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 text-brand-cyan rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
                            <Cpu size={12}/> {selectedTrack} / {selectedCategory}
                         </div>
                         <h1 className="text-6xl font-heading font-black text-[#0f172a] uppercase tracking-tighter mb-6">
                            {selectedModule.title}
                         </h1>
                         <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            {selectedModule.description} <br/>
                            Select a difficulty tier below to begin your assessment.
                         </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-sm space-y-8">
                         <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <h3 className="text-xl font-heading font-black text-[#0f172a] uppercase tracking-tight">Select Difficulty</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choose Your Level</span>
                         </div>
                         
                         <div className="space-y-4 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10"></div>

                            {[
                                { id: 'L0', label: 'Fundamentals (Easy)', desc: "Variable scope, data types, and basic control structures." },
                                { id: 'L1', label: 'Intermediate (Medium)', desc: "Data manipulation, loops, and functional efficiency." },
                                { id: 'L2', label: 'Advanced Application (Hard)', desc: "Edge-case handling, memory optimization, and complex logic." }
                            ].map((levelItem) => {
                               const isSelected = selectedLevel === levelItem.id;
                               return (
                                  <div 
                                    key={levelItem.id} 
                                    onClick={() => setSelectedLevel(levelItem.id as Difficulty)}
                                    className={`flex items-start gap-6 group cursor-pointer p-6 rounded-3xl transition-all border-2 ${isSelected ? 'bg-brand-cyan/5 border-brand-cyan shadow-lg shadow-brand-cyan/10 transform scale-[1.02]' : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100'}`}
                                  >
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 shadow-sm z-10 transition-colors shrink-0 ${isSelected ? 'bg-brand-cyan text-white border-white' : 'bg-slate-100 text-slate-400 border-white group-hover:bg-slate-200'}`}>
                                        <Layers size={18} />
                                     </div>
                                     <div className="flex-1 pt-2">
                                        <div className="flex items-center justify-between">
                                           <h4 className={`text-lg font-black uppercase tracking-tight mb-2 ${isSelected ? 'text-brand-cyan' : 'text-[#0f172a]'}`}>{levelItem.label}</h4>
                                           {isSelected && <CheckCircle size={20} className="text-brand-cyan" />}
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                           {levelItem.desc}
                                        </p>
                                     </div>
                                  </div>
                               );
                            })}
                         </div>
                      </div>
                   </div>

                   {/* Right Column: Exam Controls */}
                   <div className="space-y-6">
                      <div className="bg-[#0f172a] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Clock size={120} />
                         </div>
                         
                         <div className="relative z-10 space-y-8">
                            <div>
                               <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-4 block">Assessment Status</span>
                               
                               {/* Replaced Button Grid with Status Display */}
                               <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center backdrop-blur-sm">
                                  {selectedLevel ? (
                                     <div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Selected Tier</span>
                                        <div className={`text-3xl font-black uppercase tracking-tight mb-1 ${selectedLevel === 'L0' ? 'text-emerald-400' : selectedLevel === 'L1' ? 'text-brand-cyan' : 'text-brand-orange'}`}>
                                           {selectedLevel === 'L0' ? 'Basic' : selectedLevel === 'L1' ? 'Intermediate' : 'Advanced'}
                                        </div>
                                        <div className="text-[10px] font-bold text-white uppercase tracking-[0.2em] opacity-60">Level {selectedLevel.replace('L','')} Active</div>
                                     </div>
                                  ) : (
                                     <div className="text-slate-500 py-2">
                                        <span className="block mb-2 opacity-30"><Layers size={24} className="mx-auto"/></span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Select a Level<br/>from Syllabus</span>
                                     </div>
                                  )}
                               </div>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-white/10">
                               <div className="flex items-center justify-between text-sm border-b border-white/10 pb-3">
                                  <span className="text-slate-400 font-medium">Problem Set</span>
                                  <span className="font-bold">{selectedLevel ? getProblemCountForLevel(selectedLevel) : '-'} Units</span>
                               </div>
                               <div className="flex items-center justify-between text-sm border-b border-white/10 pb-3">
                                  <span className="text-slate-400 font-medium">Difficulty</span>
                                  <span className={`font-bold uppercase tracking-wider ${!selectedLevel ? 'text-slate-600' : selectedLevel === 'L0' ? 'text-emerald-400' : selectedLevel === 'L1' ? 'text-brand-cyan' : 'text-brand-orange'}`}>
                                    {selectedLevel || 'Pending'}
                                  </span>
                               </div>
                            </div>
                         </div>

                         <button 
                           onClick={handleStartExam}
                           disabled={!selectedLevel}
                           className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg group relative z-20 ${
                              selectedLevel 
                              ? 'bg-brand-cyan hover:bg-white hover:text-brand-cyan text-[#0f172a] shadow-brand-cyan/20 cursor-pointer' 
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                           }`}
                         >
                           {selectedLevel ? 'Initialize Exam' : 'Select Level'} 
                           {selectedLevel ? <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" /> : <Lock size={16} />}
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* 3. RENDER: MODULE SELECTION VIEW */}
          {activeView === 'curriculum' && selectedTrack && selectedCategory && !selectedModule && (
             <div className="max-w-7xl mx-auto animate-fade-in space-y-12">
               <button 
                  onClick={handleBackToCategories}
                  className="flex items-center gap-2 text-slate-400 hover:text-brand-cyan transition-colors text-xs font-black uppercase tracking-widest"
               >
                  <ArrowLeft size={16} /> Return to {selectedTrack} Courses
               </button>

               <div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 text-brand-cyan rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                     <Target size={12}/> Topic Modules
                   </div>
                   <h1 className="text-5xl md:text-6xl font-heading font-black text-[#0f172a] tracking-tighter mb-4 leading-none uppercase">
                     {selectedCategory}
                   </h1>
                   <p className="text-slate-500 font-medium leading-relaxed italic text-lg max-w-2xl">
                     Select a specialized topic to begin your deep dive.
                   </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {dataService.getModulesByCategory(selectedTrack, selectedCategory).map((mod) => (
                    <div 
                      key={mod.id} 
                      onClick={() => handleModuleSelect(mod)}
                      className="group bg-white p-8 rounded-[32px] border border-slate-200 hover:border-brand-cyan/30 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full"
                    >
                       <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-cyan group-hover:text-white transition-colors mb-6">
                          {getModuleIcon(mod.icon)}
                       </div>
                       <h3 className="text-xl font-heading font-black text-[#0f172a] mb-3 uppercase tracking-tight">{mod.title}</h3>
                       <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">{mod.description}</p>
                       <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                          <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Start Topic</span>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-brand-cyan">
                             <ChevronRight size={16} />
                          </div>
                       </div>
                    </div>
                 ))}
                 {dataService.getModulesByCategory(selectedTrack, selectedCategory).length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[32px]">
                       <AlertCircle size={48} className="mx-auto text-slate-300 mb-4"/>
                       <p className="text-slate-400 font-medium">No topics found for this category yet.</p>
                       <p className="text-xs text-slate-300 uppercase tracking-widest mt-2">Contact Admin to add curriculum.</p>
                    </div>
                 )}
               </div>
             </div>
          )}

          {/* 4. RENDER: CATEGORY SELECTION VIEW (INCLUDES GRAND TEST & PROJECT) */}
          {activeView === 'curriculum' && selectedTrack && !selectedCategory && (
             <div className="max-w-7xl mx-auto animate-fade-in space-y-12">
               <button 
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 text-slate-400 hover:text-brand-cyan transition-colors text-xs font-black uppercase tracking-widest"
               >
                  <ArrowLeft size={16} /> Return to Academy
               </button>

               <div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 text-brand-cyan rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                     <Library size={12}/> Learning Path
                   </div>
                   <h1 className="text-5xl md:text-6xl font-heading font-black text-[#0f172a] tracking-tighter mb-4 leading-none uppercase">
                     {selectedTrack} <span className="text-brand-cyan">Courses</span>
                   </h1>
                   <p className="text-slate-500 font-medium leading-relaxed italic text-lg max-w-2xl">
                     Complete all modules to unlock the Final Grand Assessment and Capstone Project.
                   </p>
                   {/* Progress Indicator */}
                   <div className="mt-6 max-w-md">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2 text-slate-500">
                          <span>Track Progress</span>
                          <span>{dataService.getTrackProgress(currentUser.id, selectedTrack)}% Completed</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-cyan transition-all duration-1000" 
                            style={{width: `${dataService.getTrackProgress(currentUser.id, selectedTrack)}%`}}
                          ></div>
                      </div>
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Standard Categories */}
                 {dataService.getCategoriesByLanguage(selectedTrack).map((cat, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleCategorySelect(cat)}
                      className="group bg-white p-10 rounded-[40px] border border-slate-200 hover:border-brand-cyan/30 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                          <BookOpen size={120} className="rotate-12"/>
                       </div>
                       
                       <div className="relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors mb-6">
                              <BookOpen size={28} />
                          </div>
                          <h3 className="text-2xl font-heading font-black text-[#0f172a] mb-3 uppercase tracking-tight">{cat}</h3>
                          <p className="text-slate-400 text-sm font-medium mb-8">
                             {dataService.getModulesByCategory(selectedTrack, cat).length} Modules available
                          </p>
                          <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-brand-cyan transition-colors">Explore Course</span>
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-cyan group-hover:text-white transition-all shadow-sm">
                                <ChevronRight size={20} />
                              </div>
                          </div>
                       </div>
                    </div>
                 ))}

                 {/* GRAND TEST CARD */}
                 {(() => {
                     const progress = dataService.getTrackProgress(currentUser.id, selectedTrack);
                     const isUnlocked = progress >= 100;
                     const isCompleted = currentUser.completedGrandTests?.includes(selectedTrack);
                     
                     return (
                         <div 
                           onClick={() => isUnlocked ? handleStartGrandTest(selectedTrack) : null}
                           className={`group p-10 rounded-[40px] border transition-all flex flex-col h-full relative overflow-hidden ${isUnlocked ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200 hover:shadow-2xl cursor-pointer' : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-70'}`}
                         >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                               <Star size={120} className="rotate-12"/>
                            </div>
                            
                            <div className="relative z-10">
                               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                                   {isUnlocked ? <Star size={28} fill="currentColor" /> : <Lock size={28} />}
                               </div>
                               <h3 className={`text-2xl font-heading font-black mb-3 uppercase tracking-tight ${isUnlocked ? 'text-amber-700' : 'text-slate-500'}`}>Grand Assessment</h3>
                               <p className="text-slate-400 text-sm font-medium mb-8">
                                  {isCompleted ? 'Assessment Passed. Project Access Granted.' : isUnlocked ? 'Final verified examination. Pass to unlock Capstone Project.' : 'Complete all modules to unlock this examination.'}
                               </p>
                               <div className={`flex items-center justify-between pt-6 border-t mt-auto ${isUnlocked ? 'border-amber-100' : 'border-slate-100'}`}>
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-amber-600' : 'text-slate-400'}`}>
                                       {isCompleted ? 'Completed' : isUnlocked ? 'Start Exam' : 'Locked'}
                                   </span>
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isUnlocked ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                     {isCompleted ? <CheckCircle size={20} /> : <Play size={20} fill="currentColor" />}
                                   </div>
                               </div>
                            </div>
                         </div>
                     );
                 })()}

                 {/* CAPSTONE PROJECT CARD */}
                 {(() => {
                     const isGrandTestPassed = currentUser.completedGrandTests?.includes(selectedTrack);
                     
                     return (
                         <div 
                           onClick={() => {
                               if (isGrandTestPassed) {
                                   const proj = dataService.getProject(selectedTrack);
                                   if (proj) setShowProjectModal(proj);
                               }
                           }}
                           className={`group p-10 rounded-[40px] border transition-all flex flex-col h-full relative overflow-hidden ${isGrandTestPassed ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200 hover:shadow-2xl cursor-pointer' : 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-70'}`}
                         >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                               <FolderGit2 size={120} className="rotate-12"/>
                            </div>
                            
                            <div className="relative z-10">
                               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isGrandTestPassed ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                   {isGrandTestPassed ? <FolderGit2 size={28} /> : <Lock size={28} />}
                               </div>
                               <h3 className={`text-2xl font-heading font-black mb-3 uppercase tracking-tight ${isGrandTestPassed ? 'text-indigo-700' : 'text-slate-500'}`}>Capstone Project</h3>
                               <p className="text-slate-400 text-sm font-medium mb-8">
                                  {isGrandTestPassed ? 'Access the industrial problem statement and implementation guide.' : 'Pass the Grand Assessment to access project requirements.'}
                               </p>
                               <div className={`flex items-center justify-between pt-6 border-t mt-auto ${isGrandTestPassed ? 'border-indigo-100' : 'border-slate-100'}`}>
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${isGrandTestPassed ? 'text-indigo-600' : 'text-slate-400'}`}>
                                       {isGrandTestPassed ? 'View Brief' : 'Locked'}
                                   </span>
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isGrandTestPassed ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                     <ChevronRight size={20} />
                                   </div>
                               </div>
                            </div>
                         </div>
                     );
                 })()}

                 {dataService.getCategoriesByLanguage(selectedTrack).length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[32px]">
                       <AlertCircle size={48} className="mx-auto text-slate-300 mb-4"/>
                       <p className="text-slate-400 font-medium">No courses found for {selectedTrack}.</p>
                       <p className="text-xs text-slate-300 uppercase tracking-widest mt-2">Contact Admin to add curriculum.</p>
                    </div>
                 )}
               </div>
             </div>
          )}

          {/* 5. RENDER: TRACK SELECTION (DEFAULT) */}
          {activeView === 'curriculum' && !selectedTrack && (
            <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 text-brand-cyan rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                  <LayoutGrid size={12}/> Academic Tracks
                </div>
                <h1 className="text-5xl md:text-6xl font-heading font-black text-[#0f172a] tracking-tighter mb-4 leading-none uppercase">Select Your <span className="text-brand-cyan">Academy</span></h1>
                <p className="text-slate-500 font-medium leading-relaxed italic text-lg">
                  Access industrial-grade logic units and start building your technical profile today.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dataService.getLanguages().map(lang => (
                  <div key={lang} onClick={() => handleTrackSelect(lang)} className="group bg-white border border-slate-200 p-10 rounded-[48px] cursor-pointer transition-all hover:border-brand-cyan/40 hover:shadow-2xl hover:-translate-y-1 flex flex-col relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Terminal size={100} className="text-slate-900 rotate-12" />
                     </div>
                     
                     <div className="relative z-10">
                        <div className="flex items-start justify-between mb-10">
                            <div className="w-20 h-20 rounded-[28px] bg-brand-cyan/5 border border-brand-cyan/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-cyan group-hover:text-white transition-all duration-500">
                              <span className="text-3xl font-black">{lang[0]}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Progress</span>
                                <span className="text-xl font-black text-brand-cyan">{dataService.getTrackProgress(currentUser.id, lang)}%</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-heading font-black text-[#0f172a] mb-2 uppercase tracking-tight">{lang}</h3>
                        <p className="text-slate-400 text-sm mb-12 leading-relaxed font-medium">Master the core concepts of {lang} through our verified problem sets.</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <Zap size={14} className="text-brand-orange" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View Courses</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-cyan group-hover:text-white transition-all shadow-sm">
                              <ChevronRight size={20} />
                            </div>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 6. RENDER: RESUME BUILDER */}
          {activeView === 'career' && (
             <ResumeBuilder currentUser={currentUser} />
          )}

          {/* 7. RENDER: COMMUNITY CHAT */}
          {activeView === 'comms' && (
            <div className="h-[calc(100vh-250px)] animate-fade-in max-w-5xl mx-auto flex flex-col">
               <div className="mb-8">
                  <h1 className="text-4xl font-heading font-black text-[#0f172a] uppercase tracking-tighter">Student <span className="text-brand-orange">Community</span></h1>
                  <p className="text-slate-500 font-medium">Connect with other learners and share knowledge.</p>
               </div>
               <div className="flex-1">
                 <CommunityChat currentUser={currentUser} />
               </div>
            </div>
          )}

          {/* PROJECT MODAL */}
          {showProjectModal && (
              <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                  <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
                      <button 
                        onClick={() => setShowProjectModal(null)}
                        className="absolute top-6 right-6 p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                      >
                          <LogOut size={20} className="text-slate-500" />
                      </button>
                      
                      <div className="bg-[#0f172a] p-12 text-white">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-500/20">
                             <FolderGit2 size={12}/> Capstone Project
                          </div>
                          <h2 className="text-4xl font-heading font-black uppercase tracking-tighter mb-4 text-white">{showProjectModal.title}</h2>
                          <p className="text-slate-400 font-medium max-w-2xl text-lg">{showProjectModal.description}</p>
                      </div>

                      <div className="flex-1 overflow-y-auto p-12 bg-slate-50">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Technical Requirements</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {showProjectModal.requirements.map((req, i) => (
                                  <div key={i} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs shrink-0">
                                          {i + 1}
                                      </div>
                                      <p className="text-slate-600 font-medium text-sm leading-relaxed">{req}</p>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="mt-12 p-8 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
                              <Target className="text-blue-500 shrink-0 mt-1" />
                              <div>
                                  <h4 className="font-bold text-blue-900 mb-2">Implementation Instructions</h4>
                                  <p className="text-sm text-blue-800 leading-relaxed">
                                      This project must be implemented locally or in a dedicated IDE. Once completed, upload your source code to GitHub and submit the repository link to your evaluator for final certification. 
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
