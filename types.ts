
export type Role = 'ADMIN' | 'STUDENT' | 'GUEST' | 'FACULTY';
export type Difficulty = 'L0' | 'L1' | 'L2' | 'GRAND';

export interface GlobalSettings {
  tabSwitchLimit: number;
  offScreenLimit: number;
  allowCopyPaste: boolean;
  standardTimeLimit: number;
  multipleAttempts: boolean;
  maxAttempts: number;
  scoreVisibility: boolean;
  viewSolution: boolean;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  isSample?: boolean;
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

export interface Problem {
  id: string;
  title: string;
  description: string; 
  inputFormat?: string; 
  outputFormat?: string; 
  constraints?: string; 
  language: string; 
  allowedLanguages?: string[]; 
  difficulty: Difficulty;
  starterCode: string; 
  sampleAnswer?: string; 
  testCases: TestCase[];
  module?: string;
  points?: number; 
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string;
  college?: string; // Links student to a faculty/college
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
  maxScore: number;
  isPerfect: boolean;
  testResults: TestResult[];
  referenceCode?: string;
  status: 'CORRECT' | 'WRONG' | 'SKIPPED';
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

export interface LearningRecommendation {
  recommendedModule: string;
  targetLanguage: string;
  reasoning: string;
  estimatedEffort: string;
  focusArea: string;
}
