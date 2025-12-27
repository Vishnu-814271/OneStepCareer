
import React, { useState, useEffect } from 'react';
import { User, Course, Problem } from '../types';
import CodeLab from './CodeLab';
import { dataService } from '../services/dataService';
import { Terminal, BookOpen, ChevronRight, Play, Trophy, User as UserIcon, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import CommunityChat from './CommunityChat';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

type View = 'curriculum' | 'comms' | 'assessment';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<View>('curriculum');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isExamActive, setIsExamActive] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(user);

  useEffect(() => {
     const freshUser = dataService.getUserById(currentUser.id);
     if (freshUser) setCurrentUser(freshUser);
  }, [isExamActive]);

  const startExamination = (lang: string) => {
    setSelectedLanguage(lang);
    setIsExamActive(true);
  };

  if (isExamActive) {
    return <CodeLab onExit={() => setIsExamActive(false)} currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-[#f1f1f2] flex student-theme-gradient">
      {/* Sidebar */}
      <aside className="w-20 md:w-72 bg-brand-blue flex flex-col sticky top-0 h-screen z-40 text-white shadow-2xl">
        <div className="p-10 border-b border-white/10">
           <div className="flex items-center gap-4">
             <div className="bg-brand-cyan p-3 rounded-2xl shadow-lg shadow-brand-cyan/20">
                <Terminal size={24} className="text-white" />
             </div>
             <span className="font-heading font-black text-2xl hidden md:block text-white tracking-tighter uppercase">Nexus Core</span>
           </div>
        </div>

        <nav className="flex-1 p-8 space-y-4 mt-6">
          <button onClick={() => setActiveView('curriculum')} className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all group ${activeView === 'curriculum' ? 'bg-white text-brand-blue shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
            <BookOpen size={20} />
            <span className="hidden md:block font-black text-xs uppercase tracking-widest">Training Paths</span>
          </button>
          <button onClick={() => setActiveView('comms')} className={`w-full p-5 rounded-2xl flex items-center gap-4 transition-all group ${activeView === 'comms' ? 'bg-white text-brand-blue shadow-xl' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
            <ShieldAlert size={20} />
            <span className="hidden md:block font-black text-xs uppercase tracking-widest">Network Comms</span>
          </button>
        </nav>

        <div className="p-10 border-t border-white/10 space-y-6">
           <div className="p-6 rounded-3xl bg-white/10 border border-white/20 text-center hidden md:block">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Skill Pulse</div>
              <div className="text-3xl font-black text-brand-orange">{currentUser.score || 0} <span className="text-xs opacity-50">XP</span></div>
           </div>
           <button onClick={onLogout} className="w-full p-5 rounded-2xl text-white/60 hover:bg-red-500/20 hover:text-red-100 transition-all flex items-center gap-4 justify-center md:justify-start font-black uppercase text-[10px] tracking-widest">
             <LogOut size={18} />
             <span className="hidden md:block">Terminate session</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-24 bg-white/60 backdrop-blur-3xl sticky top-0 z-30 flex items-center justify-between px-12 border-b border-slate-200">
          <div className="flex items-center gap-4">
             <div className="h-3 w-3 rounded-full bg-brand-cyan animate-pulse"></div>
             <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Operational Node: {activeView}</h2>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="flex flex-col items-end">
                <span className="text-sm font-black text-brand-blue uppercase tracking-tight">{currentUser.name}</span>
                <span className="text-[10px] text-brand-orange font-black uppercase tracking-widest">Candidate Status: Verified</span>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-blue shadow-sm">
                <UserIcon size={24} />
             </div>
          </div>
        </header>

        <main className="p-12 flex-1 overflow-y-auto custom-scrollbar">
          {activeView === 'curriculum' && (
            <div className="space-y-12 animate-fade-in">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                  <Sparkles size={12}/> Academic Enrollment Active
                </div>
                <h1 className="text-5xl font-heading font-black text-brand-blue tracking-tighter mb-4">Industrial <span className="text-brand-cyan">Protocols</span></h1>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">Select a training architecture to begin your timed 90-minute examination session. Completion of 10 logic units is mandatory for XP accreditation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {dataService.getLanguages().map(lang => (
                  <div key={lang} onClick={() => startExamination(lang)} className="group glass-card p-10 rounded-[40px] cursor-pointer transition-all hover:bg-white border-2 border-transparent hover:border-brand-cyan/20 flex flex-col shadow-sm">
                     <div className="w-20 h-20 rounded-3xl bg-brand-cyan/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <span className="text-4xl font-black text-brand-blue opacity-50">{lang[0]}</span>
                     </div>
                     <h3 className="text-3xl font-heading font-black text-brand-blue mb-4">{lang}</h3>
                     <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">10 Industrial logic units mapped for {lang} architecture.</p>
                     <button className="mt-auto px-8 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-brand-blue font-black text-xs group-hover:bg-brand-cyan group-hover:text-white group-hover:border-brand-cyan transition-all uppercase tracking-widest flex items-center justify-center gap-3">
                        Enter Exam Hall <ChevronRight size={16}/>
                     </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeView === 'comms' && (
            <div className="h-[calc(100vh-250px)] animate-fade-in">
               <CommunityChat currentUser={currentUser} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
