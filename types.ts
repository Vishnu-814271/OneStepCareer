
export type Role = 'ADMIN' | 'STUDENT' | 'GUEST';
export type Difficulty = 'L0' | 'L1' | 'L2';

export interface GlobalSettings {
  tabSwitchLimit: number;
  allowCopyPaste: boolean;
  standardTimeLimit: number; // in seconds
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
}

export interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  text: string;
  timestamp: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: Difficulty;
  starterCode: string;
  testCases: TestCase[];
  module?: string;
  points?: number;
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

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  lessons: number;
  duration: string;
}

export interface CourseModule {
  id: string;
  title: string;
  language: string;
  category: string; // Added category for hierarchy
  description: string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

// --- NEW RESUME TYPES ---
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
