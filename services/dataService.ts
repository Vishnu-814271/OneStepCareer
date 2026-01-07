
import { User, Problem, Difficulty, CommunityMessage, TestCase, GlobalSettings, CourseModule, ProjectDefinition } from '../types';

// Bumped version to v22 to force clean reset for user data structure and icons
const STORAGE_KEY = 'technexus_db_v22';

const initialSettings: GlobalSettings = {
  tabSwitchLimit: 3000,
  offScreenLimit: 3000,
  allowCopyPaste: true,
  standardTimeLimit: 3600, // 1 hour exactly
  multipleAttempts: true,
  maxAttempts: 300,
  scoreVisibility: true,
  viewSolution: true
};

const initialUsers: User[] = [
  { 
    id: 'admin-id', 
    name: 'Chief Examiner', 
    email: 'admin@technexus.edu', 
    password: 'admin',
    role: 'ADMIN', 
    isPaid: true, 
    paymentStatus: 'APPROVED'
  },
  { 
    id: 'faculty-id', 
    name: 'Dr. Sharma (HOD)', 
    email: 'hod@jntu.edu', 
    password: 'faculty',
    role: 'FACULTY', 
    college: 'JNTU',
    isPaid: true, 
    paymentStatus: 'APPROVED'
  },
  { 
    id: 'student-id', 
    name: 'Academic Candidate', 
    email: 'candidate@technexus.edu', 
    password: '123',
    role: 'STUDENT', 
    college: 'JNTU',
    isPaid: true, 
    plan: 'STUDENT', 
    paymentStatus: 'APPROVED', 
    score: 120, 
    completedProblems: [],
    completedGrandTests: [],
    unlockedProjects: []
  },
  {
    id: 'pending-student-id',
    name: 'New Student',
    email: 'new@student.com',
    password: '123',
    role: 'STUDENT', 
    college: 'OU',
    isPaid: false,
    paymentStatus: 'PENDING_APPROVAL',
    joinedDate: new Date(),
    score: 0
  }
];

// --- COURSE DATA DEFINITIONS ---

const pythonTopics = [
  { id: 'py-io', title: 'Basic Input/Output', category: 'Basic Python Programming', desc: 'Print statements, input handling, and type casting.', icon: 'Terminal' },
  { id: 'py-cond', title: 'Control Flow', category: 'Basic Python Programming', desc: 'If-Else conditions and logic gates.', icon: 'GitMerge' },
  { id: 'py-loops', title: 'Loops & Iterations', category: 'Basic Python Programming', desc: 'For loops, while loops and range functions.', icon: 'RefreshCw' },
  { id: 'py-ds', title: 'Data Structures', category: 'Advanced Python', desc: 'Lists, Tuples, Dictionaries and Sets.', icon: 'Database' }
];

const javaTopics = [
  { id: 'java-base', title: 'Java Syntax', category: 'Java Fundamentals', desc: 'Variables, Data Types and Operators.', icon: 'Coffee' },
  { id: 'java-oop', title: 'OOP Principles', category: 'Object Oriented Programming', desc: 'Classes, Objects, Inheritance and Polymorphism.', icon: 'Box' },
  { id: 'java-coll', title: 'Collections', category: 'Java Advanced', desc: 'ArrayList, HashMap and Iterators.', icon: 'List' },
  { id: 'java-ex', title: 'Exception Handling', category: 'Java Advanced', desc: 'Try-Catch, Throw and Throws.', icon: 'ShieldAlert' }
];

const cTopics = [
  { id: 'c-fund', title: 'C Fundamentals', category: 'C Basics', desc: 'Structure of C program, printf and scanf.', icon: 'Terminal' },
  { id: 'c-ptr', title: 'Pointers', category: 'Memory Management', desc: 'Address arithmetic and pointer dereferencing.', icon: 'Cpu' },
  { id: 'c-mem', title: 'Dynamic Memory', category: 'Memory Management', desc: 'Malloc, Calloc, Realloc and Free.', icon: 'HardDrive' }
];

