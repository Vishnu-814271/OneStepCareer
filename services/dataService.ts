import { User, Problem, Difficulty } from '../types';

// Initial Mock Data
let users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@technexus.com', role: 'ADMIN', isPaid: true, paymentStatus: 'APPROVED', joinedDate: new Date('2023-01-01') },
  { id: '2', name: 'Student User', email: 'student@technexus.com', role: 'STUDENT', isPaid: true, plan: 'STUDENT', paymentStatus: 'APPROVED', joinedDate: new Date('2023-05-15'), score: 0, completedProblems: [] },
  { id: '3', name: 'New Joiner', email: 'new@technexus.com', role: 'STUDENT', isPaid: false, paymentStatus: 'NONE', joinedDate: new Date(), score: 0, completedProblems: [] }
];

// Initial Languages
let languages: string[] = ['Python', 'Java', 'C', 'C++'];

// Helper to generate problems
const generateProblems = (): Problem[] => {
  const generated: Problem[] = [];
  
  const levels: { diff: Difficulty; points: number; count: number }[] = [
    { diff: 'L0', points: 8, count: 10 },
    { diff: 'L1', points: 9, count: 10 },
    { diff: 'L2', points: 10, count: 10 }
  ];

  // Specific Titles for Python to make it look real
  const pythonTitles = [
    // L0
    "Hello World", "Print Variable", "Simple Addition", "String Concat", "Input Output", 
    "Area of Square", "Convert Int to String", "List Creation", "Boolean Logic", "Simple Loop",
    // L1
    "Check Even/Odd", "Find Maximum", "Factorial Loop", "String Reversal", "Count Vowels",
    "List Sum", "Temperature Convert", "Simple Calculator", "Range Check", "FizzBuzz",
    // L2
    "Palindrome Check", "Prime Number", "Fibonacci Sequence", "List Sorting", "Dictionary Basics",
    "Anagram Check", "Remove Duplicates", "Matrix Addition", "Binary Search Basic", "Pattern Printing"
  ];

  let titleIndex = 0;

  ['Python', 'Java', 'C', 'C++'].forEach(lang => {
    // Reset titles for each lang or just cycle
    titleIndex = 0; 
    
    levels.forEach(level => {
      for (let i = 1; i <= level.count; i++) {
        const title = lang === 'Python' ? (pythonTitles[titleIndex] || `${lang} Problem ${i}`) : `${lang} ${level.diff} Problem ${i}`;
        if(lang === 'Python') titleIndex++;

        // Basic Starter Code based on Lang
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

let problems: Problem[] = generateProblems();

export const dataService = {
  // USER OPERATIONS
  getUsers: (): User[] => [...users],
  
  registerUser: (user: User): boolean => {
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return false; // User exists
    }
    users.push({ ...user, joinedDate: new Date(), isPaid: false, paymentStatus: 'NONE', score: 0, completedProblems: [] }); 
    return true;
  },

  updateUserScore: (userId: string, problemId: string, points: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      if (!user.completedProblems) user.completedProblems = [];
      if (!user.score) user.score = 0;

      // Only add score if not already completed
      if (!user.completedProblems.includes(problemId)) {
        user.completedProblems.push(problemId);
        user.score += points;
      }
    }
  },

  submitPaymentRequest: (userId: string, plan: 'STUDENT' | 'PROFESSIONAL') => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.paymentStatus = 'PENDING_APPROVAL';
      user.plan = plan;
      user.isPaid = false; 
    }
    return user;
  },

  approvePayment: (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.paymentStatus = 'APPROVED';
      user.isPaid = true;
    }
    return user;
  },

  rejectPayment: (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.paymentStatus = 'REJECTED';
      user.isPaid = false;
    }
    return user;
  },

  // LANGUAGE OPERATIONS
  getLanguages: (): string[] => [...languages],
  
  addLanguage: (lang: string): boolean => {
    if (languages.includes(lang)) return false;
    languages.push(lang);
    return true;
  },

  // PROBLEM OPERATIONS
  getProblems: (): Problem[] => [...problems],
  
  getModulesByLanguage: (language: string): string[] => {
    const langProblems = problems.filter(p => p.language === language);
    const modules = new Set(langProblems.map(p => p.module || 'General'));
    return Array.from(modules);
  },

  getProblemsByModule: (language: string, module: string): Problem[] => {
    return problems.filter(p => p.language === language && (p.module || 'General') === module);
  },
  
  addProblem: (problem: Problem) => {
    problems.push(problem);
  },
  
  updateProblem: (updatedProblem: Problem) => {
    const index = problems.findIndex(p => p.id === updatedProblem.id);
    if (index !== -1) {
      problems[index] = updatedProblem;
    }
  },
  
  deleteProblem: (id: string) => {
    problems = problems.filter(p => p.id !== id);
  }
};