import React, { useState, useEffect, useRef } from 'react';
import { User, Course, ChatMessage, Problem } from '../types';
import CourseCard from './CourseCard';
import CodeLab from './CodeLab';
import { generateTutorResponse } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { Search, Sparkles, Send, X, MessageSquare, LogOut, Code, Cpu, Terminal, Globe, BookOpen, Layers, ChevronRight, Play, Trophy } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

type View = 'courses' | 'labs' | 'academy' | 'community';
type AcademyState = 'list' | 'modules' | 'problems' | 'assessment';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<View>('academy');
  const [academyState, setAcademyState] = useState<AcademyState>('list');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [assessmentProblem, setAssessmentProblem] = useState<Problem | null>(null);
  
  // Real-time score update
  const [currentScore, setCurrentScore] = useState(user.score || 0);

  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hi ${user.name}! I'm your AI Tutor. Need help with Python, ML, or any other topic?`, timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync user score from service on mount/updates
  useEffect(() => {
     // Re-fetch user to get updated score
     const updatedUser = dataService.getUsers().find(u => u.id === user.id);
     if (updatedUser) setCurrentScore(updatedUser.score || 0);
  }, [academyState, activeView]); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    const context = activeCourse 
      ? `Current Course: ${activeCourse.title}.` 
      : academyState === 'assessment' 
        ? `User is solving problem: ${assessmentProblem?.title}.`
        : "User is browsing the academy.";

    const responseText = await generateTutorResponse(userMsg.text, context);
    
    const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleAssessmentExit = () => {
    setAcademyState('problems');
    setAssessmentProblem(null);
    // Refresh score
    const updatedUser = dataService.getUsers().find(u => u.id === user.id);
    if(updatedUser) setCurrentScore(updatedUser.score || 0);
  };

  // --- Academy Render Logic ---
  const renderAcademy = () => {
    if (academyState === 'assessment' && assessmentProblem) {
       return (
         <CodeLab 
            initialProblem={assessmentProblem} 
            isAssessmentMode={true}
            currentUser={user}
            onExit={handleAssessmentExit} 
         />
       );
    }

    if (academyState === 'list') {
      const languages = dataService.getLanguages();
      return (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 text-white">Academy <span className="text-cyan-400">Hub</span></h1>
          <p className="text-slate-400 mb-8">Select a learning path to begin your structured training.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {languages.map(lang => (
              <div 
                key={lang}
                onClick={() => { setSelectedLanguage(lang); setAcademyState('modules'); }}
                className="group bg-[#0f172a]/60 border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/10 backdrop-blur-md flex flex-col items-center text-center"
              >
                 <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-slate-700">
                    <span className="text-2xl font-bold text-cyan-400">{lang[0]}</span>
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">{lang} Programming</h3>
                 <p className="text-slate-400 text-sm mb-6">Master {lang} from basics to advanced algorithms.</p>
                 <button className="mt-auto px-6 py-2 rounded-full bg-slate-800 text-white text-sm font-bold group-hover:bg-cyan-600 transition-colors">Start Learning</button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (academyState === 'modules') {
      const modules = dataService.getModulesByLanguage(selectedLanguage);
      return (
        <div className="animate-fade-in">
           <button onClick={() => setAcademyState('list')} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
              <span className="text-xl">&larr;</span> Back to Paths
           </button>
           <h2 className="text-3xl font-bold mb-8 text-white"><span className="text-cyan-400">{selectedLanguage}</span> Modules</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((mod, idx) => (
                <div 
                  key={mod}
                  onClick={() => { setSelectedModule(mod); setAcademyState('problems'); }}
                  className="bg-[#0f172a]/80 border border-slate-800 p-6 rounded-xl cursor-pointer hover:border-cyan-500/40 hover:bg-[#1e293b]/60 transition-all flex items-center justify-between group"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-900/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/20">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{mod}</h3>
                        <p className="text-sm text-slate-400">{dataService.getProblemsByModule(selectedLanguage, mod).length} Topics</p>
                      </div>
                   </div>
                   <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              ))}
           </div>
        </div>
      );
    }

    if (academyState === 'problems') {
      const problems = dataService.getProblemsByModule(selectedLanguage, selectedModule);
      return (
        <div className="animate-fade-in">
           <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <span onClick={() => setAcademyState('list')} className="cursor-pointer hover:text-white">Academy</span>
              <ChevronRight size={14} />
              <span onClick={() => setAcademyState('modules')} className="cursor-pointer hover:text-white">{selectedLanguage}</span>
              <ChevronRight size={14} />
              <span className="text-white font-bold">{selectedModule}</span>
           </div>

           <h2 className="text-3xl font-bold mb-8 text-white">Select Topic</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {problems.map(prob => {
               const isCompleted = user.completedProblems?.includes(prob.id);
               return (
               <div 
                 key={prob.id}
                 className={`bg-[#0f172a]/80 border ${isCompleted ? 'border-emerald-500/30' : 'border-slate-800'} rounded-xl overflow-hidden hover:border-cyan-500/40 transition-all group flex flex-col h-full`}
               >
                  <div className={`h-2 w-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}`} />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                         prob.difficulty === 'L0' ? 'bg-emerald-500/10 text-emerald-400' :
                         prob.difficulty === 'L1' ? 'bg-yellow-500/10 text-yellow-400' :
                         'bg-red-500/10 text-red-400'
                       }`}>{prob.difficulty} ({prob.points} pts)</span>
                       {isCompleted && <Trophy size={16} className="text-yellow-500" />}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{prob.title}</h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-3">{prob.description}</p>
                    
                    <button 
                      onClick={() => { setAssessmentProblem(prob); setAcademyState('assessment'); }}
                      className="mt-auto w-full py-3 bg-slate-800 text-white rounded-lg font-bold group-hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={16} fill="currentColor" />
                      {isCompleted ? 'Practice Again' : 'Start Assessment'}
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
    <div className="min-h-screen bg-[#050b14] text-white flex">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-[#0a101f]/80 backdrop-blur-xl border-r border-slate-800 flex flex-col hidden md:flex sticky top-0 h-screen z-40">
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
                <Terminal size={24} className="text-white" />
             </div>
             <span className="font-bold text-lg hidden md:block text-slate-100 tracking-tight">TechNexus</span>
           </div>
        </div>

        {/* Score Display in Sidebar */}
        <div className="p-4 mx-4 mt-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-center">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Score</h4>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{currentScore}</div>
            <div className="text-[10px] text-slate-500">Points Accumulated</div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div 
            onClick={() => { setActiveView('academy'); setAcademyState('list'); }}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-300 ${activeView === 'academy' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <BookOpen size={20} />
            <span className="hidden md:block font-medium">Academy</span>
          </div>
          <div 
            onClick={() => { setActiveView('courses'); setActiveCourse(null); }}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-300 ${activeView === 'courses' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Cpu size={20} />
            <span className="hidden md:block font-medium">Extra Courses</span>
          </div>
          <div 
            onClick={() => { setActiveView('labs'); setActiveCourse(null); }}
            className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-300 ${activeView === 'labs' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Code size={20} />
            <span className="hidden md:block font-medium">Playground</span>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={onLogout}
             className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center gap-3 justify-center md:justify-start group"
           >
             <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
             <span className="hidden md:block">Sign Out</span>
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-20">
        <header className="h-16 border-b border-slate-800 bg-[#0a101f]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-200">
             Welcome, {user.name}
          </h2>
          <div className="flex items-center gap-4">
             <div className="md:hidden flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full">
                <Trophy size={14} className="text-yellow-500" />
                <span className="font-bold text-sm">{currentScore}</span>
             </div>
             <button onClick={onLogout} className="md:hidden p-2 text-slate-400">
               <LogOut size={20} />
             </button>
          </div>
        </header>

        <main className="p-6 overflow-y-auto flex-1">
          {activeView === 'academy' && renderAcademy()}
          {activeView === 'labs' && <CodeLab currentUser={user} />}
          {activeView === 'courses' && (
             <div className="text-center py-20">
               <Cpu size={48} className="mx-auto text-slate-600 mb-4"/>
               <h3 className="text-2xl font-bold text-slate-400">External Courses</h3>
               <p className="text-slate-500">Video lectures and reading materials (Placeholder).</p>
             </div>
          )}
        </main>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-float"
          >
            <MessageSquare className="text-white" fill="currentColor" />
          </button>
        )}

        {isChatOpen && (
          <div className="w-80 md:w-96 h-[500px] bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up origin-bottom-right ring-1 ring-slate-700">
            <div className="p-4 bg-gradient-to-r from-violet-900 to-indigo-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-300" />
                <h3 className="font-bold text-white">AI Assistant</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-violet-200 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-[#050b14] scrollbar-hide space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-violet-600 text-white rounded-br-none shadow-md' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700 shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                   <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700 flex gap-1">
                     <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                     <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[#0f172a] border-t border-slate-800">
               <div className="flex gap-2">
                 <input 
                   type="text"
                   value={inputMessage}
                   onChange={(e) => setInputMessage(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder="Ask about code..."
                   className="flex-1 bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                 />
                 <button 
                   onClick={handleSendMessage}
                   disabled={isLoading || !inputMessage.trim()}
                   className="p-2 bg-violet-600 rounded-lg text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                 >
                   <Send size={18} />
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;