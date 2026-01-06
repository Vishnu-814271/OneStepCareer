
export type Role = 'ADMIN' | 'STUDENT' | 'GUEST';
export type Difficulty = 'L0' | 'L1' | 'L2' | 'GRAND';

export interface GlobalSettings {
  tabSwitchLimit: number;
  offScreenLimit: number; // Added
  allowCopyPaste: boolean;
  standardTimeLimit: number; // in seconds
  multipleAttempts: boolean; // Added
  maxAttempts: number; // Added
  scoreVisibility: boolean; // Added
  viewSolution: boolean; // Added
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  isSample?: boolean; // Added
}

// Added Course interface to fix import error in CourseCard.tsx
export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  lessons: number;
  duration: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string; // "Question Data"
  inputFormat?: string; // Added
  outputFormat?: string; // Added
  constraints?: string; // Added
  language: string; // Principal Language
  allowedLanguages?: string[]; // Added for multi-lang support
  difficulty: Difficulty;
  starterCode: string; // "Code Stub"
  sampleAnswer?: string; // Added
  testCases: TestCase[];
  module?: string;
  points?: number; // "Marks"
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  isPaid?: boolean;
  plan?: 'STUDENT' | 'PROFESSIONAL';
  paymentStatus?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'NONE';
  joinedDate?: Date;
  score?: number;
  completedProblems?: string[];
  completedGrandTests?: string[];
  unlockedProjects?: string[];
}

export interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  text: string;
  timestamp: string;
}

export interface ProjectDefinition {
  id: string;
  language: string;
  title: string;
  description: string;
  requirements: string[];
  difficulty: 'Capstone';
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden: boolean;
}

export interface ProblemAnalysis {
  problemId: string;
  title: string;
  score: number;
  isPerfect: boolean;
  testResults: TestResult[];
  referenceCode?: string;
}

export interface AssessmentSummary {
  problemId: string;
  score: number;
  maxPoints: number;
  totalTests: number;
  passedTests: number;
  testResults: TestResult[];
  problemAnalyses: ProblemAnalysis[];
  timeTaken: string;
  timestamp: Date;
  warningsCount: number;
}

export interface CourseModule {
  id: string;
  title: string;
  language: string;
  category: string;
  description: string;
  icon?: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    role: string;
  };
  summary: string;
  achievements: string[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  experience: {
    id: number;
    role: string;
    company: string;
    date: string;
    bullets: string[];
  }[];
  education: {
    id: number;
    degree: string;
    school: string;
    date: string;
  }[];
  projects: {
    id: number;
    name: string;
    description: string;
    techStack: string;
  }[];
}