
import React, { useState, useEffect } from 'react';
import { User, Problem, Difficulty, CourseModule, LearningRecommendation } from '../types';
import CodeLab from './CodeLab';
import { dataService } from '../services/dataService';
import { getLearningRecommendation } from '../services/geminiService';
import { 
  Terminal, BookOpen, ChevronRight, User as UserIcon, LogOut, ArrowLeft, Layers, Play, Library, Sparkles, BrainCircuit, Lightbulb, 
  Coffee, Cpu, Activity, Database, GitMerge, RefreshCw, Box, List, ShieldAlert, HardDrive, TrendingUp, GitBranch, Share2, Search, MessageSquare 
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedTopicGroup, setSelectedTopicGroup] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Difficulty | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);
  const [activeProblemSet, setActiveProblemSet] = useState<Problem[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User>(user);
  
  // AI Recommendation State
  const [recommendation, setRecommendation] = useState<LearningRecommendation | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
     const freshUser = dataService.getUserById(currentUser.id);
     if (freshUser) setCurrentUser(freshUser);
  }, [isExamActive, currentUser.id]);

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
      if (problems.length > 0) {
        setActiveProblemSet(problems);
        setIsExamActive(true);
      } else {
        alert("No problems found for this module yet. Please try another.");
      }
    }
  };

  const handleGetRecommendation = async () => {
     setIsLoadingRecommendation(true);
     setError(null);
     try {
       const allModules = dataService.getModules();
       const result = await getLearningRecommendation(currentUser, allModules);
       if (result) {
         setRecommendation(result);
       } else {
         setError("Could not generate recommendation. Please check your network or try again.");
       }
     } catch (err) {
       setError("System Advisor is currently offline.");
     } finally {
       setIsLoadingRecommendation(false);
     }
  };

  const handleApplyRecommendation = () => {
    if (recommendation) {
        // Attempt to find the module and navigate
        const allModules = dataService.getModules();
        const target = allModules.find(m => m.title === recommendation.recommendedModule);
        if (target) {
            setSelectedCourse(target.language);
            setSelectedTopicGroup(target.category);
            setSelectedModule(target);
            setRecommendation(null); // Clear rec after applying
        }
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

  const getLanguageIcon = (lang: string) => {
      switch(lang.toLowerCase()) {
          case 'python': return <Terminal size={24} />;
          case 'java': return <Coffee size={24} />;
          case 'c': return <Cpu size={24} />;
          case 'machine learning': return <Activity size={24} />;
          case 'artificial intelligence': return <BrainCircuit size={24} />;
          default: return <Library size={24} />;
      }
  };

  const getModuleIcon = (iconName: string | undefined) => {
    switch(iconName) {
      case 'Terminal': return <Terminal size={22} />;
      case 'GitMerge': return <GitMerge size={22} />;
      case 'RefreshCw': return <RefreshCw size={22} />;
      case 'Database': return <Database size={22} />;
      case 'Coffee': return <Coffee size={22} />;
      case 'Box': return <Box size={22} />;
      case 'List': return <List size={22} />;
      case 'ShieldAlert': return <ShieldAlert size={22} />;
      case 'Cpu': return <Cpu size={22} />;
      case 'HardDrive': return <HardDrive size={22} />;
      case 'TrendingUp': return <TrendingUp size={22} />;
      case 'GitBranch': return <GitBranch size={22} />;
      case 'Share2': return <Share2 size={22} />;
      case 'Search': return <Search size={22} />;
      case 'BrainCircuit': return <BrainCircuit size={22} />;
      case 'MessageSquare': return <MessageSquare size={22} />;
      default: return <Terminal size={22} />;
    }
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
            onClick={handleBackToAcademy} 
            className="w-full p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-all bg-white/10 text-white shadow-inner"
            title="Academy Hub"
          >
            <BookOpen size={18} />
            <span className="hidden lg:block font-bold text-[10px] uppercase tracking-widest">Academy Hub</span>
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
        <main className="flex-1 overflow-hidden flex flex-col p-4 md:p-10">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {/* LEVEL 1: COURSE SELECTION */}
               {!selectedCourse && (
                  <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
                    
                    {/* Neural Advisor Section */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff8c00]/10 rounded-full blur-[80px] group-hover:bg-[#ff8c00]/20 transition-all duration-1000"></div>
                       <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                          <div>
                             <div className="flex items-center gap-2 mb-2">
                                <BrainCircuit size={20} className="text-[#ff8c00] animate-pulse"/>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Advisor</span>
                             </div>
                             <h2 className="text-2xl md:text-3xl font-heading font-black uppercase tracking-tight mb-2">
                                {recommendation ? "Optimization Complete" : "Unsure where to begin?"}
                             </h2>
                             <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                                {recommendation 
                                  ? recommendation.reasoning
                                  : "Our AI engine can analyze your performance metrics to suggest the optimal next step for your career path."
                                }
                             </p>
                             {error && <p className="text-red-400 text-xs font-bold mt-2">{error}</p>}
                             
                             {recommendation && (
                                <div className="mt-6 flex flex-wrap gap-4">
                                   <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-xs">
                                      <span className="block text-[9px] text-slate-500 uppercase font-black">Target</span>
                                      <span className="font-bold text-[#ff8c00]">{recommendation.recommendedModule}</span>
                                   </div>
                                   <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-xs">
                                      <span className="block text-[9px] text-slate-500 uppercase font-black">Effort</span>
                                      <span className="font-bold text-white">{recommendation.estimatedEffort}</span>
                                   </div>
                                   <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-xs">
                                      <span className="block text-[9px] text-slate-500 uppercase font-black">Focus</span>
                                      <span className="font-bold text-cyan-400">{recommendation.focusArea}</span>
                                   </div>
                                </div>
                             )}
                          </div>

                          <div className="shrink-0">
                             {!recommendation ? (
                                <button 
                                   onClick={handleGetRecommendation}
                                   disabled={isLoadingRecommendation}
                                   className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#ff8c00] hover:text-white transition-all flex items-center gap-3"
                                >
                                   {isLoadingRecommendation ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                   {isLoadingRecommendation ? "Analyzing Metrics..." : "Generate Suggestion"}
                                </button>
                             ) : (
                                <button 
                                   onClick={handleApplyRecommendation}
                                   className="px-8 py-4 bg-[#ff8c00] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white hover:text-slate-900 transition-all flex items-center gap-3"
                                >
                                   <Lightbulb size={16} />
                                   Start Recommended Module
                                </button>
                             )}
                          </div>
                       </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 uppercase tracking-tighter">Available <span className="text-slate-400">Certifications</span></h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dataService.getLanguages().map(lang => (
                        <div key={lang} onClick={() => handleCourseSelect(lang)} className="bg-white border border-slate-200 p-8 rounded-[32px] cursor-pointer group hover:border-[#ff8c00] hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 relative overflow-hidden">
                           <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#ff8c00] group-hover:text-white transition-all mb-8 shadow-inner relative z-10">
                              {getLanguageIcon(lang)}
                           </div>
                           <h3 className="text-xl font-heading font-black text-slate-900 mb-2 uppercase tracking-tight relative z-10">{lang}</h3>
                           <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium italic relative z-10">"Master the fundamentals and industrial applications of {lang}."</p>
                           <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-brand-orange relative z-10">
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
                                  {getModuleIcon(mod.icon)}
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
                                { id: 'L0', title: 'L0: Foundational Principles', xp: 8 },
                                { id: 'L1', title: 'L1: Industrial Implementation', xp: 9 },
                                { id: 'L2', title: 'L2: Master Architectural Logic', xp: 10 }
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
                                  <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${selectedLevel === level.id ? 'text-[#ff8c00]' : 'text-slate-300'}`}>{level.xp} MARKS</span>
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
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
