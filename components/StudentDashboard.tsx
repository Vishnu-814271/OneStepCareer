import React, { useState, useEffect, useRef } from 'react';
import { User, Course, ChatMessage, Problem } from '../types';
import CodeLab from './CodeLab';
import { generateTutorResponse } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { Sparkles, Send, X, MessageSquare, LogOut, Code, Terminal, BookOpen, ChevronRight, Play, Trophy, User as UserIcon, Save, Mail, Camera, CheckCircle, GraduationCap } from 'lucide-react';
import CommunityChat from './CommunityChat';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

type View = 'academy' | 'community' | 'labs';
type AcademyState = 'list' | 'modules' | 'problems' | 'assessment';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<View>('academy');
  const [academyState, setAcademyState] = useState<AcademyState>('list');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [assessmentProblem, setAssessmentProblem] = useState<Problem | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const [currentScore, setCurrentScore] = useState(currentUser.score || 0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Welcome back, ${currentUser.name}! I'm your AI Academic Assistant. Ready to code?`, timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     const freshUser = dataService.getUserById(currentUser.id);
     if (freshUser) {
        setCurrentUser(freshUser);
        setCurrentScore(freshUser.score || 0);
     }
  }, [academyState, activeView]); 

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    const context = assessmentProblem ? `Student is solving: ${assessmentProblem.title}` : "General Academy Guidance";
    const responseText = await generateTutorResponse(userMsg.text, context);
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    setIsLoading(false);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      const updated = dataService.updateUserProfile(currentUser.id, { name: editName, email: editEmail });
      if (updated) {
        setCurrentUser(updated);
        setSaveStatus('success');
        setTimeout(() => { setSaveStatus('idle'); setIsProfileModalOpen(false); }, 1500);
      }
    }, 800);
  };

  const renderAcademy = () => {
    if (academyState === 'assessment' && assessmentProblem) {
       return <CodeLab initialProblem={assessmentProblem} isAssessmentMode={true} currentUser={currentUser} onExit={() => setAcademyState('problems')} />;
    }
    if (academyState === 'list') {
      return (
        <div className="animate-fade-in space-y-8">
          <div>
            <h1 className="text-3xl font-heading font-extrabold mb-2 text-white">Course <span className="text-brand-blue">Catalog</span></h1>
            <p className="text-slate-400 max-w-2xl">Elite technical training paths designed for mastery and industrial competence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dataService.getLanguages().map(lang => (
              <div key={lang} onClick={() => { setSelectedLanguage(lang); setAcademyState('modules'); }} className="group glass-card p-8 rounded-2xl cursor-pointer transition-all hover:bg-brand-blue/5 border-l-4 border-l-brand-blue/20 hover:border-l-brand-gold flex flex-col">
                 <div className="w-16 h-16 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-6 border border-brand-blue/20 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-brand-gold">{lang[0]}</span>
                 </div>
                 <h3 className="text-2xl font-heading font-bold text-white mb-2">{lang} Programming</h3>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed">Comprehensive curriculum covering {lang} fundamentals through enterprise-grade architecture.</p>
                 <button className="mt-auto px-6 py-3 rounded-lg bg-brand-blue/20 border border-brand-blue/40 text-brand-blue font-bold text-sm group-hover:bg-brand-blue group-hover:text-white transition-all uppercase tracking-wider">View Syllabus</button>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (academyState === 'modules') {
      return (
        <div className="animate-fade-in">
           <button onClick={() => setAcademyState('list')} className="mb-8 text-brand-blue hover:text-brand-gold flex items-center gap-2 font-bold transition-colors">
              <span className="text-xl">&larr;</span> Back to Catalog
           </button>
           <h2 className="text-4xl font-heading font-black mb-10 text-white"><span className="text-brand-gold uppercase tracking-tighter">{selectedLanguage}</span> Learning Path</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataService.getModulesByLanguage(selectedLanguage).map((mod, idx) => (
                <div key={mod} onClick={() => { setSelectedModule(mod); setAcademyState('problems'); }} className="glass-card p-8 rounded-2xl cursor-pointer hover:border-brand-gold/40 hover:bg-brand-blue/5 transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-6">
                      <div className="text-3xl font-black text-slate-800 group-hover:text-brand-gold transition-colors">{String(idx + 1).padStart(2, '0')}</div>
                      <div>
                        <h3 className="text-xl font-heading font-bold text-white group-hover:text-brand-blue transition-colors">{mod}</h3>
                        <p className="text-sm text-slate-500 font-medium">{dataService.getProblemsByModule(selectedLanguage, mod).length} Learning Objectives</p>
                      </div>
                   </div>
                   <div className="p-3 rounded-full bg-slate-800/50 group-hover:bg-brand-blue group-hover:text-white text-slate-500 transition-all">
                      <ChevronRight size={20} />
                   </div>
                </div>
              ))}
           </div>
        </div>
      );
    }
    if (academyState === 'problems') {
      return (
        <div className="animate-fade-in">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-8 uppercase tracking-widest">
              <span onClick={() => setAcademyState('list')} className="cursor-pointer hover:text-brand-blue">ACADEMY</span>
              <ChevronRight size={12} />
              <span onClick={() => setAcademyState('modules')} className="cursor-pointer hover:text-brand-blue">{selectedLanguage}</span>
              <ChevronRight size={12} />
              <span className="text-brand-gold">{selectedModule}</span>
           </div>
           <h2 className="text-3xl font-heading font-extrabold mb-10 text-white">Curated Assessment List</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {dataService.getProblemsByModule(selectedLanguage, selectedModule).map(prob => {
               const isCompleted = currentUser.completedProblems?.includes(prob.id);
               return (
               <div key={prob.id} className={`glass-card rounded-2xl overflow-hidden hover:border-brand-gold/30 transition-all group flex flex-col h-full border-t-2 ${isCompleted ? 'border-brand-green/50' : 'border-brand-blue/50'}`}>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                       <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${prob.difficulty === 'L0' ? 'bg-brand-green/10 text-brand-green' : prob.difficulty === 'L1' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-brand-orange/10 text-brand-orange'}`}>{prob.difficulty} LEVEL</span>
                       {isCompleted ? <Trophy size={18} className="text-brand-gold" /> : <span className="text-xs font-bold text-slate-600 font-mono">+{prob.points} XP</span>}
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white mb-3">{prob.title}</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-3">{prob.description}</p>
                    <button onClick={() => { setAssessmentProblem(prob); setAcademyState('assessment'); }} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isCompleted ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'btn-orange text-white'}`}>
                      <Play size={14} fill="currentColor" /> {isCompleted ? 'Review Solution' : 'Begin Assessment'}
                    </button>
                  </div>
               </div>
             )})}
           </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex student-theme-gradient">
      {/* Sidebar - Royal Blue Academy Style */}
      <aside className="w-20 md:w-64 bg-brand-navy-dark/90 backdrop-blur-2xl border-r border-slate-800/60 flex flex-col sticky top-0 h-screen z-40">
        <div className="p-8 border-b border-slate-800/40">
           <div className="flex items-center gap-4">
             <div className="bg-brand-blue p-2.5 rounded-xl shadow-xl shadow-brand-blue/20">
                <GraduationCap size={24} className="text-white" />
             </div>
             <span className="font-heading font-black text-xl hidden md:block text-white tracking-tighter">TECHNEXUS</span>
           </div>
        </div>

        <div className="p-4 mx-6 mt-8 rounded-2xl bg-slate-900/50 border border-brand-gold/20 text-center hidden md:block group hover:border-brand-gold/40 transition-colors">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Academy Credentials</h4>
            <div className="text-3xl font-black text-brand-gold gold-text-glow">{currentScore} <span className="text-[10px] font-bold text-brand-gold opacity-60">XP</span></div>
        </div>

        <nav className="flex-1 p-6 space-y-3 mt-4">
          <button onClick={() => { setActiveView('academy'); setAcademyState('list'); }} className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all group ${activeView === 'academy' ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
            <BookOpen size={20} className={activeView === 'academy' ? 'text-brand-blue' : 'text-slate-600'} />
            <span className="hidden md:block font-bold text-sm tracking-tight uppercase tracking-widest">Academy</span>
          </button>
          <button onClick={() => setActiveView('community')} className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all group ${activeView === 'community' ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
            <MessageSquare size={20} className={activeView === 'community' ? 'text-brand-blue' : 'text-slate-600'} />
            <span className="hidden md:block font-bold text-sm tracking-tight uppercase tracking-widest">Community</span>
          </button>
          <button onClick={() => setActiveView('labs')} className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all group ${activeView === 'labs' ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
            <Code size={20} className={activeView === 'labs' ? 'text-brand-blue' : 'text-slate-600'} />
            <span className="hidden md:block font-bold text-sm tracking-tight uppercase tracking-widest">Labs</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800/40">
           <button onClick={onLogout} className="w-full p-4 rounded-xl text-slate-600 hover:bg-brand-orange/10 hover:text-brand-orange transition-all flex items-center gap-4 justify-center md:justify-start font-bold uppercase text-[10px] tracking-widest">
             <LogOut size={18} />
             <span className="hidden md:block">Terminate Session</span>
           </button>
        </div>
      </aside>

      {/* Main Experience */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-20 border-b border-slate-800/40 bg-[#020617]/40 backdrop-blur-3xl sticky top-0 z-30 flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
             <div className="h-3 w-3 rounded-full bg-brand-blue animate-pulse"></div>
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Terminal <span className="text-slate-700">/</span> {activeView}</h2>
          </div>
          
          {/* Professional Header Profile */}
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-white leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest opacity-80">{currentUser.plan || 'Standard Entry'}</span>
             </div>
             <button 
                onClick={() => { setIsProfileModalOpen(true); setEditName(currentUser.name); setEditEmail(currentUser.email); }}
                className="w-12 h-12 rounded-2xl bg-brand-navy-dark border border-brand-gold/30 flex items-center justify-center text-brand-gold hover:border-brand-gold hover:scale-105 transition-all shadow-xl shadow-brand-gold/5 overflow-hidden"
             >
                <UserIcon size={24} />
             </button>
          </div>
        </header>

        <main className="p-10 flex-1 overflow-y-auto custom-scrollbar">
          {activeView === 'academy' && renderAcademy()}
          {activeView === 'community' && <CommunityChat currentUser={currentUser} />}
          {activeView === 'labs' && <CodeLab currentUser={currentUser} />}
        </main>

        {/* Profile Management Drawer/Modal */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-night/90 backdrop-blur-xl animate-fade-in">
             <div className="bg-brand-navy-dark border border-brand-gold/20 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
                <div className="p-8 border-b border-slate-800/60 flex items-center justify-between bg-brand-blue/5">
                   <h3 className="text-2xl font-heading font-black text-white flex items-center gap-3"><UserIcon size={24} className="text-brand-gold" /> Academic Registry</h3>
                   <button onClick={() => setIsProfileModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                         <div className="relative">
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-brand-blue outline-none transition-all font-medium" required />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700"><CheckCircle size={16}/></div>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Verification Email</label>
                         <div className="relative">
                            <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-brand-blue outline-none transition-all font-medium" required />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700"><Mail size={16}/></div>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-4 bg-slate-800/50 text-slate-400 rounded-2xl font-bold hover:bg-slate-800 transition-all">Discard</button>
                      <button type="submit" disabled={saveStatus === 'saving'} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all ${saveStatus === 'success' ? 'bg-brand-green' : 'btn-orange'}`}>
                        {saveStatus === 'saving' ? 'Verifying...' : saveStatus === 'success' ? 'Updated' : 'Save Changes'}
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;