const mlTopics = [
  { id: 'ml-reg', title: 'Regression Analysis', category: 'Supervised Learning', desc: 'Linear and Logistic Regression models.', icon: 'TrendingUp' },
  { id: 'ml-class', title: 'Classification', category: 'Supervised Learning', desc: 'Decision Trees and SVM.', icon: 'GitBranch' },
  { id: 'ml-clust', title: 'Clustering', category: 'Unsupervised Learning', desc: 'K-Means and Hierarchical Clustering.', icon: 'Share2' }
];

const aiTopics = [
  { id: 'ai-search', title: 'Search Algorithms', category: 'Problem Solving', desc: 'BFS, DFS and A* Search.', icon: 'Search' },
  { id: 'ai-nn', title: 'Neural Networks', category: 'Deep Learning', desc: 'Perceptrons, Layers and Activation Functions.', icon: 'BrainCircuit' },
  { id: 'ai-nlp', title: 'NLP Basics', category: 'Natural Language Processing', desc: 'Tokenization and Sentiment Analysis.', icon: 'MessageSquare' }
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

const generateProblems = (): Problem[] => {
  const problems: Problem[] = [];
  const difficulties: Difficulty[] = ['L0', 'L1', 'L2']; 
  
  allTopicsWithLang.forEach(topic => {
      difficulties.forEach(diff => {
          // 10 Problems per level
          for(let i = 1; i <= 10; i++) {
             let starter = '';
             let problemTitle = `${topic.title}: Practice Set ${i}`;
             let problemDesc = `Write a program to solve the ${topic.title} problem case #${i}. Input provided via standard input.`;

             if (topic.language === 'Python') {
                starter = 'def solve():\n    # Read input using input()\n    # Print output using print()\n    pass\n\nif __name__ == "__main__":\n    solve()';
             } else if (topic.language === 'Java') {
                starter = 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Enter code here\n    }\n}';
             } else if (topic.language === 'C') {
                starter = '#include <stdio.h>\n\nint main() {\n    // Enter code here\n    return 0;\n}';
             } else if (topic.language === 'Machine Learning') {
                starter = 'import numpy as np\n\ndef model_predict(input_data):\n    # Return prediction\n    return 0';
                problemDesc = "Implement the prediction model logic given the input features.";
             } else if (topic.language === 'Artificial Intelligence') {
                starter = 'def search_algo(graph, start, end):\n    # Implement search\n    return []';
                problemDesc = "Implement the search algorithm to find the optimal path.";
             }

             problems.push({
                id: `${topic.id}-${diff}-${i}`,
                title: problemTitle,
                description: problemDesc,
                inputFormat: 'Standard Input',
                outputFormat: 'Standard Output',
                constraints: 'Time: 1.0s, Memory: 256MB',
                language: topic.language,
                allowedLanguages: [topic.language],
                difficulty: diff,
                points: diff === 'L0' ? 8 : diff === 'L1' ? 9 : 10,
                starterCode: starter,
                module: topic.title,
                testCases: [
                    { input: '10', expectedOutput: 'Result 10', isHidden: false, isSample: false },
                    { input: '20', expectedOutput: 'Result 20', isHidden: false, isSample: false },
                    { input: '30', expectedOutput: 'Result 30', isHidden: true, isSample: false }
                ]
             });
          }
      });
  });
  return problems;
};

const getState = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Data corruption detected, resetting storage.", e);
  }
  return defaultState;
};

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

