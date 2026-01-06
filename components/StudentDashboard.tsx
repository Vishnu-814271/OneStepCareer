
import React, { useState, useEffect } from 'react';
import { User, Problem, Difficulty, CourseModule, ProjectDefinition } from '../types';
import CodeLab from './CodeLab';
import { dataService } from '../services/dataService';
import { Terminal, BookOpen, ChevronRight, Trophy, User as UserIcon, LogOut, Zap, ArrowLeft, Layers, CheckCircle, Play, Cpu, AlertCircle, Library, Star, FolderGit2 } from 'lucide-react';
import CommunityChat from './CommunityChat';
import ResumeBuilder from './ResumeBuilder';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

type View = 'curriculum' | 'comms' | 'career';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<View>('curriculum');
  
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null); // e.g. Python
  const [selectedTopicGroup, setSelectedTopicGroup] = useState<string | null>(null); // e.g. Basic Python Programming
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null); // e.g. Basic I/O
  const [selectedLevel, setSelectedLevel] = useState<Difficulty | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);
  const [activeProblemSet, setActiveProblemSet] = useState<Problem[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User>(user);

  useEffect(() => {
     const freshUser = dataService.getUserById(currentUser.id);
     if (freshUser) setCurrentUser(freshUser);
  }, [isExamActive, activeView]);

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
  };

  if (isExamActive) {
    return <CodeLab problemSet={activeProblemSet} onExit={() => setIsExamActive(false)} currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-[#1e293b] flex flex-col sticky top-0 h-screen z-40 text-white shadow-xl">
        <div className="p-6 border-b border-white/5">
           <div className="flex items-center gap-3">
             <div className="bg-[#ff8c00] p-2 rounded-lg">
                <Terminal size={18} className="text-white" />
             </div>
             <div className="hidden md:block">
                <span className="font-heading font-extrabold text-lg text-white tracking-tight uppercase block leading-none">TECH<span className="text-[#ff8c00]">NEXUS</span></span>
             </div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          <button onClick={() => { setActiveView('curriculum'); handleBackToAcademy(); }} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${activeView === 'curriculum' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
            <BookOpen size={18} />
            <span className="hidden md:block font-bold text-xs uppercase tracking-widest">Academy</span>
          </button>
          
          <button onClick={() => { setActiveView('career'); }} className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${activeView === 'career' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
            <FolderGit2 size={18} />
            <span className="hidden md:block font-bold text-xs uppercase tracking-widest">Careers</span>
          </button>
        </nav>

        <div className="p-4 mt-auto">
           <button onClick={onLogout} className="w-full p-3 rounded-lg text-slate-500 hover:text-red-400 transition-all flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest">
             <LogOut size={18} />
             <span className="hidden md:block">Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-10">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <span className="hover:text-slate-900 cursor-pointer" onClick={handleBackToAcademy}>Academy</span>
             {selectedCourse && <><ChevronRight size={12}/> <span className="hover:text-slate-900 cursor-pointer" onClick={handleBackToCourses}>{selectedCourse}</span></>}
             {selectedTopicGroup && <><ChevronRight size={12}/> <span className="hover:text-slate-900 cursor-pointer" onClick={handleBackToTopicGroups}>{selectedTopicGroup}</span></>}
             {selectedModule && <><ChevronRight size={12}/> <span className="text-brand-orange">{selectedModule.title}</span></>}
          </div>
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-600">{currentUser.name}</span>
             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                <UserIcon size={14} />
             </div>
          </div>
        </header>

        <main className="p-10 flex-1 overflow-y-auto">
          
          {/* LEVEL 1: COURSE SELECTION */}
          {activeView === 'curriculum' && !selectedCourse && (
            <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
              <h1 className="text-4xl font-heading font-black text-slate-900 uppercase tracking-tighter">Available <span className="text-slate-400">Courses</span></h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataService.getLanguages().map(lang => (
                  <div key={lang} onClick={() => handleCourseSelect(lang)} className="content-card p-8 rounded-2xl cursor-pointer group hover:border-brand-orange transition-all">
                     <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#ff8c00] group-hover:text-white transition-all mb-6">
                        <Library size={20} />
                     </div>
                     <h3 className="text-xl font-heading font-bold text-slate-900 mb-2 uppercase tracking-tight">{lang}</h3>
                     <p className="text-slate-500 text-sm mb-6">Start your industrial certification in {lang}.</p>
                     <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-brand-orange">
                        Explore Modules <ChevronRight size={14} />
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 2: TOPIC GROUPS */}
          {activeView === 'curriculum' && selectedCourse && !selectedTopicGroup && (
             <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
               <button onClick={handleBackToAcademy} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16}/> Back to Academy</button>
               <h1 className="text-4xl font-heading font-black text-slate-900 uppercase tracking-tighter">{selectedCourse} <span className="text-slate-400">Pathways</span></h1>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {dataService.getCategoriesByLanguage(selectedCourse).map((cat, idx) => (
                    <div key={idx} onClick={() => handleTopicGroupSelect(cat)} className="content-card p-8 rounded-2xl cursor-pointer group hover:border-brand-orange">
                       <h3 className="text-lg font-heading font-bold text-slate-900 mb-2 uppercase tracking-tight">{cat}</h3>
                       <p className="text-slate-500 text-sm mb-6">{dataService.getModulesByCategory(selectedCourse, cat).length} Specialized Modules</p>
                       <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50 group-hover:text-brand-orange transition-colors">
                          View Modules <ChevronRight size={14} />
                       </div>
                    </div>
                 ))}
               </div>
             </div>
          )}

          {/* LEVEL 3: MODULES */}
          {activeView === 'curriculum' && selectedCourse && selectedTopicGroup && !selectedModule && (
             <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                <button onClick={handleBackToCourses} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16}/> Back to {selectedCourse}</button>
                <h1 className="text-4xl font-heading font-black text-slate-900 uppercase tracking-tighter">{selectedTopicGroup}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {dataService.getModulesByCategory(selectedCourse, selectedTopicGroup).map((mod) => (
                      <div key={mod.id} onClick={() => handleModuleSelect(mod)} className="content-card p-6 rounded-xl cursor-pointer group flex items-center gap-4 hover:border-brand-orange">
                         <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <Terminal size={18} />
                         </div>
                         <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">{mod.title}</h3>
                            <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Logic Practice</p>
                         </div>
                         <ChevronRight size={20} className="text-slate-200 group-hover:text-brand-orange" />
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* LEVEL 4: DIFFICULTY SELECTION */}
          {activeView === 'curriculum' && selectedCourse && selectedTopicGroup && selectedModule && (
             <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <button onClick={handleBackToTopicGroups} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16}/> Back to Modules</button>
                <div className="content-card p-10 rounded-2xl space-y-10">
                   <div>
                      <h1 className="text-3xl font-heading font-black text-slate-900 uppercase tracking-tighter">{selectedModule.title}</h1>
                      <p className="text-slate-500 text-sm mt-2">Final verification required for industrial credentialing. Select your assessment tier.</p>
                   </div>
                   
                   <div className="grid gap-4">
                      {[
                          { id: 'L0', title: 'Level 0: Fundamental Mechanics', xp: 10 },
                          { id: 'L1', title: 'Level 1: Intermediate Logic', xp: 20 },
                          { id: 'L2', title: 'Level 2: Advanced System Architecture', xp: 30 }
                      ].map((level) => (
                         <div 
                           key={level.id} 
                           onClick={() => setSelectedLevel(level.id as Difficulty)}
                           className={`p-6 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedLevel === level.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'}`}
                         >
                            <div className="flex items-center gap-4 font-bold uppercase text-xs tracking-widest">
                               <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedLevel === level.id ? 'bg-white/10' : 'bg-slate-100'}`}><Layers size={14}/></div>
                               {level.title}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedLevel === level.id ? 'text-brand-orange' : 'text-slate-400'}`}>{level.xp} XP</span>
                         </div>
                      ))}
                   </div>

                   <button 
                     onClick={handleStartExam}
                     disabled={!selectedLevel}
                     className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${selectedLevel ? 'btn-orange shadow-lg' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                   >
                     Initialize Industrial Exam <Play size={16} fill="currentColor" />
                   </button>
                </div>
             </div>
          )}

          {activeView === 'career' && <ResumeBuilder currentUser={currentUser} />}
          {activeView === 'comms' && <CommunityChat currentUser={currentUser} />}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
