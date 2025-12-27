
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, CheckCircle, Terminal, FileCode, Zap, Activity, Clock, ShieldAlert, Lock, AlertTriangle, Timer, Layers, XCircle, Search, Cpu, ChevronRight, SquareTerminal } from 'lucide-react';
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
  const examProblems = problemSet.length > 0 ? problemSet : dataService.getProblems().slice(0, 10);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [solutions, setSolutions] = useState<{ [id: string]: string }>(
    Object.fromEntries(examProblems.map(p => [p.id, p.starterCode]))
  );
  
  const activeProblem = examProblems[currentIndex];
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'testcases' | 'stdout'>('stdout');
  const [viewState, setViewState] = useState<'editor' | 'analysis'>('editor');
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);

  const [settings] = useState<GlobalSettings>(dataService.getSettings());
  const [timeLeft, setTimeLeft] = useState(settings.standardTimeLimit);
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const timerRef = useRef<any>(null);

  const handleCodeChange = (newCode: string) => {
    setSolutions(prev => ({ ...prev, [activeProblem.id]: newCode }));
  };

  const finalizeExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const evaluationPromises = examProblems.map(async (prob) => {
        const { results, referenceCode } = await validateSolution(solutions[prob.id], prob.language, prob.testCases);
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        
        // STRICT GRADING: All test cases must pass for full points
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
      const allResults: TestResult[] = problemAnalyses.flatMap(res => res.testResults);

      if (currentUser) {
        dataService.updateUserScore(currentUser.id, `EXAM_${Date.now()}`, totalScore);
      }

      setAssessmentSummary({
        problemId: "FINAL_ASSESSMENT",
        score: totalScore,
        maxPoints: examProblems.reduce((sum, p) => sum + (p.points || 0), 0),
        totalTests: totalTestsCount,
        passedTests: totalPassedTests,
        testResults: allResults,
        problemAnalyses: problemAnalyses,
        timeTaken: `${Math.floor((settings.standardTimeLimit - timeLeft) / 60)}m`,
        timestamp: new Date(),
        warningsCount: warnings
      });

      setViewState('analysis');
    } catch (error) {
      console.error("Submission Halted:", error);
      alert("Terminal Sync Error. Awaiting re-establishment of secure link...");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommitClick = () => {
    if (window.confirm('Ready for FINAL COMMITMENT? All 10 Logic Units will be analyzed and results finalized.')) {
      finalizeExam();
    }
  };

  const handleTerminateClick = () => {
    if (window.confirm('TERMINATE SESSION? This will end the exam now and analyze your progress so far. Partial work will be scored.')) {
      finalizeExam();
    }
  };

  useEffect(() => {
    if (viewState === 'analysis') return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => {
          const next = prev + 1;
          if (next >= settings.tabSwitchLimit) finalizeExam();
          else setShowWarningModal(true);
          return next;
        });
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [viewState, settings.tabSwitchLimit]);

  useEffect(() => {
    if (viewState === 'editor') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finalizeExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [viewState]);

  const runCurrentCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveTab('stdout');
    setOutput('>>> INITIALIZING SECURE RUNTIME BUFFER...\n');
    const result = await runCodeSimulation(solutions[activeProblem.id], activeProblem.language, activeProblem.testCases[0]?.input || "");
    setOutput(prev => prev + '>>> OUTPUT STREAM:\n' + result + '\n\n>>> EXECUTION COMPLETE.');
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (viewState === 'analysis' && assessmentSummary) {
    return <AnalyticsView summary={assessmentSummary} onRetry={() => onExit?.()} onNext={onExit} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col animate-fade-in overflow-hidden">
      {/* Integrated Header */}
      <header className="h-16 bg-[#0f172a] flex items-center justify-between px-6 text-white shrink-0 border-b border-white/5 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-brand-cyan/20 p-2 rounded-lg">
            <Cpu size={20} className="text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Industrial Examination Hall</h1>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Candidate: {currentUser?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className={`flex items-center gap-3 px-4 py-1.5 rounded-xl border ${timeLeft < 600 ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-white/5 border-white/10'}`}>
              <Timer size={14} className={timeLeft < 600 ? 'text-red-400' : 'text-brand-cyan'} />
              <span className="font-mono font-black text-sm tracking-tighter">{formatTime(timeLeft)}</span>
           </div>
           
           <div className="flex items-center gap-3">
             <button onClick={handleTerminateClick} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors flex items-center gap-2">
               <XCircle size={14} /> Abort Session
             </button>
             <button onClick={handleCommitClick} disabled={isSubmitting} className="px-6 py-2 bg-brand-orange hover:bg-orange-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all">
               {isSubmitting ? <Activity size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />} Commit Exam
             </button>
           </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left column: Problem definition */}
        <aside className="w-[380px] border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
           <div className="p-8 space-y-10">
              <section>
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logic Unit {currentIndex + 1}</span>
                    <span className="px-2 py-0.5 bg-brand-blue/5 text-brand-blue rounded-md text-[9px] font-black uppercase tracking-widest">{activeProblem?.language}</span>
                 </div>
                 <h2 className="text-2xl font-heading font-black text-brand-blue uppercase tracking-tight mb-4 leading-tight">{activeProblem?.title}</h2>
                 <div className="prose prose-slate prose-sm text-slate-600 font-medium leading-relaxed">
                    {activeProblem?.description}
                 </div>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-100 pb-2">
                    <Search size={12}/> Sample Verification
                 </div>
                 {activeProblem?.testCases.filter(tc => !tc.isHidden).map((tc, idx) => (
                    <div key={idx} className="space-y-3">
                       <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                          <pre className="text-xs text-slate-600 whitespace-pre-wrap">{tc.input}</pre>
                       </div>
                       <div className="bg-cyan-50/30 p-4 rounded-xl border border-brand-cyan/10 font-mono">
                          <pre className="text-xs text-brand-cyan font-bold whitespace-pre-wrap">{tc.expectedOutput}</pre>
                       </div>
                    </div>
                 ))}
              </section>
           </div>
        </aside>

        {/* Right column: IDE + Fitted Console */}
        <main className="flex-1 flex flex-col bg-[#0b1120] min-w-0">
           <nav className="h-14 bg-white/5 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                 <Layers size={14}/> Grid Nav (1-10)
              </div>
              <div className="flex items-center gap-1.5">
                 {examProblems.map((_, i) => (
                    <button 
                       key={i} 
                       onClick={() => setCurrentIndex(i)}
                       className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black transition-all ${
                          currentIndex === i 
                          ? 'bg-brand-cyan text-white shadow-xl shadow-cyan-500/20 scale-110' 
                          : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'
                       }`}
                    >
                       {i + 1}
                    </button>
                 ))}
              </div>
           </nav>

           <div className="flex-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-12 bg-black/40 border-r border-white/5 flex flex-col items-end pr-3 pt-6 text-[10px] font-bold text-slate-700 select-none">
                 {solutions[activeProblem.id].split('\n').map((_, i) => <div key={i} className="h-6 leading-6">{i + 1}</div>)}
              </div>
              <textarea 
                value={solutions[activeProblem.id]} 
                onChange={(e) => handleCodeChange(e.target.value)} 
                className="w-full h-full bg-transparent text-cyan-50 p-6 pl-16 resize-none focus:outline-none leading-6 font-mono text-sm custom-scrollbar" 
                spellCheck="false"
                autoComplete="off"
              />
           </div>

           {/* Perfectly Fit Bottom Console */}
           <section className="h-[220px] bg-white border-t border-slate-200 flex flex-col shrink-0">
              <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                 <div className="flex gap-4 h-full">
                    <button onClick={() => setActiveTab('stdout')} className={`h-full text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'stdout' ? 'border-brand-cyan text-brand-blue' : 'border-transparent text-slate-400'}`}>Simulation</button>
                    <button onClick={() => setActiveTab('testcases')} className={`h-full text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'testcases' ? 'border-brand-cyan text-brand-blue' : 'border-transparent text-slate-400'}`}>Proctor</button>
                 </div>
                 <button onClick={runCurrentCode} disabled={isRunning} className="px-4 py-1 bg-brand-blue text-white rounded-md font-black text-[9px] uppercase tracking-widest hover:bg-brand-cyan transition-all disabled:opacity-50 flex items-center gap-2">
                    {isRunning ? <Activity size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />} Execute Logic
                 </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono bg-slate-50/30">
                 {activeTab === 'stdout' && (
                    <pre className="text-xs text-brand-blue font-bold whitespace-pre-wrap">{output || 'Terminal idle. Requesting subroutine input...'}</pre>
                 )}
                 {activeTab === 'testcases' && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-2 opacity-50">
                       <ShieldAlert size={24} />
                       <p className="text-[9px] font-black uppercase tracking-widest">Integrity lock active. Hidden unit tests inaccessible.</p>
                    </div>
                 )}
              </div>
           </section>
        </main>
      </div>

      {/* Submission Loader Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[110] bg-[#0f172a] flex flex-col items-center justify-center text-white text-center">
           <div className="relative w-24 h-24 mb-10">
              <div className="absolute inset-0 border-4 border-brand-cyan/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
              <Cpu size={32} className="absolute inset-0 m-auto text-brand-cyan animate-pulse" />
           </div>
           <h2 className="text-3xl font-heading font-black uppercase tracking-tighter mb-4">Analyzing Submission Registry</h2>
           <p className="text-brand-cyan font-black text-xs uppercase tracking-[0.5em] animate-pulse">Running Evaluation across 10 Logic Units...</p>
        </div>
      )}

      {/* Warning Overlay */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white p-12 rounded-[32px] max-w-sm w-full text-center space-y-6 shadow-2xl">
              <AlertTriangle size={56} className="mx-auto text-brand-orange animate-bounce" />
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-brand-blue uppercase">Security Flag</h3>
                 <p className="text-slate-500 text-sm font-medium">Session infraction detected. Please focus on the terminal window to prevent automatic termination.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl">
                 <span className="text-3xl font-black text-brand-orange">{warnings} / {settings.tabSwitchLimit}</span>
              </div>
              <button onClick={() => setShowWarningModal(false)} className="w-full py-4 btn-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest">Return to Exam</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default CodeLab;
