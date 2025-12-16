import { User, Problem, Difficulty, CommunityMessage } from '../types';

const STORAGE_KEY = 'technexus_db_v3'; // Incremented version to force clear old bad data if any

// --- INITIAL SEED DATA ---
const initialUsers: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@gmail.com', 
    password: 'Admin@123', 
    role: 'ADMIN', 
    isPaid: true, 
    paymentStatus: 'APPROVED', 
    joinedDate: new Date('2023-01-01') 
  },
  { 
    id: '2', 
    name: 'Student User', 
    email: 'student@technexus.com', 
    password: 'Password123', 
    role: 'STUDENT', 
    isPaid: true, 
    plan: 'STUDENT', 
    paymentStatus: 'APPROVED', 
    joinedDate: new Date('2023-05-15'), 
    score: 0, 
    completedProblems: [] 
  }
];

const initialLanguages: string[] = ['Python', 'Java', 'C', 'C++'];

const initialCommunityMessages: CommunityMessage[] = [
  {
    id: 'msg-1',
    userId: '2',
    userName: 'Student User',
    userRole: 'STUDENT',
    text: 'Hello, I am having trouble accessing the Advanced Python module.',
    timestamp: new Date('2023-06-01T10:00:00').toISOString()
  },
  {
    id: 'msg-2',
    userId: '1',
    userName: 'Admin User',
    userRole: 'ADMIN',
    text: 'Hi there! Please make sure you have completed the assessments for the Basic module first.',
    timestamp: new Date('2023-06-01T10:05:00').toISOString()
  }
];

const generateProblems = (): Problem[] => {
  const generated: Problem[] = [];
  
  const levels: { diff: Difficulty; points: number; count: number }[] = [
    { diff: 'L0', points: 8, count: 10 },
    { diff: 'L1', points: 9, count: 10 },
    { diff: 'L2', points: 10, count: 10 }
  ];

  const pythonTitles = [
    "Hello World", "Print Variable", "Simple Addition", "String Concat", "Input Output", 
    "Area of Square", "Convert Int to String", "List Creation", "Boolean Logic", "Simple Loop",
    "Check Even/Odd", "Find Maximum", "Factorial Loop", "String Reversal", "Count Vowels",
    "List Sum", "Temperature Convert", "Simple Calculator", "Range Check", "FizzBuzz",
    "Palindrome Check", "Prime Number", "Fibonacci Sequence", "List Sorting", "Dictionary Basics",
    "Anagram Check", "Remove Duplicates", "Matrix Addition", "Binary Search Basic", "Pattern Printing"
  ];

  let titleIndex = 0;

  ['Python', 'Java', 'C', 'C++'].forEach(lang => {
    titleIndex = 0; 
    levels.forEach(level => {
      for (let i = 1; i <= level.count; i++) {
        const title = lang === 'Python' ? (pythonTitles[titleIndex] || `${lang} Problem ${i}`) : `${lang} ${level.diff} Problem ${i}`;
        if(lang === 'Python') titleIndex++;

        let starter = '';
        if (lang === 'Python') starter = '# Write your code here\n';
        if (lang === 'Java') starter = 'public class Main {\n    public static void main(String[] args) {\n        // Code here\n    }\n}';
        if (lang.startsWith('C')) starter = '#include <stdio.h>\n\nint main() {\n    // Code here\n    return 0;\n}';

        generated.push({
          id: `${lang.toLowerCase()}-${level.diff}-${i}`,
          title: title,
          description: `This is a ${level.diff} level problem for ${lang}. Calculate the correct output based on the input. Marks: ${level.points}.`,
          language: lang,
          module: i <= 5 ? 'Basics' : 'Algorithms',
          difficulty: level.diff,
          points: level.points,
          starterCode: starter,
          testCases: [
            { input: '10', expectedOutput: 'Result 10', isHidden: false },
            { input: '20', expectedOutput: 'Result 20', isHidden: true },
            { input: '5', expectedOutput: 'Result 5', isHidden: true }
          ]
        });
      }
    });
  });

  return generated;
};

