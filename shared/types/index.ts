export interface User {
  id: string;
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  accessToken: string;
  repositories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Problem {
  id: string;
  userId: string;
  leetcodeUrl: string;
  title: string;
  solutionCode: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  patterns: string[];
  confidenceScore: number;
  lastRevised: Date;
  revisionCount: number;
  githubFilePath: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RevisionSession {
  id: string;
  problemId: string;
  userId: string;
  date: Date;
  performanceScore: number;
  timeTaken: number;
  notes: string;
  wasCorrect: boolean;
  difficultyRating: number;
  createdAt: Date;
}

export interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  problems: string[];
  targetDate: Date;
  isActive: boolean;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysis {
  problemId: string;
  patterns: string[];
  similarProblems: string[];
  optimizationSuggestions: string[];
  conceptsUsed: string[];
  difficultyJustification: string;
  timeComplexityAnalysis: string;
  spaceComplexityAnalysis: string;
}

export interface RevisionQueue {
  userId: string;
  problems: {
    problemId: string;
    priority: number;
    reason: 'weekly' | 'biweekly' | 'low_confidence' | 'interview_topic';
    dueDate: Date;
  }[];
  generatedAt: Date;
}

export interface GitHubFile {
  path: string;
  content: string;
  sha: string;
  url: string;
}

export interface LeetCodeProblem {
  titleSlug: string;
  title: string;
  difficulty: string;
  topicTags: Array<{
    name: string;
    slug: string;
  }>;
  content: string;
}
