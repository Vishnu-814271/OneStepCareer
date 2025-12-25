export type Role = 'ADMIN' | 'STUDENT' | 'GUEST';
export type Difficulty = 'L0' | 'L1' | 'L2';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  isPaid?: boolean;
  plan?: 'STUDENT' | 'PROFESSIONAL';
  paymentStatus?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'NONE';
  joinedDate?: Date;
  score?: number; // Total accumulated score
  completedProblems?: string[]; // IDs of solved problems
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  image: string;
  lessons: number;
  duration: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  text: string;
  timestamp: string; // ISO string for storage
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean; // Hidden test cases for grading
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: Difficulty;
  starterCode: string;
  testCases: TestCase[];
  module?: string; // e.g., "Basic Python", "Data Structures"
  points?: number;
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden: boolean;
}

export interface AssessmentSummary {
  problemId: string;
  score: number; // The points awarded (0 or Full)
  maxPoints: number; // The max points for this problem
  totalTests: number;
  passedTests: number;
  testResults: TestResult[];
  timeTaken: string;
  timestamp: Date;
}