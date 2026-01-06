
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight, CheckCircle, X, ChevronDown, Flag, RotateCcw, Terminal, ShieldCheck, Info, Search } from 'lucide-react';
import { runCodeSimulation, validateSolution } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { Problem, AssessmentSummary, User, GlobalSettings, ProblemAnalysis, TestResult } from '../types';
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
  
  const [status, setStatus] = useState<{ [id: string]: 'not-visited' | 'not-answered' | 'answered' | 'review' }>(
    Object.fromEntries(examProblems.map(p => [p.id, 'not-visited']))
  );

  const [testResults, setTestResults] = useState<{ [id: string]: TestResult[] }>({});
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [showResultsOverlay, setShowResultsOverlay] = useState(false);

  const solutionsRef = useRef(solutions);
  useEffect(() => {
    solutionsRef.current = solutions;
  }, [solutions]);

  const activeProblem = examProblems[currentIndex];
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [viewState, setViewState] = useState<'editor' | 'analysis'>('editor');
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);

  const [timeLeft, setTimeLeft] = useState(settings.standardTimeLimit);
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const timerRef = useRef<any>(null);

  const handleCodeChange = (newCode: string) => {
    setSolutions(prev => ({ ...prev, [activeProblem.id]: newCode }));
    if (status[activeProblem.id] === 'not-visited') {
        setStatus(prev => ({ ...prev, [activeProblem.id]: 'not-answered' }));
    }
  };

  const handleNext = () => {
    if (currentIndex < examProblems.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleMark = () => {
    setStatus(prev => ({ ...prev, [activeProblem.id]: 'review' }));
    if (currentIndex < examProblems.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handleClear = () => {
    setSolutions(prev => ({ ...prev, [activeProblem.id]: activeProblem.starterCode }));
    setTestResults(prev => ({ ...prev, [activeProblem.id]: [] }));
    setStatus(prev => ({ ...prev, [activeProblem.id]: 'not-answered' }));
  };

  const handleSubmitQuestion = async () => {
    if (isSubmittingQuestion) return;
    setIsSubmittingQuestion(true);
    setShowResultsOverlay(true);
    setOutput('>>> RUNNING COMPREHENSIVE TEST SUITE...\n');

    try {
      // Ensure we have at least 5 test cases as requested
      // If admin didn't provide enough, the validateSolution service handles it or we use what's available
      const { results } = await validateSolution(solutions[activeProblem.id], activeProblem.language, activeProblem.testCases);
      
      setTestResults(prev => ({ ...prev, [activeProblem.id]: results }));
      
      const allPassed = results.every(r => r.passed);
      if (allPassed && results.length > 0) {
        setStatus(prev => ({ ...prev, [activeProblem.id]: 'answered' }));
        setOutput(prev => prev + '>>> ALL TEST CASES PASSED. SCORE REGISTERED.\n');
      } else {
        setStatus(prev => ({ ...prev, [activeProblem.id]: 'not-answered' }));
        setOutput(prev => prev + `>>> ${results.filter(r => !r.passed).length} TEST CASES FAILED.\n`);
      }
    } catch (error) {
      console.error("Submission failed", error);
      setOutput(prev => prev + '>>> ERROR IN TEST RUNNER. PLEASE RETRY.\n');
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const finalizeExam = useCallback(async () => {
    if (isSubmittingExam) return;
    setIsSubmittingExam(true);
    
    try {
      const currentSolutions = solutionsRef.current;
      const evaluationPromises = examProblems.map(async (prob) => {
        const { results, referenceCode } = await validateSolution(currentSolutions[prob.id], prob.language, prob.testCases);
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        
        // Strict scoring: ONLY 100% pass gets points
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

      if (currentUser) {
        problemAnalyses.forEach(analysis => {
            if (analysis.isPerfect) dataService.updateUserScore(currentUser.id, analysis.problemId, analysis.score);
        });
      }

      setAssessmentSummary({
        problemId: "FINAL_ASSESSMENT",
        score: totalScore,
        maxPoints: examProblems.reduce((sum, p) => sum + (p.points || 0), 0),
        totalTests: problemAnalyses.reduce((sum, res) => sum + res.testResults.length, 0),
        passedTests: problemAnalyses.reduce((sum, res) => sum + res.testResults.filter(r => r.passed).length, 0),
        testResults: [], 
        problemAnalyses: problemAnalyses,
        timeTaken: `${Math.floor((settings.standardTimeLimit - timeLeft) / 60)}m`,
        timestamp: new Date(),
        warningsCount: warnings
      });

      setViewState('analysis');
    } catch (error) {
      console.error("Submission error", error);
    } finally {
      setIsSubmittingExam(false);
    }
  }, [examProblems, currentUser, settings.standardTimeLimit, timeLeft, warnings, isSubmittingExam]);

  useEffect(() => {
    if (viewState === 'analysis') return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => {
          const next = prev + 1;
          setShowWarningModal(true);
          return next;
        });
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [viewState]);

  useEffect(() => {
    if (viewState === 'editor') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { finalizeExam(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [viewState, finalizeExam]);

  const runCodeOnly = async () => {
    setIsRunning(true);
    const result = await runCodeSimulation(solutions[activeProblem.id], activeProblem.language, activeProblem.testCases[0]?.input || "");
    setOutput(result);
    setIsRunning(false);
  };

  const getStatusSummary = () => {
    const vals = Object.values(status);
    return {
      answered: vals.filter(v => v === 'answered').length,
      notAnswered: vals.filter(v => v === 'not-answered' || v === 'not-visited').length,
      marked: vals.filter(v => v === 'review').length
    };
  };

  if (viewState === 'analysis' && assessmentSummary) {
    return <AnalyticsView summary={assessmentSummary} onRetry={() => onExit?.()} onNext={onExit} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#8c8c8c] flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="h-14 bg-[#8c8c8c] flex items-center justify-between px-8 border-b border-black/10 shrink-0">
         <div className="flex items-center gap-10">
            <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Answer The Following</h1>
            <div className="flex gap-6 text-sm font-bold text-slate-800">
                <span>Marks : {activeProblem.points}</span>
                <span>Negative Marks : 0</span>
            </div>
         </div>
         <div className="flex items-center gap-6">
             <div className="bg-white/30 px-4 py-1.5 rounded text-sm font-bold border border-white/40 text-slate-900 shadow-sm">
                Time Remaining: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
             </div>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-[30%] bg-[#dcdcdc] border-r border-black/10 flex flex-col overflow-y-auto custom-scrollbar">
           <div className="p-8 space-y-8">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{activeProblem.title}</h2>
              
              <div className="bg-white/40 rounded-lg border border-black/5 p-4 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors">
                 <span className="text-xs font-bold text-slate-700">Instructions:</span>
                 <ChevronDown size={16} />
              </div>

              <div className="space-y-6">
                 <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Problem Statement:</h3>
                    <p className="text-sm text-slate-800 leading-relaxed font-semibold">{activeProblem.description}</p>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Input Format:</h3>
                    <p className="text-sm text-slate-700 font-bold">{activeProblem.inputFormat || 'NA'}</p>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Output Format:</h3>
                    <p className="text-sm text-slate-700 font-bold leading-relaxed">{activeProblem.outputFormat || 'NA'}</p>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Constraints:</h3>
                    <p className="text-sm text-slate-700 font-bold font-mono">{activeProblem.constraints || 'NA'}</p>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sample Input:</h3>
                    <div className="bg-white/20 p-2 rounded text-sm text-slate-700 font-bold">{activeProblem.testCases[0]?.input || 'NA'}</div>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sample Output:</h3>
                    <div className="bg-white/20 p-2 rounded text-sm text-slate-700 font-bold">{activeProblem.testCases[0]?.expectedOutput || 'NA'}</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Center Panel */}
        <div className="flex-1 bg-[#dcdcdc] flex flex-col p-6 gap-6 overflow-hidden">
           <div className="flex-1 bg-white border border-black/10 rounded-xl flex flex-col overflow-hidden shadow-xl relative">
              <div className="h-12 border-b border-black/5 flex items-center justify-between px-6 bg-[#f9fafb]">
                 <span className="text-xs font-bold text-slate-500">Enter your code here</span>
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Language</span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black border border-slate-200 text-slate-600">Python</span>
                 </div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                 <div className="w-12 bg-[#f3f4f6] border-r border-black/5 flex flex-col items-end pr-3 pt-6 text-[10px] font-bold text-slate-400 font-mono select-none">
                    {solutions[activeProblem.id].split('\n').map((_, i) => <div key={i} className="h-6 leading-6">{i + 1}</div>)}
                 </div>
                 <textarea 
                   value={solutions[activeProblem.id]}
                   onChange={(e) => handleCodeChange(e.target.value)}
                   className="flex-1 p-6 focus:outline-none font-mono text-sm leading-6 resize-none bg-white text-slate-800 custom-scrollbar"
                   spellCheck="false"
                 />
              </div>

              <div className="absolute bottom-6 right-6 flex gap-3">
                 <button onClick={runCodeOnly} disabled={isRunning} className="px-6 py-2.5 bg-slate-800 text-white rounded-full text-xs font-bold flex items-center gap-3 hover:bg-slate-700 shadow-2xl transition-all active:scale-95">
                    {isRunning ? <RotateCcw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />} Run Program
                 </button>
              </div>
           </div>

           <div className="h-[160px] bg-slate-50 border border-black/5 rounded-xl p-5 font-mono text-xs text-slate-600 overflow-y-auto custom-scrollbar shadow-inner relative">
              <div className="absolute top-2 right-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Standard Output / Test Status</div>
              {output ? (
                  <div className="whitespace-pre-wrap">{output}</div>
              ) : (
                  <div className="flex items-center gap-2 text-slate-300 italic">
                      <Terminal size={12}/> Console Ready...
                  </div>
              )}
              
              {showResultsOverlay && (
                <div className="mt-4 grid grid-cols-5 gap-2 border-t border-slate-200 pt-4">
                  {(testResults[activeProblem.id] || Array(5).fill(null)).map((res, i) => (
                    <div key={i} className={`p-2 rounded text-[10px] font-black flex items-center gap-2 border ${
                      res === null ? 'bg-slate-50 border-slate-100 text-slate-300' :
                      res.passed ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'
                    }`}>
                      {res === null ? <RotateCcw size={10} className="animate-spin"/> : res.passed ? <CheckCircle size={10}/> : <X size={10}/>}
                      CASE {i + 1}
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Right Panel */}
        <div className="w-[22%] bg-[#dcdcdc] border-l border-black/10 flex flex-col overflow-y-auto shrink-0">
           <div className="p-6 space-y-8">
              <div className="bg-white/40 rounded-xl p-5 border border-black/5 shadow-sm">
                 <div className="flex items-center justify-between mb-6 pb-2 border-b border-black/10">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Questions</h3>
                    <X size={16} className="text-slate-400 cursor-pointer" onClick={() => setShowResultsOverlay(false)} />
                 </div>
                 <div className="grid grid-cols-5 gap-3">
                    {examProblems.map((p, i) => (
                       <div 
                          key={i} 
                          onClick={() => { setCurrentIndex(i); setShowResultsOverlay(false); }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all shadow-sm ${
                             currentIndex === i ? 'ring-2 ring-slate-800 ring-offset-2 scale-110' : ''
                          } ${
                             status[p.id] === 'answered' ? 'bg-[#10b981] text-white' :
                             status[p.id] === 'review' ? 'bg-[#f59e0b] text-white' :
                             'bg-[#3b82f6] text-white'
                          }`}
                       >
                          {i + 1}
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white/40 rounded-xl overflow-hidden border border-black/5 shadow-sm">
                 <div className="bg-[#b4b4b4] py-2 text-center text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Summary</div>
                 <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3 text-xs font-bold">
                       <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
                       <span className="text-slate-600">Answered</span>
                       <span className="ml-auto">{getStatusSummary().answered}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold">
                       <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
                       <span className="text-slate-600">Not Answered</span>
                       <span className="ml-auto">{getStatusSummary().notAnswered}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold">
                       <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
                       <span className="text-slate-600">Marked for review</span>
                       <span className="ml-auto">{getStatusSummary().marked}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="h-20 bg-[#dcdcdc] border-t border-black/10 flex items-center justify-between px-10 shrink-0">
          <button className="text-[11px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2">
             <Flag size={14}/> Report Error
          </button>
          
          <div className="flex gap-4">
             <button onClick={handlePrevious} disabled={currentIndex === 0} className="px-8 py-3 bg-[#10b981] text-white rounded-full font-black text-xs uppercase hover:bg-[#059669] disabled:opacity-30">Previous</button>
             <button onClick={handleClear} className="px-8 py-3 bg-white border border-slate-300 text-slate-600 rounded-full font-black text-xs uppercase hover:bg-slate-50">Clear</button>
             <button onClick={handleMark} className="px-8 py-3 bg-[#f59e0b] text-white rounded-full font-black text-xs uppercase hover:bg-[#d97706]">Mark</button>
             
             {/* SUBMIT BUTTON - Run all test cases */}
             <button 
                onClick={handleSubmitQuestion} 
                disabled={isSubmittingQuestion}
                className="px-10 py-3 bg-[#14b8a6] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[#0d9488] transition-all flex items-center gap-2"
             >
                {isSubmittingQuestion ? <RotateCcw size={14} className="animate-spin" /> : <ShieldCheck size={16}/>}
                Submit
             </button>

             <button onClick={handleNext} disabled={currentIndex === examProblems.length - 1} className="px-8 py-3 bg-[#3b82f6] text-white rounded-full font-black text-xs uppercase hover:bg-[#2563eb] disabled:opacity-30">Next</button>
          </div>
          
          <button onClick={finalizeExam} className="px-10 py-3 bg-slate-900 text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all">
             End Test
          </button>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-lg overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-100">
                 <h3 className="text-lg font-bold text-slate-900">Warning / Alert</h3>
              </div>
              <div className="p-8">
                 <div className="text-sm text-slate-500 font-medium leading-relaxed space-y-3">
                    <p>You have moved out from the Current Exam window.</p>
                    <p>You are not allowed to Move out from Exam page.</p>
                    <p>If you continue to do like this your exam will be terminated.</p>
                    <p className="mt-6 text-slate-400 font-bold border-t border-slate-50 pt-4">Warning / Alert No.{warnings}</p>
                 </div>
              </div>
              <div className="p-4 bg-slate-50 flex justify-end">
                 <button onClick={() => setShowWarningModal(false)} className="text-xs font-black text-[#ff8c00] uppercase tracking-widest px-6 py-2.5 hover:bg-orange-50 rounded-lg">
                    Ok
                 </button>
              </div>
           </div>
        </div>
      )}

      {isSubmittingExam && (
         <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <div className="bg-white p-12 rounded-[40px] shadow-2xl flex flex-col items-center gap-6">
               <RotateCcw size={64} className="text-[#ff8c00] animate-spin" />
               <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.3em]">Processing Final Registry</h2>
            </div>
         </div>
      )}
    </div>
  );
};

export default CodeLab;
