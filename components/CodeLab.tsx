
import React, { useState, useEffect, useCallback, useRef } from 'react';
/* Added RefreshCw to the lucide-react imports */
import { Play, CheckCircle, Terminal, FileCode, Zap, Activity, Clock, ShieldAlert, Lock, AlertTriangle, Timer, Layers, XCircle, Search, Cpu, ChevronRight, SquareTerminal, Info, ExternalLink, LifeBuoy, ShieldCheck, ShieldX, LogOut, RefreshCw } from 'lucide-react';
import { runCodeSimulation, validateSolution } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { Problem, AssessmentSummary, User, TestResult, GlobalSettings, ProblemAnalysis } from '../types';
import AnalyticsView from './AnalyticsView';

interface CodeLabProps {
  problemSet?: Problem[];
  onExit?: () => void;
  currentUser?: User;
}

const CodeLab: React.FC<CodeLabProps> = ({ problemSet = [], onExit, currentUser }) => {
  const [settings] = useState<GlobalSettings>(dataService.getSettings());
  const examProblems = problemSet.length > 0 ? problemSet : dataService.getProblems().slice(0, 10);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [solutions, setSolutions] = useState<{ [id: string]: string }>(
    Object.fromEntries(examProblems.map(p => [p.id, p.starterCode]))
  );
  
  // Ref to always hold the latest solutions for async proctoring callbacks
  const solutionsRef = useRef(solutions);
  useEffect(() => {
    solutionsRef.current = solutions;
  }, [solutions]);

  const activeProblem = examProblems[currentIndex];
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [activeTab, setActiveTab] = useState<'testcases' | 'stdout'>('stdout');
  const [viewState, setViewState] = useState<'editor' | 'analysis'>('editor');
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);

  const [timeLeft, setTimeLeft] = useState(settings.standardTimeLimit);
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const timerRef = useRef<any>(null);

  const handleCodeChange = (newCode: string) => {
    if (isTimeExpired || isTerminated) return;
    setSolutions(prev => ({ ...prev, [activeProblem.id]: newCode }));
  };

  const finalizeExam = useCallback(async (reason: 'manual' | 'timeout' | 'violation' = 'manual') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (reason === 'timeout') setIsTimeExpired(true);
    if (reason === 'violation') setIsTerminated(true);
    
    try {
      const currentSolutions = solutionsRef.current;
      
      const evaluationPromises = examProblems.map(async (prob) => {
        const { results, referenceCode } = await validateSolution(currentSolutions[prob.id], prob.language, prob.testCases);
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        const isPerfect = passedCount === totalCount && totalCount > 0;
        
        return {
          problemId: prob.id,
          title: prob.title,
          score: isPerfect ? (prob.points || 0) : 0,
          isPerfect,
          testResults: results,
          referenceCode: referenceCode
        } as ProblemAnalysis;
      });

      const problemAnalyses = await Promise.all(evaluationPromises);
      const totalScore = problemAnalyses.reduce((sum, res) => sum + res.score, 0);
      const totalPassedTests = problemAnalyses.reduce((sum, res) => sum + res.testResults.filter(r => r.passed).length, 0);
      const totalTestsCount = problemAnalyses.reduce((sum, res) => sum + res.testResults.length, 0);

      if (currentUser) {
        dataService.updateUserScore(currentUser.id, `EXAM_${Date.now()}`, totalScore);
      }

      setAssessmentSummary({
        problemId: "FINAL_ASSESSMENT",
        score: totalScore,
        maxPoints: examProblems.reduce((sum, p) => sum + (p.points || 0), 0),
        totalTests: totalTestsCount,
        passedTests: totalPassedTests,
        testResults: [], 
        problemAnalyses: problemAnalyses,
        timeTaken: `${Math.floor((settings.standardTimeLimit - timeLeft) / 60)}m`,
        timestamp: new Date(),
        warningsCount: warnings + (reason === 'violation' ? 1 : 0)
      });

      setViewState('analysis');
    } catch (error) {
      console.error("Submission Halted:", error);
      alert("Terminal Sync Error. Critical session data might be lost.");
    } finally {
      setIsSubmitting(false);
    }
  }, [examProblems, currentUser, settings.standardTimeLimit, timeLeft, warnings, isSubmitting]);

  // Handle Tab Switches & Proctoring (THE WARNING SYSTEM)
  useEffect(() => {
    if (viewState === 'analysis' || isTerminated || isTimeExpired) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => {
          const next = prev + 1;
          // ADMIN CONFIGURED LIMIT
          if (next >= settings.tabSwitchLimit) {
            finalizeExam('violation');
            return next;
          } else {
            setShowWarningModal(true);
            return next;
          }
        });
      }
    };

    // Block Copy-Paste if restricted
    const blockAction = (e: Event) => {
      if (!settings.allowCopyPaste) {
        e.preventDefault();
        alert("SECURITY PROTOCOL ERROR: Clipboard operations (Copy/Paste/Cut) are restricted for this assessment unit.");
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('copy', blockAction);
    window.addEventListener('paste', blockAction);
    window.addEventListener('cut', blockAction);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('copy', blockAction);
      window.removeEventListener('paste', blockAction);
      window.removeEventListener('cut', blockAction);
    };
  }, [viewState, isTerminated, isTimeExpired, settings.tabSwitchLimit, settings.allowCopyPaste, finalizeExam]);

  // Timer Implementation
  useEffect(() => {
    if (viewState === 'editor' && !isTerminated) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finalizeExam('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [viewState, isTerminated, finalizeExam]);

  const runCurrentCode = async () => {
    if (isRunning || isTimeExpired || isTerminated) return;
    setIsRunning(true);
    setActiveTab('stdout');
    setOutput('>>> INITIALIZING VIRTUAL COMPILER BUFFER...\n');
    const result = await runCodeSimulation(solutions[activeProblem.id], activeProblem.language, activeProblem.testCases[0]?.input || "");
    setOutput(result);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (viewState === 'analysis' && assessmentSummary) {
    return <AnalyticsView summary={assessmentSummary} onRetry={() => onExit?.()} onNext={onExit} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col animate-fade-in overflow-hidden">
      {/* High-Tech Top Bar */}
      <header className="h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-8 text-white shrink-0 relative z-[70]">
        <div className="flex items-center gap-6">
          <div className="bg-brand-blue/20 p-2 rounded-lg border border-brand-blue/20">
            <Cpu size={20} className="text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Industrial Assessment Hall</h1>
            <p className="text-sm font-black text-white uppercase tracking-tighter mt-0.5">{activeProblem?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className={`flex items-center gap-3 px-4 py-1.5 rounded-xl border transition-all ${timeLeft < 300 ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-white/5 border-white/10'}`}>
              <Timer size={14} className={timeLeft < 300 ? 'text-red-400' : 'text-brand-cyan'} />
              <span className={`font-mono font-black text-sm tracking-tighter ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
           </div>
           
           <div className="flex items-center gap-3">
             <button onClick={() => finalizeExam('manual')} className="px-5 py-2.5 bg-brand-orange hover:bg-orange-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 transition-all">
               {isSubmitting ? <Activity size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Commit Session
             </button>
           </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Logic Units Navigation */}
        <aside className="w-[340px] border-r border-white/5 bg-slate-900/50 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
           <div className="p-8 space-y-8">
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Logic Circuit Map</span>
                    <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded text-[9px] font-black uppercase tracking-widest">{activeProblem?.language}</span>
                 </div>
                 <div className="grid grid-cols-5 gap-2">
                    {examProblems.map((_, i) => (
                       <button 
                          key={i} 
                          onClick={() => setCurrentIndex(i)}
                          className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-black transition-all ${
                             currentIndex === i 
                             ? 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20 scale-105' 
                             : 'bg-white/5 text-white/20 hover:bg-white/10'
                          }`}
                       >
                          {i + 1}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="h-px bg-white/5"></div>

              <section className="space-y-6">
                 <h2 className="text-xl font-heading font-black text-white uppercase tracking-tight leading-tight">{activeProblem?.title}</h2>
                 <div className="text-slate-400 text-sm font-medium leading-relaxed italic opacity-80">
                    {activeProblem?.description}
                 </div>
              </section>

              <section className="space-y-4">
                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Search size={12}/> Functional Requirements
                 </div>
                 {activeProblem?.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                    <div key={idx} className="space-y-3">
                       <div className="bg-black/40 p-4 rounded-2xl border border-white/5 font-mono">
                          <span className="text-[8px] font-black text-slate-600 uppercase block mb-2 tracking-widest">Input Vector</span>
                          <pre className="text-[11px] text-slate-300 whitespace-pre-wrap">{tc.input}</pre>
                       </div>
                    </div>
                 ))}
              </section>
           </div>
        </aside>

        {/* Editor Area */}
        <main className="flex-1 flex flex-col bg-[#0b1120] min-w-0 relative">
           {/* TERMINATION OVERLAY */}
           {(isTimeExpired || isTerminated) && (
             <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-8">
               <div className="bg-white p-16 rounded-[48px] text-center max-w-md shadow-3xl space-y-10 animate-in zoom-in-95 duration-500 border-8 border-red-500/20">
                 <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto ${isTerminated ? 'bg-red-50 text-red-500' : 'bg-brand-blue/5 text-brand-blue'} animate-pulse`}>
                   {isTerminated ? <ShieldX size={56} /> : <Clock size={56} />}
                 </div>
                 <div className="space-y-4">
                   <h3 className="text-4xl font-black text-brand-blue uppercase tracking-tighter leading-none">
                      {isTerminated ? 'SESSION TERMINATED' : 'TIME ELAPSED'}
                   </h3>
                   <p className="text-slate-500 font-medium text-sm leading-relaxed px-4">
                      {isTerminated 
                        ? 'SECURITY BREACH DETECTED: Multiple tab switches detected. Your industrial session has been forcefully closed for disciplinary review.'
                        : 'CHRONO PROTOCOL ACTIVE: Allotted time has reached zero. Synchronizing current logic states for final AI analysis...'}
                   </p>
                 </div>
                 <div className="flex items-center justify-center gap-4 text-brand-cyan">
                    <RefreshCw size={24} className="animate-spin" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">Archiving Registry...</span>
                 </div>
               </div>
             </div>
           )}

           <div className="flex-1 relative flex flex-col">
              <div className="h-10 bg-black/40 border-b border-white/5 flex items-center px-6 shrink-0">
                 <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <Terminal size={12}/> logic_terminal_v4.py
                 </div>
              </div>
              <div className="flex-1 relative overflow-hidden flex">
                 <div className="w-12 bg-black/40 border-r border-white/5 flex flex-col items-end pr-3 pt-6 text-[10px] font-bold text-slate-700 select-none font-mono">
                    {solutions[activeProblem.id].split('\n').map((_, i) => <div key={i} className="h-6 leading-6">{i + 1}</div>)}
                 </div>
                 <textarea 
                   value={solutions[activeProblem.id]} 
                   onChange={(e) => handleCodeChange(e.target.value)} 
                   readOnly={isTimeExpired || isTerminated}
                   className="flex-1 bg-transparent text-cyan-50 p-6 resize-none focus:outline-none font-mono text-sm custom-scrollbar" 
                   spellCheck="false"
                 />
              </div>
           </div>

           {/* Console Area */}
           <section className="h-[260px] bg-slate-900 border-t border-white/5 flex flex-col shrink-0">
              <div className="h-10 bg-black/20 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                 <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <SquareTerminal size={12}/> Diagnostic Output
                 </div>
                 <button onClick={runCurrentCode} disabled={isRunning || isTimeExpired || isTerminated} className="px-4 py-1 bg-brand-blue text-white rounded-md font-black text-[9px] uppercase tracking-widest hover:bg-brand-cyan transition-all disabled:opacity-50 flex items-center gap-2">
                    {isRunning ? <Activity size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />} Run Simulation
                 </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono bg-black/20 text-xs text-slate-400">
                 {output || 'Waiting for execution signal...'}
              </div>
           </section>
        </main>
      </div>

      {/* WARNING MODAL (REPLACEMENT FOR SIMPLE ALERT) */}
      {showWarningModal && !isTerminated && (
        <div className="fixed inset-0 z-[120] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white p-12 rounded-[48px] max-w-sm w-full text-center space-y-10 shadow-3xl border-4 border-brand-orange/30">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-brand-orange animate-bounce">
                <AlertTriangle size={56} />
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-black text-brand-blue uppercase tracking-tighter">INTEGRITY ALERT</h3>
                 <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    System detected a browser focus switch. This action violates industrial proctoring standards.
                 </p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-200 flex flex-col gap-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INFRACTION LOG</span>
                 <div className="text-5xl font-black text-brand-orange tracking-tighter">
                    {warnings} <span className="text-lg opacity-30">/ {settings.tabSwitchLimit}</span>
                 </div>
                 <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-2">Final Warning at {settings.tabSwitchLimit}</p>
              </div>
              <button 
                onClick={() => setShowWarningModal(false)} 
                className="w-full py-5 btn-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3"
              >
                RETURN TO TERMINAL
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CodeLab;
