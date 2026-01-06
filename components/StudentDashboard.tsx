
import React, { useState, useEffect } from 'react';
import { User, Problem, Difficulty, CourseModule } from '../types';
import CodeLab from './CodeLab';
import { dataService } from '../services/dataService';
import { Terminal, BookOpen, ChevronRight, User as UserIcon, LogOut, ArrowLeft, Layers, Play, Library, FolderGit2 } from 'lucide-react';
import ResumeBuilder from './ResumeBuilder';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

type View = 'curriculum' | 'career';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<View>('curriculum');
  
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedTopicGroup, setSelectedTopicGroup] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Difficulty | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);
  const [activeProblemSet, setActiveProblemSet] = useState<Problem[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User>(user);

  useEffect(() => {
     const freshUser = dataService.getUserById(currentUser.id);
     if (freshUser) setCurrentUser(freshUser);
  }, [isExamActive, activeView, currentUser.id]);

  const handleCourseSelect = (course: string) => {
    setSelectedCourse(course);
    setSelectedTopicGroup(null);
    setSelectedModule(null);
  };

  const handleTopicGroupSelect = (group: string) => {
    setSelectedTopicGroup(group);
    setSelectedModule(null);
  }

  const handleModuleSelect = (module: CourseModule) => {
     setSelectedModule(module);
     setSelectedLevel(null);
  }

  const handleStartExam = () => {
    if (selectedLevel && selectedModule && selectedCourse) {
      const problems = dataService.getProblems().filter(p => 
        p.language === selectedCourse && 
        p.module === selectedModule.title && 
        p.difficulty === selectedLevel
      );
      setActiveProblemSet(problems);
      setIsExamActive(true);
    }
  };

  const handleBackToTopicGroups = () => {
     setSelectedModule(null);
     setSelectedLevel(null);
  };

  const handleBackToCourses = () => {
     setSelectedTopicGroup(null);
     setSelectedModule(null);
  };

  const handleBackToAcademy = () => {
    setSelectedCourse(null);
    setSelectedTopicGroup(null);
    setSelectedModule(null);
    setActiveView('curriculum');
  };

  if (isExamActive) {
    return <CodeLab problemSet={activeProblemSet} onExit={() => setIsExamActive(false)} currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-20 lg:w-64 bg-[#1e293b] flex flex-col sticky top-0 h-screen z-40 text-white shadow-xl shrink-0 transition-all">
        <div className="p-4 lg:p-6 border-b border-white/5 flex justify-center lg:justify-start">
           <div className="flex items-center gap-3">
             <div className="bg-[#ff8c00] p-2 rounded-lg">
                <Terminal size={18} className="text-white" />
             </div>
             <div className="hidden lg:block">
                <span className="font-heading font-extrabold text-lg text-white tracking-tight uppercase block leading-none">TECH<span className="text-[#ff8c00]">NEXUS</span></span>
             </div>
           </div>
        </div>

        <nav className="flex-1 p-2 lg:p-4 space-y-1 mt-4">
          <button 
            onClick={() => { setActiveView('curriculum'); handleBackToAcademy(); }} 
            className={`w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeView === 'curriculum' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="Academy Hub"
          >
            <BookOpen size={18} />
            <span className="hidden lg:block font-bold text-[10px] uppercase tracking-widest">Academy Hub</span>
          </button>
          
          <button 
            onClick={() => { setActiveView('career'); }} 
            className={`w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all ${activeView === 'career' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="Career Portals"
          >
            <FolderGit2 size={18} />
            <span className="hidden lg:block font-bold text-[10px] uppercase tracking-widest">Career Portals</span>
          </button>
        </nav>

        <div className="p-2 lg:p-4 mt-auto">
           <button onClick={onLogout} className="w-full p-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all flex items-center justify-center lg:justify-start gap-3 font-bold uppercase text-[10px] tracking-widest" title="Terminate Session">
             <LogOut size={18} />
             <span className="hidden lg:block">Terminate Session</span>
           </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest overflow-hidden whitespace-nowrap">
             <span className="hover:text-slate-900 cursor-pointer" onClick={handleBackToAcademy}>Academy</span>
             {activeView === 'career' && <><ChevronRight size={12}/> <span className="text-[#ff8c00] truncate">Industrial Resume Engine</span></>}
             {selectedCourse && <><ChevronRight size={12}/> <span className="hover:text-slate-900 cursor-pointer truncate hidden sm:inline" onClick={handleBackToCourses}>{selectedCourse}</span><span className="sm:hidden">...</span></>}
             {selectedTopicGroup && <><ChevronRight size={12}/> <span className="hover:text-slate-900 cursor-pointer truncate hidden sm:inline" onClick={handleBackToTopicGroups}>{selectedTopicGroup}</span></>}
             {selectedModule && <><ChevronRight size={12}/> <span className="text-brand-orange truncate">{selectedModule.title}</span></>}
          </div>
          <div className="flex items-center gap-4 shrink-0">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{currentUser.name}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Candidate ID: {currentUser.id.slice(0,8)}</p>
             </div>
             <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <UserIcon size={16} />
             </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className={`flex-1 overflow-hidden flex flex-col ${activeView === 'career' ? 'p-0' : 'p-4 md:p-10'}`}>
          {activeView === 'curriculum' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {/* LEVEL 1: COURSE SELECTION */}
               {!selectedCourse && (
                  <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
                    <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-tighter">Available <span className="text-slate-400">Certifications</span></h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dataService.getLanguages().map(lang => (
                        <div key={lang} onClick={() => handleCourseSelect(lang)} className="bg-white border border-slate-200 p-8 rounded-[32px] cursor-pointer group hover:border-[#ff8c00] hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500">
                           <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#ff8c00] group-hover:text-white transition-all mb-8 shadow-inner">
                              <Library size={24} />
                           </div>
                           <h3 className="text-xl font-heading font-black text-slate-900 mb-2 uppercase tracking-tight">{lang}</h3>
                           <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium italic">"Master the fundamentals and industrial applications of {lang}."</p>
                           <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-brand-orange">
                              Initialize Module <ChevronRight size={14} />
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
               )}

               {/* LEVEL 2: TOPIC GROUPS */}
               {selectedCourse && !selectedTopicGroup && (
                  <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
                    <button onClick={handleBackToAcademy} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors"><ArrowLeft size={16}/> Return to Terminal</button>
                    <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-tighter">{selectedCourse} <span className="text-slate-400">Pathways</span></h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dataService.getCategoriesByLanguage(selectedCourse).map((cat, idx) => (
                          <div key={idx} onClick={() => handleTopicGroupSelect(cat)} className="bg-white border border-slate-200 p-8 rounded-[32px] cursor-pointer group hover:border-[#ff8c00] shadow-sm transition-all duration-500">
                             <h3 className="text-lg font-heading font-black text-slate-900 mb-2 uppercase tracking-tight">{cat}</h3>
                             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">{dataService.getModulesByCategory(selectedCourse, cat).length} Specialized Modules</p>
                             <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-50 group-hover:text-brand-orange transition-colors">
                                View Modules <ChevronRight size={14} />
                             </div>
                          </div>
                      ))}
                    </div>
                  </div>
               )}

               {/* LEVEL 3: MODULES */}
               {selectedCourse && selectedTopicGroup && !selectedModule && (
                  <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
                      <button onClick={handleBackToCourses} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors"><ArrowLeft size={16}/> Back to {selectedCourse}</button>
                      <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-tighter">{selectedTopicGroup}</h1>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dataService.getModulesByCategory(selectedCourse, selectedTopicGroup).map((mod) => (
                            <div key={mod.id} onClick={() => handleModuleSelect(mod)} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 cursor-pointer group flex items-center gap-6 hover:border-[#ff8c00] shadow-sm transition-all duration-500">
                               <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner shrink-0">
                                  <Terminal size={22} />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1 truncate">{mod.title}</h3>
                                  <p className="text-slate-400 text-[9px] uppercase font-black tracking-[0.2em] truncate">Technical Practice Environment</p>
                               </div>
                               <ChevronRight size={24} className="text-slate-100 group-hover:text-brand-orange transition-colors shrink-0" />
                            </div>
                        ))}
                      </div>
                  </div>
               )}

               {/* LEVEL 4: DIFFICULTY SELECTION */}
               {selectedCourse && selectedTopicGroup && selectedModule && (
                  <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                      <button onClick={handleBackToTopicGroups} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest"><ArrowLeft size={16}/> Back to Modules</button>
                      <div className="bg-white p-6 md:p-12 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-12">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-tighter">{selectedModule.title}</h1>
                            <p className="text-slate-500 text-sm mt-3 font-medium italic">"Select your evaluation tier. Higher tiers grant exponential experience points."</p>
                        </div>
                        
                        <div className="grid gap-4">
                            {[
                                { id: 'L0', title: 'L0: Foundational Principles', xp: 10 },
                                { id: 'L1', title: 'L1: Industrial Implementation', xp: 20 },
                                { id: 'L2', title: 'L2: Master Architectural Logic', xp: 30 }
                            ].map((level) => (
                               <div 
                                 key={level.id} 
                                 onClick={() => setSelectedLevel(level.id as Difficulty)}
                                 className={`p-6 md:p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${selectedLevel === level.id ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-300 text-slate-600'}`}
                               >
                                  <div className="flex items-center gap-6 font-black uppercase text-xs tracking-[0.2em]">
                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedLevel === level.id ? 'bg-white/10 text-cyan-400' : 'bg-slate-50 text-slate-300'}`}><Layers size={18}/></div>
                                     <span className="break-words">{level.title}</span>
                                  </div>
                                  <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${selectedLevel === level.id ? 'text-[#ff8c00]' : 'text-slate-300'}`}>{level.xp} XP Units</span>
                               </div>
                            ))}
                        </div>

                        <button 
                          onClick={handleStartExam}
                          disabled={!selectedLevel}
                          className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-4 ${selectedLevel ? 'bg-[#ff8c00] text-white shadow-2xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                        >
                          Initialize Evaluation Session <Play size={18} fill="currentColor" />
                        </button>
                      </div>
                  </div>
               )}
            </div>
          )}

          {activeView === 'career' && (
            <div className="flex-1 h-full animate-fade-in overflow-hidden">
               <ResumeBuilder currentUser={currentUser} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
