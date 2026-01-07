
import React, { useState } from 'react';
import { AssessmentSummary, ProblemAnalysis } from '../types';
import { CheckCircle, Clock, Trophy, ShieldAlert, ArrowRight, RotateCcw, AlertCircle, XCircle, Code2, BookOpen, MinusCircle } from 'lucide-react';

interface AnalyticsViewProps {
  summary: AssessmentSummary;
  onRetry: () => void;
  onNext?: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ summary, onRetry, onNext }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<ProblemAnalysis | null>(null);
  
  // Stats
  const correctCount = summary.problemAnalyses.filter(p => p.status === 'CORRECT').length;
  const wrongCount = summary.problemAnalyses.filter(p => p.status === 'WRONG').length;
  const skippedCount = summary.problemAnalyses.filter(p => p.status === 'SKIPPED').length;
  const totalQuestions = summary.problemAnalyses.length;

  // Chart Logic
  const calculatePieDash = (count: number, total: number) => {
    if (total === 0) return '0 100';
    const percent = (count / total) * 100;
    return `${percent} ${100 - percent}`;
  };

  const pieData = [
     { label: 'Correct', value: correctCount, color: '#10b981', percent: (correctCount/totalQuestions)*100 },
     { label: 'Wrong', value: wrongCount, color: '#ef4444', percent: (wrongCount/totalQuestions)*100 },
     { label: 'Skipped', value: skippedCount, color: '#94a3b8', percent: (skippedCount/totalQuestions)*100 }
  ];

  let cumulativePercent = 0;

  return (
    <div className="h-full bg-[#f8fafc] overflow-y-auto p-4 md:p-12 animate-fade-in relative custom-scrollbar">
       <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                Certification Report
             </div>
             <h2 className="text-4xl md:text-5xl font-heading font-black text-brand-blue uppercase tracking-tighter">Final <span className="text-brand-cyan">Evaluation</span></h2>
             <p className="text-slate-500 font-medium text-xs md:text-sm">Registry ID: {summary.timestamp.getTime().toString(16).toUpperCase()}</p>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Final XP</span>
                <div className="text-3xl md:text-4xl font-black text-brand-blue">{summary.score} <span className="text-sm opacity-30">/ {summary.maxPoints}</span></div>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Accuracy</span>
                <div className="text-3xl md:text-4xl font-black text-brand-cyan">{Math.round((correctCount/totalQuestions)*100)}%</div>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Time Elapsed</span>
                <div className="text-xl md:text-2xl font-black text-slate-500 flex items-center gap-2 uppercase tracking-tighter"><Clock size={20}/> {summary.timeTaken}</div>
             </div>
             <div className={`bg-white p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow ${summary.warningsCount > 0 ? 'border-orange-200 bg-orange-50' : 'border-transparent'}`}>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Alerts</span>
                <div className={`text-xl md:text-2xl font-black flex items-center gap-2 ${summary.warningsCount > 0 ? 'text-brand-orange' : 'text-emerald-500'}`}>
                   <ShieldAlert size={24}/> {summary.warningsCount}
                </div>
             </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Pie Chart */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 w-full text-left">Performance Distribution</h3>
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                   <svg viewBox="0 0 32 32" className="transform -rotate-90 w-full h-full">
                      {pieData.map((slice, i) => {
                         const dash = (slice.percent / 100) * 100; // simplistic for 0-100 dasharray logic on r=16 (circumference approx 100 units is simplified here)
                         // Actual circumference of r=16 is 2*PI*16 ~= 100.5. Let's use 100 for simplicity or viewBox logic.
                         // Better: use specific math. C = 100.
                         const offset = 100 - cumulativePercent;
                         cumulativePercent += slice.percent;
                         return (
                            <circle 
                               key={i}
                               r="16" cx="16" cy="16" 
                               fill="transparent" 
                               stroke={slice.color} 
                               strokeWidth="8" // Thicker donut
                               strokeDasharray={`${slice.percent} 100`}
                               strokeDashoffset={- (cumulativePercent - slice.percent)}
                               className="transition-all duration-1000 ease-out"
                            />
                         );
                      })}
                      <circle r="16" cx="16" cy="16" fill="transparent" stroke="transparent" /> {/* Center hole is maintained by fill transparent and stroke width */}
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-800">{totalQuestions}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Qns</span>
                   </div>
                </div>
                <div className="flex gap-6 mt-8">
                   {pieData.map((slice, i) => (
                      <div key={i} className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }}></div>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{slice.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{slice.value}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Bar Chart: Test Cases Pass Rate */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Efficiency Analysis (Test Cases Passed)</h3>
                <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 px-2">
                   {summary.problemAnalyses.map((p, i) => {
                      const totalTests = p.testResults.length || 1; // avoid div 0
                      const passedTests = p.testResults.filter(r => r.passed).length;
                      const percentage = (passedTests / totalTests) * 100;
                      return (
                         <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            <div className="w-full bg-slate-100 rounded-t-xl relative overflow-hidden" style={{ height: '200px' }}>
                               <div 
                                  className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${p.status === 'CORRECT' ? 'bg-emerald-500' : p.status === 'WRONG' ? 'bg-red-400' : 'bg-slate-300'}`} 
                                  style={{ height: `${percentage}%` }}
                               ></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Q{i+1}</span>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-2 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                               {passedTests}/{totalTests} Cases
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>

          {/* Detailed List */}
          <div className="space-y-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Detailed Solution Registry</h3>
             <div className="flex flex-col gap-4">
                {summary.problemAnalyses.map((analysis, idx) => (
                   <div key={idx} className="bg-white p-4 md:p-6 rounded-[24px] border border-slate-200 hover:border-brand-cyan/30 transition-all shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                         <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            analysis.status === 'CORRECT' ? 'bg-emerald-100 text-emerald-600' : 
                            analysis.status === 'WRONG' ? 'bg-red-100 text-red-500' : 
                            'bg-slate-100 text-slate-400'
                         }`}>
                            {analysis.status === 'CORRECT' && <CheckCircle size={20}/>}
                            {analysis.status === 'WRONG' && <XCircle size={20}/>}
                            {analysis.status === 'SKIPPED' && <MinusCircle size={20}/>}
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-brand-blue uppercase tracking-tight">{analysis.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                               <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                  analysis.status === 'CORRECT' ? 'bg-emerald-50 text-emerald-600' : 
                                  analysis.status === 'WRONG' ? 'bg-red-50 text-red-500' : 
                                  'bg-slate-100 text-slate-500'
                               }`}>
                                  {analysis.status}
                               </span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{analysis.score} / {analysis.maxScore} XP</span>
                            </div>
                         </div>
                      </div>
                      
                      <button 
                         onClick={() => setSelectedAnalysis(analysis)}
                         className="w-full md:w-auto px-6 py-3 bg-slate-900 hover:bg-brand-cyan text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                         <BookOpen size={14}/> View Solution
                      </button>
                   </div>
                ))}
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 pb-20 pt-10">
             <button onClick={onRetry} className="w-full md:w-auto px-10 py-4 rounded-2xl border-2 border-slate-200 text-slate-400 hover:text-brand-blue hover:bg-white transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
               <RotateCcw size={18}/> Retake Set
             </button>
             <button onClick={onNext} className="w-full md:w-auto px-12 py-4 rounded-2xl btn-orange text-white shadow-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
               Terminate Portal <ArrowRight size={18}/>
             </button>
          </div>
       </div>

       {/* SOLUTION MODAL */}
       {selectedAnalysis && (
         <div className="fixed inset-0 z-[120] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fade-in">
            <div className="bg-white w-full max-w-5xl h-[90vh] md:h-[80vh] rounded-[40px] flex flex-col shadow-2xl overflow-hidden border-4 border-brand-cyan/20">
               {/* Modal Header */}
               <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="bg-brand-cyan p-3 rounded-2xl hidden md:block">
                        <Code2 className="text-white" size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl md:text-2xl font-black text-brand-blue uppercase tracking-tighter truncate max-w-[200px] md:max-w-none">{selectedAnalysis.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Reference Protocol</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedAnalysis(null)} className="p-2 md:p-4 text-slate-400 hover:text-brand-blue transition-colors">
                     <XCircle size={32} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-x divide-slate-100">
                  {/* Test Cases Panel */}
                  <div className="w-full md:w-80 overflow-y-auto p-6 md:p-8 bg-slate-50/50 custom-scrollbar border-b md:border-b-0 shrink-0 h-1/3 md:h-full">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Diagnostic Report</h4>
                     <div className="space-y-3">
                        {selectedAnalysis.testResults.length === 0 ? (
                            <div className="text-xs text-slate-400 italic">No diagnostics ran.</div>
                        ) : (
                            selectedAnalysis.testResults.map((res, i) => (
                            <div key={i} className={`p-4 rounded-2xl border flex items-center gap-3 ${res.passed ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                                {res.passed ? <CheckCircle size={14} className="shrink-0"/> : <XCircle size={14} className="shrink-0"/>}
                                <div className="min-w-0">
                                    <div className="text-[10px] font-black uppercase truncate">Test Case 0{i+1}</div>
                                    {!res.passed && <div className="text-[9px] opacity-70 truncate max-w-[150px]">Expected: {res.expectedOutput}</div>}
                                </div>
                            </div>
                            ))
                        )}
                     </div>
                  </div>

                  {/* Code Viewer */}
                  <div className="flex-1 bg-[#0b1120] p-6 md:p-8 overflow-y-auto custom-scrollbar relative">
                     <div className="absolute top-6 right-8 text-[10px] font-black text-brand-cyan/30 uppercase tracking-[0.4em] pointer-events-none">Official Reference</div>
                     
                     <div className="font-mono text-sm leading-relaxed">
                        <div className="text-slate-500 mb-2"># Reference Solution</div>
                        <pre className="text-cyan-50 whitespace-pre-wrap">
                            {selectedAnalysis.referenceCode || "// Solution unavailable."}
                        </pre>
                     </div>
                  </div>
               </div>
               
               <div className="p-4 md:p-6 bg-brand-blue text-center shrink-0">
                  <button onClick={() => setSelectedAnalysis(null)} className="w-full md:w-auto px-12 py-3 bg-white text-brand-blue rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-cyan hover:text-white transition-all">
                     Close Registry
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default AnalyticsView;
