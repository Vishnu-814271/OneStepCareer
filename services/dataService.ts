import { User, Problem } from '../types';

// Initial Mock Data
let users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@technexus.com', role: 'ADMIN', isPaid: true, paymentStatus: 'APPROVED', joinedDate: new Date('2023-01-01') },
  { id: '2', name: 'Student User', email: 'student@technexus.com', role: 'STUDENT', isPaid: true, plan: 'STUDENT', paymentStatus: 'APPROVED', joinedDate: new Date('2023-05-15') },
  { id: '3', name: 'New Joiner', email: 'new@technexus.com', role: 'STUDENT', isPaid: false, paymentStatus: 'NONE', joinedDate: new Date() }
];

// Initial Languages
let languages: string[] = ['Python', 'Java', 'C', 'C++', 'JavaScript'];

let problems: Problem[] = [
  // PYTHON - BASICS MODULE
  {
    id: 'py-l0-1',
    title: 'Hello TechNexus',
    description: 'Write a script that accepts a name as input and prints "Hello, [Name]!".',
    language: 'Python',
    module: 'Basics',
    difficulty: 'L0',
    starterCode: '# Read input\nname = input()\n# Print output',
    testCases: [
      { input: 'TechNexus', expectedOutput: 'Hello, TechNexus!', isHidden: false },
      { input: 'Student', expectedOutput: 'Hello, Student!', isHidden: true }
    ]
  },
  {
    id: 'py-l1-1',
    title: 'Sum of Inputs',
    description: 'Read two integers from input (on separate lines) and print their sum.',
    language: 'Python',
    module: 'Basics',
    difficulty: 'L1',
    starterCode: 'a = int(input())\nb = int(input())\n# Print sum',
    testCases: [
      { input: '10\n20', expectedOutput: '30', isHidden: false },
      { input: '-5\n5', expectedOutput: '0', isHidden: true },
      { input: '100\n200', expectedOutput: '300', isHidden: true }
    ]
  },
  
  // PYTHON - DATA STRUCTURES MODULE
  {
    id: 'py-l2-1',
    title: 'Character Frequency',
    description: 'Read a string from input. Print the count of the character "a" (lowercase) in the string.',
    language: 'Python',
    module: 'Data Structures',
    difficulty: 'L2',
    starterCode: 'text = input()\n# Count "a"',
    testCases: [
      { input: 'banana', expectedOutput: '3', isHidden: false },
      { input: 'apple', expectedOutput: '1', isHidden: true },
      { input: 'sky', expectedOutput: '0', isHidden: true }
    ]
  },

  // JAVA PROBLEMS
  {
    id: 'java-l0-1',
    title: 'Java Printing',
    description: 'Write a program that prints "Java is fun" to the console.',
    language: 'Java',
    module: 'Basics',
    difficulty: 'L0',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Java is fun");\n    }\n}',
    testCases: [
      { input: '', expectedOutput: 'Java is fun', isHidden: false }
    ]
  }
];

export const dataService = {
  // USER OPERATIONS
  getUsers: (): User[] => [...users],
  
  registerUser: (user: User): boolean => {
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return false; // User exists
    }
    users.push({ ...user, joinedDate: new Date(), isPaid: false, paymentStatus: 'NONE' }); 
    return true;
  },

  // Student submits payment for approval
  submitPaymentRequest: (userId: string, plan: 'STUDENT' | 'PROFESSIONAL') => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.paymentStatus = 'PENDING_APPROVAL';
      user.plan = plan;
      user.isPaid = false; // Remains false until admin approves
    }
    return user;
  },

  // Admin approves payment
  approvePayment: (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.paymentStatus = 'APPROVED';
      user.isPaid = true;
    }
    return user;
  },

  // Admin rejects payment
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
  
  // Get unique modules for a language
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