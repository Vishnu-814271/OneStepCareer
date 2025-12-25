import { User, Problem, Difficulty, CommunityMessage, TestCase } from '../types';

const STORAGE_KEY = 'technexus_db_v4'; 

// --- INITIAL SEED DATA ---
const initialUsers: User[] = [
  { 
    id: 'admin-id', 
    name: 'Lead Instructor', 
    email: 'instructor@technexus.edu', 
    role: 'ADMIN', 
    isPaid: true, 
    paymentStatus: 'APPROVED', 
    joinedDate: new Date('2023-01-01') 
  },
  { 
    id: 'student-id', 
    name: 'Tech Learner', 
    email: 'learner@technexus.edu', 
    role: 'STUDENT', 
    isPaid: true, 
    plan: 'STUDENT', 
    paymentStatus: 'APPROVED', 
    joinedDate: new Date('2023-05-15'), 
    score: 0, 
    completedProblems: [] 
  }
];

const initialLanguages: string[] = ['Python', 'Java', 'C', 'C++', 'Machine Learning', 'AI'];

const initialCommunityMessages: CommunityMessage[] = [
  {
    id: 'msg-1',
    userId: 'student-id',
    userName: 'Tech Learner',
    userRole: 'STUDENT',
    text: 'Excited to start the AI track today!',
    timestamp: new Date().toISOString()
  }
];

const generateProblems = (): Problem[] => {
  const generated: Problem[] = [];
  
  // Python - L0
  generated.push({
    id: 'py-l0-1',
    title: 'Python: Integer Sum',
    description: 'Write a program that reads two integers from input and prints their sum.',
    language: 'Python',
    module: 'Fundamentals',
    difficulty: 'L0',
    points: 10,
    starterCode: '# Read inputs\na = int(input())\nb = int(input())\n\n# Your logic here\nprint(a + b)',
    testCases: [
      { input: '5\n10', expectedOutput: '15', isHidden: false },
      { input: '-1\n1', expectedOutput: '0', isHidden: false },
      { input: '100\n200', expectedOutput: '300', isHidden: true }
    ]
  });

  // Java - L0
  generated.push({
    id: 'java-l0-1',
    title: 'Java: Greeting System',
    description: 'Create a program that reads a name and prints "Hello, [Name]".',
    language: 'Java',
    module: 'Fundamentals',
    difficulty: 'L0',
    points: 10,
    starterCode: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String name = sc.next();\n        System.out.println("Hello, " + name);\n    }\n}',
    testCases: [
      { input: 'Alice', expectedOutput: 'Hello, Alice', isHidden: false },
      { input: 'Bob', expectedOutput: 'Hello, Bob', isHidden: true }
    ]
  });

  // C - L0
  generated.push({
    id: 'c-l0-1',
    title: 'C: Square Calculator',
    description: 'Read an integer and print its square value.',
    language: 'C',
    module: 'Fundamentals',
    difficulty: 'L0',
    points: 10,
    starterCode: '#include <stdio.h>\n\nint main() {\n    int n;\n    scanf("%d", &n);\n    printf("%d", n * n);\n    return 0;\n}',
    testCases: [
      { input: '4', expectedOutput: '16', isHidden: false },
      { input: '9', expectedOutput: '81', isHidden: true }
    ]
  });

  // Add more placeholders to fulfill common languages
  const otherLangs = ['C++', 'Machine Learning', 'AI'];
  otherLangs.forEach(lang => {
    generated.push({
      id: `${lang.toLowerCase()}-l0-1`,
      title: `${lang} Basics`,
      description: `Entry level challenge for ${lang}. Focus on syntax and basic I/O.`,
      language: lang,
      module: 'Introduction',
      difficulty: 'L0',
      points: 10,
      starterCode: lang === 'C++' ? '#include <iostream>\nusing namespace std;\nint main() { return 0; }' : '# Logic here',
      testCases: [{ input: '1', expectedOutput: '1', isHidden: false }]
    });
  });

  return generated;
};

interface AppData {
  users: User[];
  languages: string[];
  problems: Problem[];
  communityMessages: CommunityMessage[];
}

const defaultState: AppData = {
  users: [...initialUsers],
  languages: [...initialLanguages],
  problems: generateProblems(),
  communityMessages: [...initialCommunityMessages]
};

const getState = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) { console.error("Failed to load data", e); }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  return defaultState;
};

const saveState = (state: AppData) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } 
  catch (e) { console.error("Failed to save data", e); }
};

export const dataService = {
  getUsers: (): User[] => getState().users,
  getUserById: (id: string): User | undefined => getState().users.find(u => u.id === id),
  
  getPortalUser: (role: 'ADMIN' | 'STUDENT'): User => {
    const state = getState();
    return state.users.find(u => u.role === role) || state.users[0];
  },

  updateUserProfile: (userId: string, updates: Partial<User>): User | undefined => {
    const state = getState();
    const userIndex = state.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      state.users[userIndex] = { ...state.users[userIndex], ...updates };
      saveState(state);
      return state.users[userIndex];
    }
    return undefined;
  },

  updateUserScore: (userId: string, problemId: string, points: number) => {
    const state = getState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      if (!user.completedProblems) user.completedProblems = [];
      if (!user.score) user.score = 0;
      if (!user.completedProblems.includes(problemId)) {
        user.completedProblems.push(problemId);
        user.score += points;
        saveState(state);
      }
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

  getLanguages: (): string[] => getState().languages,
  getProblems: (): Problem[] => getState().problems,
  getModulesByLanguage: (language: string): string[] => {
    const langProblems = getState().problems.filter(p => p.language === language);
    return Array.from(new Set(langProblems.map(p => p.module || 'General')));
  },

  getProblemsByModule: (language: string, module: string): Problem[] => {
    return getState().problems.filter(p => p.language === language && (p.module || 'General') === module);
  },
  
  addProblem: (problem: Problem) => {
    const state = getState();
    state.problems.push(problem);
    saveState(state);
  },
  
  updateProblem: (updatedProblem: Problem) => {
    const state = getState();
    const index = state.problems.findIndex(p => p.id === updatedProblem.id);
    if (index !== -1) {
      state.problems[index] = updatedProblem;
      saveState(state);
    }
  },
  
  deleteProblem: (id: string) => {
    const state = getState();
    state.problems = state.problems.filter(p => p.id !== id);
    saveState(state);
  },

  getCommunityMessages: (): CommunityMessage[] => {
    const state = getState();
    return [...state.communityMessages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  postCommunityMessage: (userId: string, userName: string, userRole: 'ADMIN' | 'STUDENT', text: string) => {
    const state = getState();
    const newMessage: CommunityMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId, userName, userRole, text,
      timestamp: new Date().toISOString()
    };
    state.communityMessages.push(newMessage);
    saveState(state);
    return newMessage;
  }
};