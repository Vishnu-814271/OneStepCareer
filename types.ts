export type Role = 'ADMIN' | 'STUDENT' | 'GUEST';
export type Difficulty = 'L0' | 'L1' | 'L2' | 'L3';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  isPaid?: boolean;
  plan?: 'STUDENT' | 'PROFESSIONAL';
  paymentStatus?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'NONE';
  joinedDate?: Date;
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
  score: number; // 0 to 100
  totalTests: number;
  passedTests: number;
  testResults: TestResult[];
  timeTaken: string;
  timestamp: Date;
}