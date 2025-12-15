import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle, Terminal, Code2, Layers, Folder, ChevronRight, FileCode, ArrowLeft, Send, PlayCircle } from 'lucide-react';
import { runCodeSimulation, validateSolution } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { Problem, Difficulty, AssessmentSummary } from '../types';
import AnalyticsView from './AnalyticsView';

interface CodeLabProps {
  initialProblem?: Problem;
  onExit?: () => void;
  isAssessmentMode?: boolean;
}

const CodeLab: React.FC<CodeLabProps> = ({ initialProblem, onExit, isAssessmentMode = false }) => {
  const [viewState, setViewState] = useState<'languages' | 'levels' | 'problems' | 'editor' | 'analysis'>('languages');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>('L0');
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);
  
  const [languages, setLanguages] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  // Initialize
  useEffect(() => {
    setLanguages(dataService.getLanguages());
    setProblems(dataService.getProblems());

    // If passed a problem via props (from Academy flow), open it immediately
    if (initialProblem) {
      setActiveProblem(initialProblem);
      setCode(initialProblem.starterCode);
      setViewState('editor');
      // Set language/level based on problem for breadcrumbs
      setSelectedLanguage(initialProblem.language);
      setSelectedLevel(initialProblem.difficulty);
    }
  }, [initialProblem]);

  const handleRun = async () => {
    if (!activeProblem) return;
    setIsRunning(true);
    setOutput('Compiling and executing...');
    const result = await runCodeSimulation(code, activeProblem.language, activeProblem.description);
    setOutput(result);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!activeProblem) return;
    setIsSubmitting(true);
    setOutput('Validating solution against all test cases...');

    const startTime = Date.now();
    const results = await validateSolution(code, activeProblem.language, activeProblem.testCases || []);
    const endTime = Date.now();

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
    
    // Format duration
    const seconds = Math.floor((endTime - startTime) / 1000);
    const timeTaken = `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

    setAssessmentSummary({
      problemId: activeProblem.id,
      score,
      totalTests: totalCount,
      passedTests: passedCount,
      testResults: results,
      timeTaken,
      timestamp: new Date()
    });

    setIsSubmitting(false);
    setViewState('analysis');
  };

  const handleRetry = () => {
    setViewState('editor');
    setOutput('Previous submission analyzed. You can now modify your code.');
  };

  // Breadcrumb navigation component
  const Breadcrumbs = () => (
    <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 bg-slate-900/40 p-2 px-4 rounded-lg border border-slate-800/50 backdrop-blur-sm w-fit">
      <button 
        onClick={() => {
           if(onExit) onExit();
           else setViewState('languages');
        }} 
        className="hover:text-cyan-400 transition-colors"
      >
        {isAssessmentMode ? 'Academy' : 'Labs'}
      </button>
      
      {!initialProblem && viewState !== 'languages' && (
        <>
          <ChevronRight size={14} className="opacity-50" />
          <button onClick={() => setViewState('levels')} className={`hover:text-cyan-400 transition-colors ${viewState === 'levels' ? 'text-white font-bold' : ''}`}>{selectedLanguage}</button>
        </>
      )}
      
      {activeProblem && (
        <>
           <ChevronRight size={14} className="opacity-50" />
           <span className="text-white font-bold">{activeProblem.title}</span>
        </>
      )}
    </div>
  );

  // --- RENDER STATES ---

  if (viewState === 'analysis' && assessmentSummary) {
    return (
      <div className="h-full flex flex-col">
         {isAssessmentMode && <Breadcrumbs />}
         <AnalyticsView 
            summary={assessmentSummary} 
            onRetry={handleRetry} 
            onNext={() => {
               if(onExit) onExit();
               else setViewState('languages');
            }} 
         />
      </div>
    );
  }

  // Standard Lab Navigation (Only if not in direct assessment mode)
  if (viewState === 'languages' && !isAssessmentMode) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white">
            <Layers className="text-cyan-500" /> 
            Select Language Module
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {languages.map(lang => (
            <div 
              key={lang}
              onClick={() => { setSelectedLanguage(lang); setViewState('levels'); }}
              className="group relative bg-[#0f172a]/60 border border-slate-800 hover:border-cyan-500/50 p-8 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/20 backdrop-blur-md"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700/50 group-hover:border-cyan-500/30">
                 <Folder size={32} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{lang}</h3>
              <p className="text-slate-400 text-sm font-medium">{problems.filter(p => p.language === lang).length} Problems</p>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                <div className="h-full bg-cyan-500 w-0 group-hover:w-full transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewState === 'levels' && !isAssessmentMode) {
     return (
       <div className="animate-fade-in">
         <Breadcrumbs />
         <h2 className="text-3xl font-bold mb-8 text-white">Select Difficulty Level</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {['L0', 'L1', 'L2', 'L3'].map((level) => (
             <div 
               key={level}
               onClick={() => { setSelectedLevel(level as Difficulty); setViewState('problems'); }}
               className="group bg-[#0f172a]/60 border border-slate-800 hover:border-cyan-500/40 p-8 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:bg-[#1e293b]/50 backdrop-blur-md"
             >
                <div className="flex items-center justify-between mb-6">
                   <span className={`text-3xl font-black ${
                     level === 'L0' ? 'text-emerald-400' :
                     level === 'L1' ? 'text-blue-400' :
                     level === 'L2' ? 'text-orange-400' :
                     'text-red-400'
                   }`}>{level}</span>
                   <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-slate-800 transition-colors border border-slate-800">
                     <Code2 size={24} className="text-slate-400 group-hover:text-white" />
                   </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {level === 'L0' ? 'Beginner' :
                   level === 'L1' ? 'Intermediate' :
                   level === 'L2' ? 'Advanced' :
                   'Expert'}
                </h3>
                <p className="text-slate-500 text-sm">
                  {problems.filter(p => p.language === selectedLanguage && p.difficulty === level).length} Challenges
                </p>
             </div>
           ))}
         </div>
       </div>
     );
  }
  
  if (viewState === 'problems' && !isAssessmentMode) {
    const filteredProblems = problems.filter(p => p.language === selectedLanguage && p.difficulty === selectedLevel);
    return (
      <div className="animate-fade-in">
        <Breadcrumbs />
        <h2 className="text-3xl font-bold mb-8 text-white"><span className="text-cyan-400">{selectedLanguage}</span> - {selectedLevel} Challenges</h2>
        {filteredProblems.length === 0 ? (
          <div className="text-center py-20 bg-[#0f172a]/40 rounded-2xl border border-dashed border-slate-800">
            <Code2 size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-500 text-lg">No problems found in this folder yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
             {filteredProblems.map(prob => (
               <div 
                 key={prob.id} 
                 onClick={() => { setActiveProblem(prob); setCode(prob.starterCode); setOutput(''); setViewState('editor'); }}
                 className="flex items-center justify-between p-6 bg-[#0f172a]/60 border border-slate-800 rounded-xl hover:border-cyan-500/40 cursor-pointer transition-all hover:bg-[#1e293b]/40 hover:shadow-lg group"
               >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-cyan-500 font-bold border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                      {prob.language[0]}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{prob.title}</h4>
                      <p className="text-sm text-slate-400 line-clamp-1">{prob.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
               </div>
             ))}
          </div>
        )}
      </div>
    );
  }

  // EDITOR VIEW
  return (
    <div className="h-full flex flex-col animate-fade-in pb-20 md:pb-0">
      <Breadcrumbs />
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-[500px]">
        {/* Sidebar: Problem Info */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex-1 overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-3">{activeProblem?.title}</h3>
            <div className="flex gap-2 mb-5">
               <span className="px-2.5 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-500/20 rounded text-xs font-bold">{activeProblem?.language}</span>
               <span className="px-2.5 py-1 bg-violet-900/30 text-violet-300 border border-violet-500/20 rounded text-xs font-bold">{activeProblem?.difficulty}</span>
               {isAssessmentMode && <span className="px-2.5 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-500/20 rounded text-xs font-bold">Assessment</span>}
            </div>
            
            <div className="text-sm text-slate-300 leading-relaxed border-t border-slate-700/50 pt-4 mb-4">
              {activeProblem?.description}
            </div>

            {/* Public Test Cases Display */}
            <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Sample Test Case</h4>
               {activeProblem?.testCases?.filter(tc => !tc.isHidden).slice(0, 1).map((tc, i) => (
                 <div key={i} className="text-xs font-mono">
                    <div className="mb-1 text-slate-400">Input: <span className="text-white bg-slate-800 px-1 rounded">{tc.input.replace('\n', '\\n')}</span></div>
                    <div className="text-slate-400">Output: <span className="text-emerald-400 bg-slate-800 px-1 rounded">{tc.expectedOutput}</span></div>
                 </div>
               ))}
            </div>
          </div>
          
          <button 
             onClick={() => {
                if(onExit) onExit();
                else setViewState('problems');
             }}
             className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
             <ArrowLeft size={16} />
             {isAssessmentMode ? 'Exit Assessment' : 'Back to List'}
          </button>
        </div>

        {/* Main Area: Editor & Terminal */}
        <div className="flex-1 flex flex-col shadow-2xl rounded-xl overflow-hidden border border-slate-800">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0a101f] border-b border-slate-800 p-3 gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#050b14] rounded border border-slate-800 text-slate-400 text-sm">
               <FileCode size={14} className="text-cyan-500" />
               <span className="font-mono">solution.{activeProblem?.language.toLowerCase().substring(0,3)}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setCode(activeProblem?.starterCode || '')}
                className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded"
                title="Reset Code"
              >
                <RotateCcw size={18} />
              </button>
              
              <button 
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-sm transition-all flex items-center gap-2 border border-slate-700 disabled:opacity-50"
              >
                 {isRunning ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div> : <PlayCircle size={16} />}
                 Run
              </button>

              <button 
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <Send size={16} fill="currentColor" />
                    Submit & Analyse
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 relative bg-[#050b14] font-mono text-sm group min-h-[300px]">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#0a101f] border-r border-slate-800/50 text-slate-600 text-right pr-2 pt-4 select-none">
              {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-slate-300 p-4 pl-12 resize-none focus:outline-none leading-relaxed"
              spellCheck="false"
            />
          </div>

          {/* Terminal/Output */}
          <div className="h-48 bg-[#0a101f] border-t border-slate-800 flex flex-col">
            <div className="px-4 py-2 bg-[#050b14] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Terminal size={14} />
                Console Output
              </div>
              {output && !isRunning && !isSubmitting && (
                <span className="text-xs text-emerald-500 flex items-center gap-1">
                  <CheckCircle size={12} /> Process Finished
                </span>
              )}
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-auto">
              {output ? (
                <pre className="whitespace-pre-wrap text-emerald-400/90 leading-relaxed">{output}</pre>
              ) : (
                <div className="text-slate-600 italic flex flex-col gap-1">
                  <span>// Ready to compile and execute...</span>
                  <span>// Click "Submit & Analyse" to run against all test cases.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeLab;