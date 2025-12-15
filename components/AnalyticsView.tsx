import React from 'react';
import { AssessmentSummary } from '../types';
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, ArrowRight } from 'lucide-react';

interface AnalyticsViewProps {
  summary: AssessmentSummary;
  onRetry: () => void;
  onNext: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ summary, onRetry, onNext }) => {
  const percentage = Math.round((summary.passedTests / summary.totalTests) * 100);
  
  // Calculate stroke dash for circle progress
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="h-full animate-fade-in p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Assessment Analysis</h2>
          <p className="text-slate-400">Detailed breakdown of your solution performance.</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score Circle */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative">
            <h3 className="text-lg font-bold text-slate-300 mb-4">Total Score</h3>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-800"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`${percentage >= 70 ? 'text-emerald-500' : percentage >= 40 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{summary.score}</span>
                <span className="text-xs text-slate-400">POINTS</span>
              </div>
            </div>
            <div className="mt-4 text-sm font-medium text-slate-400">
               {percentage >= 70 ? 'Excellent Job!' : 'Keep Practicing!'}
            </div>
          </div>

          {/* Stats Stats */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                     <CheckCircle size={24} />
                   </div>
                   <div>
                     <div className="text-sm text-slate-400">Passed</div>
                     <div className="text-xl font-bold text-white">{summary.passedTests} Tests</div>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                     <XCircle size={24} />
                   </div>
                   <div>
                     <div className="text-sm text-slate-400">Failed</div>
                     <div className="text-xl font-bold text-white">{summary.totalTests - summary.passedTests} Tests</div>
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-300">
                   <Clock size={18} className="text-cyan-400" />
                   <span className="font-mono">Time: {summary.timeTaken}</span>
                </div>
             </div>
          </div>

           {/* Badge/Rank */}
           <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 animate-float">
               <Trophy size={40} className="text-white" />
             </div>
             <h3 className="text-xl font-bold text-white">
               {percentage === 100 ? 'Gold Badge' : percentage >= 70 ? 'Silver Badge' : 'Participant'}
             </h3>
             <p className="text-xs text-slate-400 mt-2">
               {percentage === 100 ? 'Perfect execution across all test cases.' : 'Complete all test cases to upgrade.'}
             </p>
           </div>
        </div>

        {/* Test Case List */}
        <div className="glass-panel rounded-2xl overflow-hidden">
           <div className="bg-[#0f172a] p-4 border-b border-slate-700 flex items-center justify-between">
             <h3 className="font-bold text-white">Test Case Verification</h3>
             <span className="text-xs text-slate-500">Hidden cases are used for final grading</span>
           </div>
           <div className="divide-y divide-slate-800/50">
             {summary.testResults.map((result, idx) => (
               <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${result.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {result.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Input</span>
                      <code className="bg-slate-900 px-2 py-1 rounded text-slate-300 block w-fit">
                        {result.isHidden ? '**** (Hidden)' : result.input}
                      </code>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Expected</span>
                      <code className="bg-slate-900 px-2 py-1 rounded text-emerald-400/80 block w-fit">
                        {result.isHidden ? '****' : result.expectedOutput}
                      </code>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Actual</span>
                      <code className={`bg-slate-900 px-2 py-1 rounded block w-fit ${result.passed ? 'text-slate-300' : 'text-red-400'}`}>
                         {result.actualOutput}
                      </code>
                    </div>
                  </div>
               </div>
             ))}
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <button 
            onClick={onRetry}
            className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-500 transition-all flex items-center gap-2 font-bold"
          >
            <RotateCcw size={18} />
            Retry Problem
          </button>
          <button 
            onClick={onNext}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 font-bold hover:scale-105"
          >
            Next Module
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsView;