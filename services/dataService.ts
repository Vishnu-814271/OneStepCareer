
import { User, Problem, Difficulty, CommunityMessage, TestCase, GlobalSettings, CourseModule, ProjectDefinition } from '../types';

const STORAGE_KEY = 'technexus_db_v10'; // Incremented version

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
    completedProblems: [],
    completedGrandTests: [],
    unlockedProjects: []
  }
];

// --- TOPIC DEFINITIONS ---
// (Keeping existing topic definitions abbreviated for brevity, assuming they exist as before)
const pythonTopics = [
  { id: 'py-io', title: 'Basic Input/Output', category: 'Basic Python Programming', desc: 'Print statements, input handling, and type casting.', icon: 'Terminal' },
  { id: 'py-cond', title: 'Conditional Statements', category: 'Basic Python Programming', desc: 'If, Else, Elif, and nested conditions.', icon: 'GitBranch' },
  { id: 'py-loop', title: 'Looping', category: 'Basic Python Programming', desc: 'For loops, While loops, break, continue, and pass.', icon: 'RotateCw' },
  { id: 'py-nums', title: 'Number Crunching', category: 'Basic Python Programming', desc: 'Math operations, number systems, and arithmetic logic.', icon: 'Calculator' },
  { id: 'py-pat', title: 'Patterns', category: 'Basic Python Programming', desc: 'Star patterns, number pyramids, and character grids.', icon: 'LayoutGrid' },
  { id: 'py-func', title: 'Functions', category: 'Basic Python Programming', desc: 'Def, arguments, return values, lambda, and recursion.', icon: 'FunctionSquare' },
  { id: 'py-list', title: 'Lists', category: 'Python Data Structures', desc: 'Indexing, slicing, list methods, and list comprehension.', icon: 'List' },
  { id: 'py-str', title: 'Strings', category: 'Python Data Structures', desc: 'String formatting, methods, slicing, and manipulation.', icon: 'Type' },
  { id: 'py-2d', title: '2D Lists', category: 'Python Data Structures', desc: 'Matrices, grid traversal, and nested list logic.', icon: 'Grid' },
  { id: 'py-tup', title: 'Tuples', category: 'Python Data Structures', desc: 'Immutable sequences and packing/unpacking.', icon: 'Brackets' },
  { id: 'py-set', title: 'Sets', category: 'Python Data Structures', desc: 'Unique collections, union, intersection, and difference.', icon: 'Circle' },
  { id: 'py-dict', title: 'Dictionaries', category: 'Python Data Structures', desc: 'Key-value pairs, get(), items(), and complex lookups.', icon: 'Book' },
  { id: 'py-arr', title: 'Arrays', category: 'Python Data Structures', desc: 'Low-level array manipulation and buffer logic.', icon: 'Columns' },
  { id: 'py-bit', title: 'Bit Manipulation', category: 'Advanced Python', desc: 'AND, OR, XOR, shifts, and binary logic.', icon: 'Binary' }
];

const javaTopics = [
  { id: 'java-intro', title: 'Java Basics', category: 'Core Java', desc: 'JVM architecture, variables, and data types.', icon: 'Coffee' },
  { id: 'java-oop', title: 'OOP Concepts', category: 'Core Java', desc: 'Classes, Objects, Inheritance, Polymorphism.', icon: 'Box' },
  { id: 'java-str', title: 'String Handling', category: 'Core Java', desc: 'String, StringBuilder, and StringPool.', icon: 'Type' },
  { id: 'java-exc', title: 'Exception Handling', category: 'Core Java', desc: 'Try-catch, throw, throws, and custom exceptions.', icon: 'AlertTriangle' },
  { id: 'java-coll', title: 'Collections Framework', category: 'Advanced Java', desc: 'ArrayList, HashMap, HashSet, and Iterators.', icon: 'List' },
  { id: 'java-thread', title: 'Multithreading', category: 'Advanced Java', desc: 'Threads, Runnable, Synchronization, and Concurrency.', icon: 'Activity' },
  { id: 'java-stream', title: 'Streams & Lambdas', category: 'Advanced Java', desc: 'Functional programming, Stream API, and Optional.', icon: 'Zap' }
];

const cTopics = [
  { id: 'c-basic', title: 'Syntax & Operators', category: 'C Fundamentals', desc: 'Variables, constants, and operators.', icon: 'Code' },
  { id: 'c-control', title: 'Control Flow', category: 'C Fundamentals', desc: 'If-else, switch, and loops.', icon: 'GitBranch' },
  { id: 'c-func', title: 'Functions', category: 'C Fundamentals', desc: 'Function declaration, definition, and recursion.', icon: 'FunctionSquare' },
  { id: 'c-ptr', title: 'Pointers', category: 'System Programming', desc: 'Pointer arithmetic, double pointers, and void pointers.', icon: 'Move' },
  { id: 'c-arr', title: 'Arrays & Strings', category: 'System Programming', desc: '1D/2D Arrays and string manipulation.', icon: 'Grid' },
  { id: 'c-struct', title: 'Structures & Unions', category: 'System Programming', desc: 'User-defined data types and memory layout.', icon: 'Layout' },
  { id: 'c-mem', title: 'Memory Management', category: 'System Programming', desc: 'Malloc, calloc, realloc, and free.', icon: 'HardDrive' }
];

const mlTopics = [
  { id: 'ml-reg', title: 'Regression Analysis', category: 'Supervised Learning', desc: 'Linear and Polynomial regression models.', icon: 'TrendingUp' },
  { id: 'ml-class', title: 'Classification', category: 'Supervised Learning', desc: 'Logistic Regression, SVM, and KNN.', icon: 'Target' },
  { id: 'ml-tree', title: 'Decision Trees', category: 'Supervised Learning', desc: 'Trees, Random Forests, and Gradient Boosting.', icon: 'GitGraph' },
  { id: 'ml-clust', title: 'Clustering', category: 'Unsupervised Learning', desc: 'K-Means, Hierarchical clustering, and DBSCAN.', icon: 'ScatterChart' },
  { id: 'ml-dim', title: 'Dimensionality Reduction', category: 'Unsupervised Learning', desc: 'PCA and t-SNE techniques.', icon: 'Minimize2' },
  { id: 'ml-nn', title: 'Neural Networks', category: 'Deep Learning', desc: 'Perceptrons, Activation Functions, and Backpropagation.', icon: 'BrainCircuit' }
];

const aiTopics = [
  { id: 'ai-search', title: 'Search Strategies', category: 'Search Algorithms', desc: 'BFS, DFS, A*, and Heuristic search.', icon: 'Search' },
  { id: 'ai-game', title: 'Game Playing', category: 'Search Algorithms', desc: 'Minimax algorithm and Alpha-Beta pruning.', icon: 'Gamepad2' },
  { id: 'ai-nlp', title: 'Natural Language Processing', category: 'NLP', desc: 'Tokenization, Stemming, and Sentiment Analysis.', icon: 'MessageSquare' },
  { id: 'ai-cv', title: 'Computer Vision', category: 'Computer Vision', desc: 'Image processing, Edge detection, and Object recognition.', icon: 'Eye' }
];

const allTopicsWithLang = [
  ...pythonTopics.map(t => ({ ...t, language: 'Python' })),
  ...javaTopics.map(t => ({ ...t, language: 'Java' })),
  ...cTopics.map(t => ({ ...t, language: 'C' })),
  ...mlTopics.map(t => ({ ...t, language: 'Machine Learning' })),
  ...aiTopics.map(t => ({ ...t, language: 'Artificial Intelligence' }))
];

const initialModules: CourseModule[] = allTopicsWithLang.map(t => ({
     id: t.id,
     title: t.title,
     language: t.language,
     category: t.category,
     description: t.desc,
     icon: t.icon
}));

// --- PROJECTS DATA ---
const projects: ProjectDefinition[] = [
  {
    id: 'proj-python',
    language: 'Python',
    title: 'Autonomous Data Pipeline & Visualization Dashboard',
    difficulty: 'Capstone',
    description: 'Build a robust data ingestion system that fetches real-time financial data, processes it using Pandas for anomaly detection, and visualizes trends using a web dashboard.',
    requirements: [
      'Implement multi-threaded data fetching.',
      'Use Pandas for cleaning and aggregation.',
      'Detect statistical anomalies in the stream.',
      'Generate a JSON report of findings.'
    ]
  },
  {
    id: 'proj-java',
    language: 'Java',
    title: 'Distributed Banking Transaction System',
    difficulty: 'Capstone',
    description: 'Design a thread-safe banking system capable of handling concurrent transactions, deadlock prevention, and rollback mechanisms using Java Concurrency features.',
    requirements: [
      'Implement synchronized account access.',
      'Create a custom ThreadPool for processing.',
      'Handle Acid properties in memory.',
      'Implement a rollback mechanism for failed transfers.'
    ]
  },
  {
    id: 'proj-ml',
    language: 'Machine Learning',
    title: 'Predictive Maintenance Engine',
    difficulty: 'Capstone',
    description: 'Develop a model to predict machinery failure using sensor data. You must implement the full pipeline: EDA, Feature Engineering, Model Selection, and Hyperparameter Tuning.',
    requirements: [
      'Perform detailed EDA on sensor logs.',
      'Implement Random Forest and XGBoost.',
      'Compare ROC-AUC scores.',
      'Deploy the model inference function.'
    ]
  },
  {
    id: 'proj-ai',
    language: 'Artificial Intelligence',
    title: 'Intelligent Maze Solver Agent',
    difficulty: 'Capstone',
    description: 'Create an AI agent that navigates a dynamically generated maze using A* Search algorithm with a custom heuristic function to optimize pathfinding.',
    requirements: [
      'Implement BFS, DFS, and A* search.',
      'Design a custom heuristic (Manhattan/Euclidean).',
      'Visualize the pathfinding steps.',
      'Optimize for memory usage.'
    ]
  },
  {
    id: 'proj-c',
    language: 'C',
    title: 'Custom Memory Allocator',
    difficulty: 'Capstone',
    description: 'Implement your own version of malloc, calloc, realloc, and free. Manage the heap using a linked list of free blocks and handle memory fragmentation.',
    requirements: [
      'Implement block splitting and coalescing.',
      'Manage metadata for memory blocks.',
      'Ensure 8-byte alignment.',
      'Detect double-free errors.'
    ]
  }
];

