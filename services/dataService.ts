
import { User, Problem, Difficulty, CommunityMessage, TestCase, GlobalSettings, CourseModule } from '../types';

const STORAGE_KEY = 'technexus_db_v8'; // Incremented version for schema change

const initialSettings: GlobalSettings = {
  tabSwitchLimit: 3,
  allowCopyPaste: false,
  standardTimeLimit: 5400 // 90 minutes exactly (1hr 30min)
};

const initialUsers: User[] = [
  { 
    id: 'admin-id', 
    name: 'Chief Examiner', 
    email: 'admin@technexus.edu', 
    role: 'ADMIN', 
    isPaid: true, 
    paymentStatus: 'APPROVED'
  },
  { 
    id: 'student-id', 
    name: 'Academic Candidate', 
    email: 'candidate@technexus.edu', 
    role: 'STUDENT', 
    isPaid: true, 
    plan: 'STUDENT', 
    paymentStatus: 'APPROVED', 
    score: 0, 
    completedProblems: [] 
  }
];

const pythonTopics = [
  // Basic Python Programming
  { id: 'py-io', title: 'Basic Input/Output', category: 'Basic Python Programming', desc: 'Print statements, input handling, and type casting.', icon: 'Terminal' },
  { id: 'py-cond', title: 'Conditional Statements', category: 'Basic Python Programming', desc: 'If, Else, Elif, and nested conditions.', icon: 'GitBranch' },
  { id: 'py-loop', title: 'Looping', category: 'Basic Python Programming', desc: 'For loops, While loops, break, continue, and pass.', icon: 'RotateCw' },
  { id: 'py-nums', title: 'Number Crunching', category: 'Basic Python Programming', desc: 'Math operations, number systems, and arithmetic logic.', icon: 'Calculator' },
  { id: 'py-pat', title: 'Patterns', category: 'Basic Python Programming', desc: 'Star patterns, number pyramids, and character grids.', icon: 'LayoutGrid' },
  { id: 'py-func', title: 'Functions', category: 'Basic Python Programming', desc: 'Def, arguments, return values, lambda, and recursion.', icon: 'FunctionSquare' },
  
  // Python Data Structures
  { id: 'py-list', title: 'Lists', category: 'Python Data Structures', desc: 'Indexing, slicing, list methods, and list comprehension.', icon: 'List' },
  { id: 'py-str', title: 'Strings', category: 'Python Data Structures', desc: 'String formatting, methods, slicing, and manipulation.', icon: 'Type' },
  { id: 'py-2d', title: '2D Lists', category: 'Python Data Structures', desc: 'Matrices, grid traversal, and nested list logic.', icon: 'Grid' },
  { id: 'py-tup', title: 'Tuples', category: 'Python Data Structures', desc: 'Immutable sequences and packing/unpacking.', icon: 'Brackets' },
  { id: 'py-set', title: 'Sets', category: 'Python Data Structures', desc: 'Unique collections, union, intersection, and difference.', icon: 'Circle' },
  { id: 'py-dict', title: 'Dictionaries', category: 'Python Data Structures', desc: 'Key-value pairs, get(), items(), and complex lookups.', icon: 'Book' },
  { id: 'py-arr', title: 'Arrays', category: 'Python Data Structures', desc: 'Low-level array manipulation and buffer logic.', icon: 'Columns' },

  // Advanced Python
  { id: 'py-bit', title: 'Bit Manipulation', category: 'Advanced Python', desc: 'AND, OR, XOR, shifts, and binary logic.', icon: 'Binary' }
];

const initialModules: CourseModule[] = [
  ...pythonTopics.map(t => ({
     id: t.id,
     title: t.title,
     language: 'Python',
     category: t.category,
     description: t.desc,
     icon: t.icon
  })),
  
  // Java Modules
  { id: 'java-core', title: 'Core Java Syntax', language: 'Java', category: 'Core Java', description: 'OOP Concepts and Syntax', icon: 'Coffee' },
  { id: 'java-adv', title: 'Streams & JVM', language: 'Java', category: 'Advanced Java', description: 'Streams, Concurrency, and JVM Internals', icon: 'Layers' },
  
  // C Modules
  { id: 'c-fund', title: 'Pointers & Memory', language: 'C', category: 'C Fundamentals', description: 'Pointers, Memory Management, and Structs', icon: 'Code' },
  
  // AI/ML Modules
  { id: 'ml-basic', title: 'Supervised Learning', language: 'Machine Learning', category: 'ML Basics', description: 'Regression, Classification, and Clustering', icon: 'BrainCircuit' },
  { id: 'ai-core', title: 'Neural Networks', language: 'Artificial Intelligence', category: 'AI Foundations', description: 'Neural Networks and Deep Learning', icon: 'Bot' }
];

const generateProblems = (): Problem[] => {
  const problems: Problem[] = [];
  const difficulties: Difficulty[] = ['L0', 'L1', 'L2'];
  
  // Generate 10 problems per difficulty for every Python module
  pythonTopics.forEach(topic => {
      difficulties.forEach(diff => {
          for(let i = 1; i <= 10; i++) {
             problems.push(createProblem(
                 'Python', 
                 `${topic.id}-${diff}-${i}`, 
                 diff, 
                 topic.title, 
                 i
             ));
          }
      });
  });

  // Generate basic placeholder problems for other languages
  const otherLangs = ['Java', 'C', 'Machine Learning', 'Artificial Intelligence'];
  otherLangs.forEach(lang => {
     // Just a few for demo purposes
     for(let i=1; i<=5; i++) {
        problems.push(createProblem(lang, `${lang.toLowerCase()}-${i}`, 'L0', lang === 'Java' ? 'Core Java Syntax' : lang === 'C' ? 'Pointers & Memory' : 'Supervised Learning', i));
     }
  });

  return problems;
};