const saveState = (state: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to localStorage", e);
  }
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

  getProblemsByModule: (lang: string, modTitle: string) => getState().problems.filter(p => p.language === lang && p.module === modTitle),
  getGrandTest: (lang: string): Problem | undefined => getState().problems.find(p => p.language === lang && p.difficulty === 'GRAND'),

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
  
  getTrackProgress: (userId: string, language: string): number => {
      const state = getState();
      const user = state.users.find(u => u.id === userId);
      if (!user) return 0;
      const problems = state.problems.filter(p => p.language === language && p.difficulty !== 'GRAND');
      if (problems.length === 0) return 0;
      const solvedCount = problems.filter(p => user.completedProblems?.includes(p.id)).length;
      return Math.floor((solvedCount / problems.length) * 100);
  },

  checkGrandTestEligibility: (userId: string, language: string): boolean => {
      const state = getState();
      const user = state.users.find(u => u.id === userId);
      if (!user) return false;
      const modules = state.modules.filter(m => m.language === language);
      if (modules.length === 0) return false;
      for (const module of modules) {
          const moduleProblems = state.problems.filter(p => p.language === language && p.module === module.title && p.difficulty !== 'GRAND');
          if (moduleProblems.length > 0) {
              const solvedCount = moduleProblems.filter(p => user.completedProblems?.includes(p.id)).length;
              if ((solvedCount / moduleProblems.length) * 100 < 80) return false;
          }
      }
      return true;
  },

  updateUserScore: (userId: string, problemId: string, points: number) => {
    const state = getState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      if (!user.completedProblems?.includes(problemId)) {
        user.completedProblems = [...(user.completedProblems || []), problemId];
        user.score = (user.score || 0) + points;
      }
      saveState(state);
    }
  },

  submitPaymentRequest: (userId: string, plan: 'STUDENT' | 'PROFESSIONAL'): User | undefined => {
    const state = getState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.paymentStatus = 'PENDING_APPROVAL';
      user.plan = plan;
      user.isPaid = false; 
      saveState(state);
      return user;
    }
    return undefined;
  },

  approvePayment: (userId: string) => {
    const state = getState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.paymentStatus = 'APPROVED';
      user.isPaid = true;
      saveState(state);
    }
  },

  rejectPayment: (userId: string) => {
    const state = getState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.paymentStatus = 'REJECTED';
      user.isPaid = false;
      saveState(state);
    }
  },

  getCommunityMessages: () => getState().communityMessages,
  postCommunityMessage: (userId: string, userName: string, userRole: any, text: string) => {
    const state = getState();
    const msg = { id: Date.now().toString(), userId, userName, userRole, text, timestamp: new Date().toISOString() };
    state.communityMessages.push(msg);
    saveState(state);
  },

  // --- AUTHENTICATION METHODS ---

  registerUser: (userData: Omit<User, 'id'>): User => {
    const state = getState();
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      joinedDate: new Date(),
      score: 0,
      completedProblems: [],
      paymentStatus: 'NONE', // New users need to pay
      isPaid: false
    };
    state.users.push(newUser);
    saveState(state);
    return newUser;
  },

  bulkRegisterUsers: (usersData: Array<{name: string, email: string, password: string, college: string}>): number => {
    const state = getState();
    let count = 0;
    usersData.forEach(u => {
        // Simple check to avoid duplicates by email
        if (!state.users.find(existing => existing.email === u.email)) {
            state.users.push({
                id: `usr-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                name: u.name,
                email: u.email,
                password: u.password,
                role: 'STUDENT',
                college: u.college,
                isPaid: true,
                paymentStatus: 'APPROVED',
                joinedDate: new Date(),
                score: 0,
                completedProblems: []
            });
            count++;
        }
    });
    saveState(state);
    return count;
  },

  authenticateUser: (email: string, password: string): User | null => {
    const state = getState();
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    return user || null;
  },

  resetUserPassword: (email: string, newPassword: string): boolean => {
    const state = getState();
    const user = state.users.find(u => u.email === email);
    if (user) {
        user.password = newPassword;
        saveState(state);
        return true;
    }
    return false;
  },

  getStudentsByCollege: (collegeName: string): User[] => {
    return getState().users.filter(u => u.role === 'STUDENT' && u.college === collegeName);
  }
};
