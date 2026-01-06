
import { User, Problem, Difficulty, CommunityMessage, TestCase, GlobalSettings, CourseModule, ProjectDefinition } from '../types';

const STORAGE_KEY = 'technexus_db_v11';

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

const pythonTopics = [
  { id: 'py-io', title: 'Basic Input/Output', category: 'Basic Python Programming', desc: 'Print statements, input handling, and type casting.', icon: 'Terminal' }
];

const allTopicsWithLang = [
  ...pythonTopics.map(t => ({ ...t, language: 'Python' }))
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
          for(let i = 1; i <= 2; i++) {
             problems.push({
                id: `${topic.id}-${diff}-${i}`,
                title: `Problem ${i}`,
                description: `Solve the industrial logic for ${topic.title}. Output should strictly match the format requirements.`,
                inputFormat: 'Standard Input stream',
                outputFormat: 'Standard Output stream',
                constraints: 'Time: 1.0s, Memory: 256MB',
                language: topic.language,
                allowedLanguages: ['Python', 'Java', 'C'],
                difficulty: diff,
                points: 10,
                starterCode: 'def solve():\n    # Enter code here\n    val = input()\n    print(val)',
                module: topic.title,
                testCases: [
                    { input: '10', expectedOutput: '10', isHidden: false, isSample: true },
                    { input: '20', expectedOutput: '20', isHidden: false, isSample: false },
                    { input: '30', expectedOutput: '30', isHidden: true, isSample: false },
                    { input: '40', expectedOutput: '40', isHidden: true, isSample: false },
                    { input: '50', expectedOutput: '50', isHidden: true, isSample: false }
                ]
             });
          }
      });
  });
  return problems;
};

const getState = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
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
