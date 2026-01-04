
import { User, Problem, Difficulty, CommunityMessage, TestCase, GlobalSettings } from '../types';

const STORAGE_KEY = 'technexus_db_v5'; 

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

const generateProblems = (): Problem[] => {
  const problems: Problem[] = [];
  const languages = ['Python', 'Machine Learning', 'Artificial Intelligence', 'Java', 'C'];
  
  // Generating a base set of problems for each requested track
  languages.forEach((lang) => {
    for (let i = 1; i <= 10; i++) {
      problems.push({
        id: `${lang.toLowerCase().replace(' ', '-')}-${i}`,
        title: `${lang}: Logic Unit ${i}`,
        description: `Implement a technical logic unit for ${lang}. Problem Scenario: Solve the specified industrial algorithmic requirement. Assessment focus: Efficiency and edge-case handling.`,
        language: lang,
        module: 'Industrial Certification',
        difficulty: i < 4 ? 'L0' : i < 8 ? 'L1' : 'L2',
        points: 25,
        starterCode: getStarterCode(lang),
        testCases: [
          { input: 'test_input_alpha', expectedOutput: 'expected_result_beta', isHidden: false },
          { input: 'hidden_stress_test', expectedOutput: 'verified_output', isHidden: true }
        ]
      });
    }
  });
  return problems;
};

const getStarterCode = (lang: string) => {
  switch(lang) {
    case 'Python': return '# Technical Logic Implementation\nimport sys\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()';
    case 'Java': return 'public class Main {\n    public static void main(String[] args) {\n        // Your industrial logic here\n    }\n}';
    case 'C': return '#include <stdio.h>\n\nint main() {\n    /* Implementation start */\n    return 0;\n}';
    case 'Machine Learning': return '# ML Pipeline Definition\nimport numpy as np\n\nclass Model:\n    def train(self, X, y):\n        pass';
    case 'Artificial Intelligence': return '# AI Heuristic Implementation\n\ndef search_logic(state):\n    pass';
    default: return '// Exam Terminal Ready\n';
  }
}

interface AppData {
  users: User[];
  problems: Problem[];
  communityMessages: CommunityMessage[];
  settings: GlobalSettings;
}

const defaultState: AppData = {
  users: initialUsers,
  problems: generateProblems(),
  communityMessages: [],
  settings: initialSettings
};

const getState = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultState;
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
  getModulesByLanguage: (lang: string) => Array.from(new Set(getState().problems.filter(p => p.language === lang).map(p => p.module || 'General'))),
  getProblemsByModule: (lang: string, mod: string) => getState().problems.filter(p => p.language === lang && p.module === mod),
  updateUserScore: (userId: string, sessionLabel: string, points: number) => {
    const state = getState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.completedProblems = [...(user.completedProblems || []), sessionLabel];
      user.score = (user.score || 0) + points;
      saveState(state);
    }
  },
  updateUserProfile: (id: string, updates: Partial<User>) => {
    const state = getState();
    const index = state.users.findIndex(u => u.id === id);
    if (index !== -1) {
      state.users[index] = { ...state.users[index], ...updates };
      saveState(state);
      return state.users[index];
    }
    return undefined;
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
