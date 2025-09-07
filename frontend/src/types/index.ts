export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  repositories: string[];
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

export interface RevisionQueueItem {
  problem: Problem;
  priority: number;
  reason: 'weekly' | 'biweekly' | 'low_confidence' | 'interview_topic';
  dueDate: Date;
}

export interface DashboardStats {
  totalProblems: number;
  problemsDueForRevision: number;
  recentActivity: {
    totalSessions: number;
    correctSessions: number;
    averagePerformance: number;
  };
}

export interface AnalyticsData {
  difficultyStats: Array<{
    _id: string;
    count: number;
    averageConfidence: number;
  }>;
  topicStats: Array<{
    _id: string;
    count: number;
  }>;
  weakAreas: Array<{
    _id: string;
    count: number;
    averageConfidence: number;
  }>;
}

export interface AIAnalysis {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  patterns: string[];
  timeComplexity: string;
  spaceComplexity: string;
  optimizationSuggestions: string[];
  conceptsUsed: string[];
  similarProblems: string[];
}

export interface SimilarProblem extends Problem {
  similarityScore: number;
}

export interface StudyRecommendation {
  topic?: string;
  pattern?: string;
  reason: string;
  averageConfidence: number;
  problemCount: number;
  recommendedProblems: Array<{
    id: string;
    title: string;
    difficulty: string;
  }>;
}

export interface InterviewPrepPlan {
  readinessScore: number;
  strengths: Array<{
    topic: string;
    confidence: number;
    problemCount: number;
  }>;
  weaknesses: Array<{
    topic: string;
    confidence: number;
    problemCount: number;
    priority: 'high' | 'medium';
  }>;
  missingTopics: Array<{
    topic: string;
    priority: 'high' | 'medium';
    reason: string;
  }>;
  recommendations: string[];
}
