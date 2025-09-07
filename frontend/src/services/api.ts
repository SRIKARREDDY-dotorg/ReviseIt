import axios from 'axios';
import type { User, Problem, RevisionSession, RevisionQueueItem, DashboardStats, AnalyticsData, AIAnalysis, SimilarProblem, StudyRecommendation, InterviewPrepPlan } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getGitHubUrl: () => api.get<{ url: string }>('/auth/github/url'),
  
  githubCallback: (code: string) =>
    api.post<{ token: string; user: User }>('/auth/github/callback', { code }),
};

// Problems API
export const problemsAPI = {
  getProblems: (params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    topics?: string[];
    sortBy?: string;
    sortOrder?: string;
  }) => api.get<{
    problems: Problem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>('/problems', { params }),

  getProblem: (id: string) => api.get<Problem>(`/problems/${id}`),

  syncProblems: (repository: string) =>
    api.post<{ message: string; syncedCount: number; errors?: string[] }>('/problems/sync', {
      repository,
    }),

  updateProblem: (id: string, data: {
    confidenceScore?: number;
    notes?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
  }) => api.put<Problem>(`/problems/${id}`, data),

  deleteProblem: (id: string) => api.delete(`/problems/${id}`),
};

// Revision API
export const revisionAPI = {
  getRevisionQueue: () => api.get<{
    queue: RevisionQueueItem[];
    generatedAt: Date;
  }>('/revision/queue'),

  completeRevision: (data: {
    problemId: string;
    performanceScore: number;
    timeTaken: number;
    notes?: string;
    wasCorrect: boolean;
    difficultyRating: number;
  }) => api.post<{
    message: string;
    revisionSession: RevisionSession;
    updatedProblem: {
      id: string;
      confidenceScore: number;
      revisionCount: number;
      lastRevised: Date;
    };
  }>('/revision/complete', data),

  getRevisionHistory: (problemId: string) => api.get<{
    problem: {
      id: string;
      title: string;
      difficulty: string;
      confidenceScore: number;
      revisionCount: number;
    };
    revisionHistory: RevisionSession[];
  }>(`/revision/history/${problemId}`),

  getRevisionStats: () => api.get<{
    revisionStats: {
      totalSessions: number;
      correctSessions: number;
      accuracyRate: number;
      averagePerformance: number;
      averageTime: number;
    };
    problemStats: Array<{
      _id: string;
      count: number;
      averageConfidence: number;
    }>;
    topicStats: Array<{
      _id: string;
      count: number;
    }>;
  }>('/revision/stats'),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get<{
    overview: DashboardStats;
    difficultyStats: AnalyticsData['difficultyStats'];
    weakAreas: AnalyticsData['weakAreas'];
    monthlyProgress: Array<{
      _id: string;
      sessions: number;
      correctSessions: number;
      averagePerformance: number;
    }>;
  }>('/analytics/dashboard'),

  getProblemsAnalytics: () => api.get<{
    topicDistribution: Array<{
      _id: string;
      count: number;
      averageConfidence: number;
      averageRevisions: number;
    }>;
    patternDistribution: Array<{
      _id: string;
      count: number;
      averageConfidence: number;
    }>;
    confidenceDistribution: Array<{
      _id: string | number;
      count: number;
      problems: string[];
    }>;
    mostRevisedProblems: Problem[];
    leastConfidentProblems: Problem[];
  }>('/analytics/problems'),

  getPerformanceAnalytics: (period = '30') => api.get<{
    performanceTrend: Array<{
      _id: string;
      averagePerformance: number;
      averageTime: number;
      accuracyRate: number;
      sessionCount: number;
    }>;
    performanceByDifficulty: Array<{
      _id: string;
      averagePerformance: number;
      averageTime: number;
      accuracyRate: number;
      sessionCount: number;
    }>;
    performanceByTopic: Array<{
      _id: string;
      averagePerformance: number;
      averageTime: number;
      accuracyRate: number;
      sessionCount: number;
    }>;
    improvementTrends: Array<{
      title: string;
      difficulty: string;
      currentConfidence: number;
      revisionCount: number;
      improvement: number;
    }>;
  }>(`/analytics/performance?period=${period}`),
};

// AI API
export const aiAPI = {
  getSimilarProblems: (problemId: string) => api.get<{
    originalProblem: {
      id: string;
      title: string;
      difficulty: string;
      topics: string[];
      patterns: string[];
    };
    similarProblems: SimilarProblem[];
  }>(`/ai/similar/${problemId}`),

  analyzeCode: (code: string, leetcodeUrl?: string) =>
    api.post<{ analysis: AIAnalysis; timestamp: Date }>('/ai/analyze', {
      code,
      leetcodeUrl,
    }),

  getOptimizationSuggestions: (problemId: string) => api.get<{
    problem: {
      id: string;
      title: string;
      difficulty: string;
      currentComplexity: {
        time?: string;
        space?: string;
      };
    };
    optimizationSuggestions: string[];
    additionalSuggestions: string[];
    patterns: string[];
    conceptsUsed: string[];
  }>(`/ai/optimize/${problemId}`),

  getStudyRecommendations: () => api.get<{
    recommendations: {
      priority: string;
      focusAreas: StudyRecommendation[];
      patternPractice: StudyRecommendation[];
      reviewProblems: Array<{
        id: string;
        title: string;
        difficulty: string;
        reason: string;
        daysSinceRevision: number;
        topics: string[];
      }>;
    };
    generatedAt: Date;
  }>('/ai/study-recommendations'),

  getInterviewPrep: () => api.get<{
    interviewPlan: InterviewPrepPlan;
    generatedAt: Date;
  }>('/ai/interview-prep'),
};

export default api;
