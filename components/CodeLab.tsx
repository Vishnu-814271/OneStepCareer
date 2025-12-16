import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle, Terminal, Code2, Layers, Folder, ChevronRight, FileCode, ArrowLeft, Send, PlayCircle, Keyboard, Cpu, Layout, Settings } from 'lucide-react';
import { runCodeSimulation, validateSolution } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { Problem, Difficulty, AssessmentSummary, User } from '../types';
import AnalyticsView from './AnalyticsView';

interface CodeLabProps {
  initialProblem?: Problem;
  onExit?: () => void;
  isAssessmentMode?: boolean;
  currentUser?: User; // Needed to update scores
}

const CodeLab: React.FC<CodeLabProps> = ({ initialProblem, onExit, isAssessmentMode = false, currentUser }) => {
  const [viewState, setViewState] = useState<'languages' | 'levels' | 'problems' | 'editor' | 'analysis'>('languages');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>('L0');
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customInput, setCustomInput] = useState(''); 
  const [activeTab, setActiveTab] = useState<'output' | 'input'>('output');
  
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  // Initialize
  useEffect(() => {
    setLanguages(dataService.getLanguages());
    setProblems(dataService.getProblems());

    if (initialProblem) {
      setActiveProblem(initialProblem);
      setCode(initialProblem.starterCode);
      setViewState('editor');
      setSelectedLanguage(initialProblem.language);
      setSelectedLevel(initialProblem.difficulty);
    }
  }, [initialProblem]);

  // Run with Custom Input
  const handleRun = async () => {
    if (!activeProblem) return;
    setIsRunning(true);
    setActiveTab('output');
    setOutput('Compiling and executing...');
    
    // Auto-Input Logic: If user didn't provide custom input, grab the first test case
    let inputToUse = customInput;
    if (!inputToUse && activeProblem.testCases && activeProblem.testCases.length > 0) {
       inputToUse = activeProblem.testCases[0].input;
       // We don't overwrite customInput state so the box remains clean, but we show a log msg
       setOutput(`(Using Input from Test Case 1: ${inputToUse})\n...\n`);
    }

    const result = await runCodeSimulation(code, activeProblem.language, inputToUse);
    
    // Append result to the output
    setOutput((prev) => (prev === 'Compiling and executing...' ? '' : prev) + result);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    if (!activeProblem) return;
    setIsSubmitting(true);
    setActiveTab('output');
    setOutput('Validating solution against all test cases...');

    const startTime = Date.now();
    const results = await validateSolution(code, activeProblem.language, activeProblem.testCases || []);
    const endTime = Date.now();

    // STRICT SCORING LOGIC: If ANY test fails, score is 0.
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const allPassed = passedCount === totalCount && totalCount > 0;
    
    // Calculate points
    const maxPoints = activeProblem.points || 0;
    const awardedPoints = allPassed ? maxPoints : 0;
    
    // Format duration
    const seconds = Math.floor((endTime - startTime) / 1000);
    const timeTaken = `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

    // Persist Score if User is present and passed
    if (allPassed && currentUser) {
      dataService.updateUserScore(currentUser.id, activeProblem.id, awardedPoints);
    }

    setAssessmentSummary({
      problemId: activeProblem.id,
      score: awardedPoints,
      maxPoints: maxPoints,
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
    setOutput('// Console cleared. Ready for next run.');
  };

  const Breadcrumbs = () => (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6 p-2 rounded-lg w-fit">
      <button 
        onClick={() => {
           if(onExit) onExit();
           else setViewState('languages');
        }} 
        className="hover:text-white transition-colors"
      >
        {isAssessmentMode ? 'ACADEMY' : 'LABS'}
      </button>
      
      {!initialProblem && viewState !== 'languages' && (
        <>
          <ChevronRight size={12} className="opacity-50" />
          <button onClick={() => setViewState('levels')} className={`hover:text-white transition-colors uppercase ${viewState === 'levels' ? 'text-cyan-400' : ''}`}>{selectedLanguage}</button>
        </>
      )}
      
      {activeProblem && (
        <>
           <ChevronRight size={12} className="opacity-50" />
           <span className="text-cyan-400 uppercase truncate max-w-[200px]">{activeProblem.title}</span>
        </>
      )}
    </div>
  );

  // --- RENDER STATES ---

  if (viewState === 'analysis' && assessmentSummary) {
    return (
      <div className="h-full flex flex-col bg-[#0b1120]">
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

  // Standard Lab Navigation 
  if (viewState === 'languages' && !isAssessmentMode) {
    return (
      <div className="animate-fade-in p-6">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white tracking-tight">
            <Layout className="text-cyan-500" /> 
            Select Language Track
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {languages.map(lang => (
            <div 
              key={lang}
              onClick={() => { setSelectedLanguage(lang); setViewState('levels'); }}
              className="group relative bg-[#1e293b]/50 border border-slate-700/50 hover:border-cyan-500/50 p-8 rounded-xl cursor-pointer transition-all duration-300 hover:bg-[#1e293b] hover:shadow-2xl hover:shadow-cyan-900/10"
            >
              <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-cyan-500/30">
                 <Terminal size={28} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{lang}</h3>
              <p className="text-slate-500 text-xs font-mono">{problems.filter(p => p.language === lang).length} Problems Available</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewState === 'levels' && !isAssessmentMode) {
     return (
       <div className="animate-fade-in p-6">
         <Breadcrumbs />
         <h2 className="text-2xl font-bold mb-8 text-white tracking-tight">Select Difficulty</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {['L0', 'L1', 'L2'].map((level) => (
             <div 
               key={level}
               onClick={() => { setSelectedLevel(level as Difficulty); setViewState('problems'); }}
               className="group bg-[#1e293b]/50 border border-slate-700/50 hover:border-cyan-500/40 p-6 rounded-xl cursor-pointer transition-all hover:translate-x-1 hover:bg-[#1e293b]"
             >
                <div className="flex items-center justify-between mb-4">
                   <span className={`text-4xl font-black ${
                     level === 'L0' ? 'text-emerald-500/20 group-hover:text-emerald-400' :
                     level === 'L1' ? 'text-blue-500/20 group-hover:text-blue-400' :
                     'text-orange-500/20 group-hover:text-orange-400'
                   } transition-colors`}>{level}</span>
                   <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {level === 'L0' ? 'Beginner' :
                   level === 'L1' ? 'Intermediate' :
                   'Advanced'}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${
                     level === 'L0' ? 'bg-emerald-500' :
                     level === 'L1' ? 'bg-blue-500' :
                     'bg-orange-500'
                  }`}></span>
                  {level === 'L0' ? '8 Points' : level === 'L1' ? '9 Points' : '10 Points'}
                </div>
             </div>
           ))}
         </div>
       </div>
     );
  }
  
  if (viewState === 'problems' && !isAssessmentMode) {
    const filteredProblems = problems.filter(p => p.language === selectedLanguage && p.difficulty === selectedLevel);
    return (
      <div className="animate-fade-in p-6">
        <Breadcrumbs />
        <h2 className="text-2xl font-bold mb-8 text-white tracking-tight flex items-center gap-3">
           <Folder className="text-slate-500" size={24}/>
           {selectedLanguage} <span className="text-slate-600">/</span> {selectedLevel}
        </h2>
        {filteredProblems.length === 0 ? (
          <div className="text-center py-20 bg-[#1e293b]/30 rounded-xl border border-dashed border-slate-800">
            <Code2 size={48} className="mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500 text-sm">No problems found in this directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
             {filteredProblems.map((prob, idx) => (
               <div 
                 key={prob.id} 
                 onClick={() => { setActiveProblem(prob); setCode(prob.starterCode); setOutput(''); setViewState('editor'); }}
                 className="flex items-center justify-between p-4 bg-[#1e293b]/50 border border-slate-700/50 rounded-lg hover:border-cyan-500/40 cursor-pointer transition-all hover:bg-[#1e293b] group"
               >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-slate-600 text-xs w-6 text-right">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{prob.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{prob.module || 'General'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-xs text-slate-500 font-mono">{prob.points} pts</span>
                     <ChevronRight size={16} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    );
  }

  // EDITOR VIEW
  return (
    <div className="h-full flex flex-col animate-fade-in bg-[#0b1120]">
      <div className="px-6 pt-4">
        <Breadcrumbs />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-px bg-slate-800 overflow-hidden">
        
        {/* LEFT PANEL: Problem Description */}
        <div className="w-full md:w-[350px] bg-[#0b1120] flex flex-col border-r border-slate-800 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <h3 className="text-xl font-bold text-white mb-4 leading-tight">{activeProblem?.title}</h3>
            
            <div className="flex flex-wrap gap-2 mb-6">
               <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[10px] font-bold uppercase tracking-wider">{activeProblem?.language}</span>
               <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-wider">{activeProblem?.difficulty}</span>
               <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px] font-bold uppercase tracking-wider">{activeProblem?.points} Pts</span>
            </div>
            
            <div className="prose prose-invert prose-sm max-w-none text-slate-400 mb-8">
              <p>{activeProblem?.description}</p>
            </div>

            <div className="bg-[#161f2e] rounded-lg border border-slate-800 overflow-hidden">
               <div className="bg-[#1e293b] px-3 py-2 border-b border-slate-800 flex items-center gap-2">
                 <Cpu size={14} className="text-slate-400" />
                 <span className="text-xs font-bold text-slate-300 uppercase">Example Case</span>
               </div>
               {activeProblem?.testCases?.filter(tc => !tc.isHidden).slice(0, 1).map((tc, i) => (
                 <div key={i} className="p-3 space-y-3">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Input</div>
                      <code className="block bg-[#0b1120] p-2 rounded text-xs font-mono text-cyan-300">{tc.input || '(No Input)'}</code>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Output</div>
                      <code className="block bg-[#0b1120] p-2 rounded text-xs font-mono text-emerald-300">{tc.expectedOutput}</code>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
            <button 
               onClick={() => {
                  if(onExit) onExit();
                  else setViewState('problems');
               }}
               className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
            >
               <ArrowLeft size={16} />
               Back to List
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Editor & Terminal */}
        <div className="flex-1 flex flex-col bg-[#0b1120] min-w-0">
          
          {/* Toolbar */}
          <div className="h-12 bg-[#161f2e] border-b border-slate-800 flex items-center justify-between px-4 select-none">
             <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <FileCode size={14} className="text-cyan-500" />
                <span>main.{activeProblem?.language.toLowerCase().substring(0,2)}</span>
             </div>

             <div className="flex items-center gap-2">
                <button 
                   onClick={() => setCode(activeProblem?.starterCode || '')}
                   className="p-1.5 text-slate-500 hover:text-white transition-colors rounded hover:bg-slate-700" 
                   title="Reset Code"
                >
                   <RotateCcw size={14} />
                </button>
                <div className="h-4 w-px bg-slate-700 mx-2"></div>
                <button 
                   onClick={handleRun}
                   disabled={isRunning || isSubmitting}
                   className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white border border-emerald-600/20 rounded text-xs font-bold transition-all disabled:opacity-50"
                >
                   {isRunning ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <PlayCircle size={14} />}
                   RUN
                </button>
                <button 
                   onClick={handleSubmit}
                   disabled={isRunning || isSubmitting}
                   className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white hover:bg-cyan-500 rounded text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                   {isSubmitting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Send size={14} />}
                   SUBMIT
                </button>
             </div>
          </div>

          {/* Monaco-like Editor Area */}
          <div className="flex-1 relative bg-[#0b1120] font-mono text-sm group">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0b1120] border-r border-slate-800 text-slate-600 text-right pr-3 pt-4 select-none text-xs leading-6">
              {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-slate-300 p-4 pl-16 resize-none focus:outline-none leading-6 custom-scrollbar selection:bg-cyan-500/30"
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>

          {/* Terminal / Output Panel */}
          <div className="h-1/3 min-h-[150px] bg-[#0f172a] border-t border-slate-800 flex flex-col">
             {/* Terminal Tabs */}
             <div className="flex border-b border-slate-800 bg-[#0b1120]">
                <button 
                   onClick={() => setActiveTab('output')}
                   className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-r border-slate-800 transition-colors ${activeTab === 'output' ? 'bg-[#0f172a] text-white border-t-2 border-t-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                   <Terminal size={12} /> OUTPUT
                </button>
                <button 
                   onClick={() => setActiveTab('input')}
                   className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-r border-slate-800 transition-colors ${activeTab === 'input' ? 'bg-[#0f172a] text-white border-t-2 border-t-cyan-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                   <Keyboard size={12} /> CUSTOM INPUT
                </button>
             </div>

             {/* Terminal Content */}
             <div className="flex-1 p-4 overflow-auto font-mono text-xs custom-scrollbar">
                {activeTab === 'input' ? (
                   <textarea 
                     className="w-full h-full bg-transparent text-slate-300 focus:outline-none resize-none placeholder:text-slate-700"
                     placeholder="Enter input values here (e.g. for Python input() or Java Scanner). Place each value on a new line."
                     value={customInput}
                     onChange={(e) => setCustomInput(e.target.value)}
                   />
                ) : (
                   output ? (
                     <pre className="whitespace-pre-wrap text-emerald-400 font-medium leading-relaxed">{output}</pre>
                   ) : (
                     <div className="text-slate-600 flex flex-col gap-1 select-none">
                        <span>TechNexus Console [Version 1.0.0]</span>
                        <span>Ready to compile...</span>
                        <br/>
                        <span className="text-slate-700 italic">// Tip: Use 'Custom Input' tab to provide stdin values before clicking Run.</span>
                     </div>
                   )
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CodeLab;