const createGrandTest = (lang: string): Problem => ({
  id: `GRAND-TEST-${lang}`,
  title: `${lang} Grand Assessment`,
  description: `FINAL EXAMINATION: This is the comprehensive assessment for the ${lang} track. \n\nYou must solve this complex problem which integrates multiple concepts from the curriculum. Passing this test (100XP) will unlock your Capstone Project.`,
  language: lang,
  module: 'GRAND_TEST',
  difficulty: 'GRAND',
  points: 100,
  starterCode: getStarterCode(lang),
  testCases: [
    { input: 'TEST_INIT', expectedOutput: 'SYSTEM_READY', isHidden: false },
    { input: 'COMPLEX_CASE_1', expectedOutput: 'SUCCESS_1', isHidden: true },
    { input: 'COMPLEX_CASE_2', expectedOutput: 'SUCCESS_2', isHidden: true },
    { input: 'EDGE_CASE', expectedOutput: 'HANDLED', isHidden: true }
  ]
});

const generateProblems = (): Problem[] => {
  const problems: Problem[] = [];
  const difficulties: Difficulty[] = ['L0', 'L1', 'L2'];
  
  // Generate Standard Problems
  allTopicsWithLang.forEach(topic => {
      difficulties.forEach(diff => {
          for(let i = 1; i <= 5; i++) { // Reduced to 5 for easier testing in demo, normally 10
             problems.push(createProblem(
                 topic.language, 
                 `${topic.id}-${diff}-${i}`, 
                 diff, 
                 topic.title, 
                 i
             ));
          }
      });
  });

  // Generate Grand Tests
  ['Python', 'Java', 'C', 'Machine Learning', 'Artificial Intelligence'].forEach(lang => {
     problems.push(createGrandTest(lang));
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
    case 'Java': return 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}';
    case 'C': return '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Your code here\n    return 0;\n}';
    case 'Machine Learning': return '# ML Pipeline\nimport numpy as np\nimport pandas as pd\n\ndef train_model(X, y):\n    # Implement model training logic\n    pass';
    case 'Artificial Intelligence': return '# AI Algorithm Implementation\n\ndef search_strategy(state):\n    # Implement search logic\n    pass';
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
    // Ensure new user fields exist if loading old data
    parsed.users = parsed.users.map((u: any) => ({
        ...u,
        completedGrandTests: u.completedGrandTests || [],
        unlockedProjects: u.unlockedProjects || []
    }));
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
  getGrandTest: (lang: string): Problem | undefined => getState().problems.find(p => p.language === lang && p.difficulty === 'GRAND'),
  getProject: (lang: string): ProjectDefinition | undefined => projects.find(p => p.language === lang),

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
  
  // Logic to calculate progress
  getTrackProgress: (userId: string, language: string): number => {
      const state = getState();
      const user = state.users.find(u => u.id === userId);
      if (!user) return 0;
      
      const modules = state.modules.filter(m => m.language === language);
      if (modules.length === 0) return 0;

      // Simplification: A module is "completed" if user has solved at least one problem from it
      // In a real app, this would be strictly 100% of problems.
      // We check if user.completedProblems contains any string that roughly matches the module title or ID logic
      // Since completedProblems stores session labels usually, we need to be careful.
      // Current updateUserScore adds "EXAM_..." or problem ID. Let's assume Problem ID is stored for accuracy in CodeLab.
      
      // Better Logic:
      // Count how many modules have at least 1 problem solved by the user.
      const problems = state.problems.filter(p => p.language === language && p.difficulty !== 'GRAND');
      if (problems.length === 0) return 100; // No problems means "done"

      // Check how many of these problems are in user.completedProblems
      // Note: user.completedProblems currently stores "EXAM_timestamp". 
      // We need to fix CodeLab to store problemId.
      // Assuming completedProblems includes problemIds now (will update CodeLab).
      
      const solvedCount = problems.filter(p => user.completedProblems?.includes(p.id)).length;
      return Math.floor((solvedCount / problems.length) * 100);
  },

  updateUserScore: (userId: string, problemId: string, points: number) => {
    const state = getState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      // Ensure we don't add duplicate IDs
      if (!user.completedProblems?.includes(problemId)) {
        user.completedProblems = [...(user.completedProblems || []), problemId];
        user.score = (user.score || 0) + points;
      }
      
      // Check if this was a Grand Test
      if (problemId.startsWith('GRAND-TEST-')) {
          const lang = problemId.replace('GRAND-TEST-', '');
          if (!user.completedGrandTests?.includes(lang)) {
              user.completedGrandTests = [...(user.completedGrandTests || []), lang];
              // Unlock project
              if (!user.unlockedProjects?.includes(lang)) {
                  user.unlockedProjects = [...(user.unlockedProjects || []), lang];
              }
          }
      }

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