const createProblem = (lang: string, id: string, diff: Difficulty, moduleName: string, index: number): Problem => ({
  id: id,
  title: `${moduleName}: Problem ${index}`,
  description: `Solve this ${diff === 'L0' ? 'basic' : diff === 'L1' ? 'intermediate' : 'advanced'} problem regarding ${moduleName}. \n\nTask: Implement a solution that satisfies the industrial requirements for this unit.`,
  language: lang,
  module: moduleName,
  difficulty: diff,
  points: diff === 'L0' ? 10 : diff === 'L1' ? 20 : 30,
  starterCode: getStarterCode(lang),
  testCases: [
    { input: '10', expectedOutput: '100', isHidden: false },
    { input: '5', expectedOutput: '25', isHidden: true }
  ]
});

const getStarterCode = (lang: string) => {
  switch(lang) {
    case 'Python': return 'def solve():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solve()';
    case 'Java': return 'public class Main {\n    public static void main(String[] args) {\n        // Code here\n    }\n}';
    case 'C': return '#include <stdio.h>\n\nint main() {\n    return 0;\n}';
    default: return '// Write your code here';
  }
}

interface AppData {
  users: User[];
  problems: Problem[];
  communityMessages: CommunityMessage[];
  settings: GlobalSettings;
  modules: CourseModule[];
}

const defaultState: AppData = {
  users: initialUsers,
  problems: generateProblems(),
  communityMessages: [],
  settings: initialSettings,
  modules: initialModules
};

const getState = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (!parsed.modules) parsed.modules = initialModules;
    // Migration: ensure modules have categories if old data exists
    parsed.modules = parsed.modules.map((m: any) => {
        if (!m.category) {
            // Attempt to recover category from initialModules
            const initial = initialModules.find(im => im.id === m.id);
            return { ...m, category: initial ? initial.category : 'General' };
        }
        return m;
    });
    return parsed;
  }
  return defaultState;
};

const saveState = (state: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const dataService = {
  getSettings: (): GlobalSettings => getState().settings,
  updateSettings: (newSettings: GlobalSettings) => {
    const state = getState();
    state.settings = newSettings;
    saveState(state);
  },
  getUsers: (): User[] => getState().users,
  getUserById: (id: string): User | undefined => getState().users.find(u => u.id === id),
  getPortalUser: (role: 'ADMIN' | 'STUDENT'): User => getState().users.find(u => u.role === role) || initialUsers[1],
  getProblems: (): Problem[] => getState().problems,
  getLanguages: () => ['Python', 'Machine Learning', 'Artificial Intelligence', 'Java', 'C'],
  
  // Module Management
  getModules: (): CourseModule[] => getState().modules,
  getModulesByLanguage: (lang: string): CourseModule[] => getState().modules.filter(m => m.language === lang),
  getModulesByCategory: (lang: string, category: string): CourseModule[] => getState().modules.filter(m => m.language === lang && m.category === category),
  
  // Helper to get unique categories for a language
  getCategoriesByLanguage: (lang: string): string[] => {
      const modules = getState().modules.filter(m => m.language === lang);
      return Array.from(new Set(modules.map(m => m.category)));
  },

  addModule: (module: CourseModule) => {
    const state = getState();
    state.modules.push(module);
    saveState(state);
  },
  updateModule: (updatedModule: CourseModule) => {
    const state = getState();
    const idx = state.modules.findIndex(m => m.id === updatedModule.id);
    if (idx !== -1) {
      state.modules[idx] = updatedModule;
      saveState(state);
    }
  },
  deleteModule: (moduleId: string) => {
     const state = getState();
     state.modules = state.modules.filter(m => m.id !== moduleId);
     saveState(state);
  },

  // Problem Management
  getProblemsByModule: (lang: string, modTitle: string) => getState().problems.filter(p => p.language === lang && p.module === modTitle),
  
  addProblem: (problem: Problem) => {
    const state = getState();
    state.problems.push(problem);
    saveState(state);
  },
  updateProblem: (updatedProblem: Problem) => {
    const state = getState();
    const idx = state.problems.findIndex(p => p.id === updatedProblem.id);
    if (idx !== -1) {
      state.problems[idx] = updatedProblem;
      saveState(state);
    }
  },
  deleteProblem: (problemId: string) => {
    const state = getState();
    state.problems = state.problems.filter(p => p.id !== problemId);
    saveState(state);
  },
  
  updateUserScore: (userId: string, sessionLabel: string, points: number) => {
    const state = getState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.completedProblems = [...(user.completedProblems || []), sessionLabel];
      user.score = (user.score || 0) + points;
      saveState(state);
    }
  },
  submitPaymentRequest: (userId: string, plan: 'STUDENT' | 'PROFESSIONAL') => {
    const state = getState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.paymentStatus = 'PENDING_APPROVAL';
      user.plan = plan;
      saveState(state);
      return user;
    }
    return undefined;
  },
  getCommunityMessages: () => getState().communityMessages,
  postCommunityMessage: (userId: string, userName: string, userRole: any, text: string) => {
    const state = getState();
    const msg = { id: Date.now().toString(), userId, userName, userRole, text, timestamp: new Date().toISOString() };
    state.communityMessages.push(msg);
    saveState(state);
  }
};