// --- STATE MANAGEMENT ---
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

// Helper to get fresh state from localStorage every time
const getState = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default state to ensure structure integrity
      return { 
        ...defaultState, 
        ...parsed,
        users: parsed.users || defaultState.users,
        problems: parsed.problems || defaultState.problems
      };
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }
  // Initialize if empty
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  return defaultState;
};

const saveState = (state: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const dataService = {
  // USER OPERATIONS
  getUsers: (): User[] => {
    return getState().users;
  },

  getUserById: (id: string): User | undefined => {
    const state = getState();
    return state.users.find(u => u.id === id);
  },
  
  registerUser: (user: User): boolean => {
    const state = getState();
    if (state.users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return false; // User exists
    }
    state.users.push({ 
      ...user, 
      joinedDate: new Date(), 
      isPaid: false, 
      paymentStatus: 'NONE', 
      score: 0, 
      completedProblems: [] 
    });
    saveState(state);
    return true;
  },

  loginUser: (email: string, password: string): { success: boolean; user?: User; message: string } => {
    const state = getState();
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: "User not found. Please Sign Up." };
    }

    if (user.password !== password) {
      return { success: false, message: "Incorrect password." };
    }

    return { success: true, user, message: "Login successful." };
  },

  resetPassword: (email: string, newPassword: string): boolean => {
    const state = getState();
    const userIndex = state.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex !== -1) {
      state.users[userIndex].password = newPassword;
      saveState(state);
      return true;
    }
    return false;
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

  submitPaymentRequest: (userId: string, plan: 'STUDENT' | 'PROFESSIONAL') => {
    const state = getState();
    const userIndex = state.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      state.users[userIndex].paymentStatus = 'PENDING_APPROVAL';
      state.users[userIndex].plan = plan;
      state.users[userIndex].isPaid = false; 
      saveState(state);
      return state.users[userIndex];
    }
    return undefined;
  },

  approvePayment: (userId: string) => {
    const state = getState();
    const userIndex = state.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      state.users[userIndex].paymentStatus = 'APPROVED';
      state.users[userIndex].isPaid = true;
      saveState(state);
      return state.users[userIndex];
    }
    return undefined;
  },

  rejectPayment: (userId: string) => {
    const state = getState();
    const userIndex = state.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      state.users[userIndex].paymentStatus = 'REJECTED';
      state.users[userIndex].isPaid = false;
      saveState(state);
      return state.users[userIndex];
    }
    return undefined;
  },

  // LANGUAGE OPERATIONS
  getLanguages: (): string[] => {
    return getState().languages;
  },
  
  addLanguage: (lang: string): boolean => {
    const state = getState();
    if (state.languages.includes(lang)) return false;
    state.languages.push(lang);
    saveState(state);
    return true;
  },

  // PROBLEM OPERATIONS
  getProblems: (): Problem[] => {
    return getState().problems;
  },
  
  getModulesByLanguage: (language: string): string[] => {
    const state = getState();
    const langProblems = state.problems.filter(p => p.language === language);
    const modules = new Set(langProblems.map(p => p.module || 'General'));
    return Array.from(modules);
  },

  getProblemsByModule: (language: string, module: string): Problem[] => {
    const state = getState();
    return state.problems.filter(p => p.language === language && (p.module || 'General') === module);
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

  // COMMUNITY MESSAGES
  getCommunityMessages: (): CommunityMessage[] => {
    const state = getState();
    return [...state.communityMessages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  postCommunityMessage: (userId: string, userName: string, userRole: 'ADMIN' | 'STUDENT', text: string) => {
    const state = getState();
    const newMessage: CommunityMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      userRole,
      text,
      timestamp: new Date().toISOString()
    };
    state.communityMessages.push(newMessage);
    saveState(state);
    return newMessage;
  }
};