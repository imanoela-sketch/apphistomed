export enum AppTab {
  LIBRARY = 'LIBRARY',
  QUIZ = 'QUIZ',
  MICROSCOPE = 'MICROSCOPE',
  MINDMAP = 'MINDMAP',
  STUDENT_LOGS = 'STUDENT_LOGS',
}

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

export interface StudentLog {
  name: string;
  email: string;
  date: string;
}

export interface Topic {
  id: string;
  title: string;
  category: 'Tecidos Básicos' | 'Sistemas';
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  history: { questionId: number; correct: boolean }[];
}

export interface MicroscopeAnalysis {
  tissueType: string;
  features: string[];
  diagnosis: string;
  description: string;
}

export interface MindMapItem {
  id: string;
  title: string;
  url: string;
  dateAdded: Date;
}