
import React, { useState } from 'react';
import { AssessmentSummary, ProblemAnalysis } from '../types';
import { CheckCircle, Clock, Trophy, ShieldAlert, ArrowRight, RotateCcw, AlertCircle, XCircle, Code2, BookOpen } from 'lucide-react';

interface AnalyticsViewProps {
  summary: AssessmentSummary;
  onRetry: () => void;
  onNext?: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ summary, onRetry, onNext }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<ProblemAnalysis | null>(null);
  const passedPercentage = Math.round((summary.passedTests / summary.totalTests) * 100);

  return (
    <div className="h-full bg-[#f8fafc] overflow-y-auto p-12 animate-fade-in relative">
       <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                Certification Report
             </div>
             <h2 className="text-5xl font-heading font-black text-brand-blue uppercase tracking-tighter">Final <span className="text-brand-cyan">Evaluation</span></h2>
             <p className="text-slate-500 font-medium">Registry ID: {summary.timestamp.getTime().toString(16).toUpperCase()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="glass-card p-8 rounded-[32px] bg-white flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Final XP</span>
                <div className="text-4xl font-black text-brand-blue">{summary.score} <span className="text-sm opacity-30">/ {summary.maxPoints}</span></div>
             </div>

             <div className="glass-card p-8 rounded-[32px] bg-white flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Unit Success</span>
                <div className="text-4xl font-black text-brand-cyan">{passedPercentage}%</div>
             </div>

             <div className="glass-card p-8 rounded-[32px] bg-white flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Elapsed</span>
                <div className="text-xl font-black text-slate-500 flex items-center gap-2 uppercase tracking-tighter"><Clock size={16}/> {summary.timeTaken}</div>
             </div>

             <div className={`glass-card p-8 rounded-[32px] flex flex-col items-center justify-center text-center border-2 ${summary.warningsCount > 0 ? 'bg-orange-50 border-brand-orange/30' : 'bg-white border-transparent'}`}>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Security Signals</span>
                <div className={`text-xl font-black flex items-center gap-2 ${summary.warningsCount > 0 ? 'text-brand-orange' : 'text-emerald-500'}`}>
                   <ShieldAlert size={18}/> {summary.warningsCount} Flags
                </div>
             </div>
          </div>

          <div className="bg-brand-blue/5 border border-brand-blue/10 p-6 rounded-2xl flex items-start gap-4">
             <AlertCircle className="text-brand-blue shrink-0" size={20} />
             <div className="text-xs font-medium text-brand-blue leading-relaxed">
                <strong className="block uppercase tracking-widest mb-1">Grading Logic:</strong>
                XP is exclusively awarded for <span className="font-bold">100% verified solutions</span>. If any sub-test fails, the unit earns 0 XP. Reference codes are provided below for corrective study.
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Logic Registry Analysis</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.problemAnalyses.map((analysis, idx) => (
                   <div key={idx} className={`p-6 rounded-[24px] border transition-all ${analysis.isPerfect ? 'bg-cyan-50 border-brand-cyan/20' : 'bg-white border-slate-200'} hover:shadow-md`}>
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${analysis.isPerfect ? 'bg-brand-cyan text-white' : 'bg-red-100 text-red-500'}`}>
                               {analysis.isPerfect ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-brand-blue uppercase tracking-tight">{analysis.title}</h4>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{analysis.score} XP Earned</span>
                            </div>
                         </div>
                         <button 
                            onClick={() => setSelectedAnalysis(analysis)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-brand-blue/5 hover:bg-brand-blue hover:text-white text-brand-blue rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                         >
                            <BookOpen size={12}/> View Protocol
                         </button>
                      </div>
                      {!analysis.isPerfect && (
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-11">
                           Logic Mismatch Detected in {analysis.testResults.length - analysis.testResults.filter(r => r.passed).length} Units
                        </p>
                      )}
                   </div>
                ))}
             </div>
          </div>

          <div className="flex justify-center gap-6 pb-20">
             <button onClick={onRetry} className="px-10 py-4 rounded-2xl border-2 border-slate-200 text-slate-400 hover:text-brand-blue hover:bg-white transition-all font-black text-xs uppercase tracking-widest flex items-center gap-3">
               <RotateCcw size={18}/> Retake Set
             </button>
             <button onClick={onNext} className="px-12 py-4 rounded-2xl btn-orange text-white shadow-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
               Terminate Portal <ArrowRight size={18}/>
             </button>
          </div>
       </div>

       {/* Correction Modal */}
       {selectedAnalysis && (
         <div className="fixed inset-0 z-[120] bg-brand-blue/95 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[40px] flex flex-col shadow-2xl overflow-hidden border-4 border-brand-cyan/20">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-4">
                     <div className="bg-brand-cyan p-3 rounded-2xl">
                        <Code2 className="text-white" size={24} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-brand-blue uppercase tracking-tighter">Master Protocol</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimized Solution for {selectedAnalysis.title}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedAnalysis(null)} className="p-4 text-slate-400 hover:text-brand-blue transition-colors">
                     <XCircle size={32} />
                  </button>
               </div>
               
               <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-x divide-slate-100">
                  {/* Test Cases Check */}
                  <div className="w-80 overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Sub-Unit Results</h4>
                     <div className="space-y-3">
                        {selectedAnalysis.testResults.map((res, i) => (
                           <div key={i} className={`p-4 rounded-2xl border flex items-center gap-3 ${res.passed ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
                              {res.passed ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                              <span className="text-[10px] font-black uppercase">Unit 0{i+1} {res.passed ? 'OK' : 'FAIL'}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Reference Code Display */}
                  <div className="flex-1 bg-[#0b1120] p-8 overflow-y-auto custom-scrollbar relative">
                     <div className="absolute top-8 right-8 text-[10px] font-black text-brand-cyan/30 uppercase tracking-[0.4em]">Official Reference</div>
                     <pre className="font-mono text-sm text-cyan-50 whitespace-pre-wrap leading-relaxed">
                        {selectedAnalysis.referenceCode || "// No correction data available."}
                     </pre>
                  </div>
               </div>
               
               <div className="p-6 bg-brand-blue text-center">
                  <button onClick={() => setSelectedAnalysis(null)} className="px-12 py-3 bg-white text-brand-blue rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-cyan hover:text-white transition-all">
                     Return to Report
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default AnalyticsView;
