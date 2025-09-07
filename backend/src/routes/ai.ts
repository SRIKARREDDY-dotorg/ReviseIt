import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Problem from '../models/Problem';
import { aiService } from '../services/aiService';

const router = express.Router();

// Get similar problems for a given problem
router.get('/similar/:problemId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { problemId } = req.params;

    // Verify problem belongs to user
    const problem = await Problem.findOne({
      _id: problemId,
      userId: req.user!.id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Find similar problems based on patterns and topics
    const similarProblems = await Problem.find({
      userId: req.user!.id,
      _id: { $ne: problemId },
      $or: [
        { patterns: { $in: problem.patterns } },
        { topics: { $in: problem.topics } }
      ]
    })
    .limit(10)
    .select('title difficulty topics patterns confidenceScore leetcodeUrl');

    // Calculate similarity scores
    const problemsWithScores = similarProblems.map(similarProblem => {
      const patternMatches = problem.patterns.filter(pattern => 
        similarProblem.patterns.includes(pattern)
      ).length;
      
      const topicMatches = problem.topics.filter(topic => 
        similarProblem.topics.includes(topic)
      ).length;

      const similarityScore = (patternMatches * 2 + topicMatches) / 
        (problem.patterns.length + problem.topics.length);

      return {
        ...similarProblem.toObject(),
        similarityScore: Math.round(similarityScore * 100) / 100
      };
    });

    // Sort by similarity score
    problemsWithScores.sort((a, b) => b.similarityScore - a.similarityScore);

    res.json({
      originalProblem: {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        topics: problem.topics,
        patterns: problem.patterns
      },
      similarProblems: problemsWithScores
    });
  } catch (error) {
    console.error('Error finding similar problems:', error);
    res.status(500).json({ message: 'Failed to find similar problems' });
  }
});

// Analyze a problem's code
router.post('/analyze', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { code, leetcodeUrl } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }

    // Get AI analysis
    const analysis = await aiService.analyzeProblem(code, leetcodeUrl || '');

    res.json({
      analysis,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ message: 'Failed to analyze code' });
  }
});

// Get optimization suggestions for a problem
router.get('/optimize/:problemId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { problemId } = req.params;

    // Verify problem belongs to user
    const problem = await Problem.findOne({
      _id: problemId,
      userId: req.user!.id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Generate optimization suggestions
    const suggestions = await aiService.generateOptimizationSuggestions(problem.solutionCode);

    // Get re-analysis of the code for updated suggestions
    const analysis = await aiService.analyzeProblem(problem.solutionCode, problem.leetcodeUrl);

    res.json({
      problem: {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        currentComplexity: {
          time: problem.timeComplexity,
          space: problem.spaceComplexity
        }
      },
      optimizationSuggestions: analysis.optimizationSuggestions,
      additionalSuggestions: suggestions,
      patterns: analysis.patterns,
      conceptsUsed: analysis.conceptsUsed
    });
  } catch (error) {
    console.error('Error generating optimization suggestions:', error);
    res.status(500).json({ message: 'Failed to generate optimization suggestions' });
  }
});

// Get study recommendations based on weak areas
router.get('/study-recommendations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Find weak areas (topics with low confidence scores)
    const weakAreas = await Problem.aggregate([
      { $match: { userId: req.user!._id } },
      { $unwind: '$topics' },
      {
        $group: {
          _id: '$topics',
          averageConfidence: { $avg: '$confidenceScore' },
          problemCount: { $sum: 1 },
          problems: { $push: { id: '$_id', title: '$title', difficulty: '$difficulty' } }
        }
      },
      { $match: { averageConfidence: { $lt: 7 } } },
      { $sort: { averageConfidence: 1 } },
      { $limit: 5 }
    ]);

    // Find patterns that need more practice
    const weakPatterns = await Problem.aggregate([
      { $match: { userId: req.user!._id } },
      { $unwind: '$patterns' },
      {
        $group: {
          _id: '$patterns',
          averageConfidence: { $avg: '$confidenceScore' },
          problemCount: { $sum: 1 },
          problems: { $push: { id: '$_id', title: '$title', difficulty: '$difficulty' } }
        }
      },
      { $match: { averageConfidence: { $lt: 7 } } },
      { $sort: { averageConfidence: 1 } },
      { $limit: 5 }
    ]);

    // Find problems that haven't been revised in a while
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const staleProblems = await Problem.find({
      userId,
      lastRevised: { $lte: sevenDaysAgo },
      confidenceScore: { $gte: 7 } // Only include problems that were once confident
    })
    .sort({ lastRevised: 1 })
    .limit(10)
    .select('title difficulty topics patterns lastRevised confidenceScore');

    // Generate study plan recommendations
    const recommendations = {
      priority: 'high',
      focusAreas: weakAreas.map(area => ({
        topic: area._id,
        reason: 'Low confidence score',
        averageConfidence: Math.round(area.averageConfidence * 10) / 10,
        problemCount: area.problemCount,
        recommendedProblems: area.problems.slice(0, 3)
      })),
      patternPractice: weakPatterns.map(pattern => ({
        pattern: pattern._id,
        reason: 'Needs more practice',
        averageConfidence: Math.round(pattern.averageConfidence * 10) / 10,
        problemCount: pattern.problemCount,
        recommendedProblems: pattern.problems.slice(0, 3)
      })),
      reviewProblems: staleProblems.map(problem => ({
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        reason: 'Not revised recently',
        daysSinceRevision: Math.floor((Date.now() - problem.lastRevised.getTime()) / (24 * 60 * 60 * 1000)),
        topics: problem.topics
      }))
    };

    res.json({
      recommendations,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generating study recommendations:', error);
    res.status(500).json({ message: 'Failed to generate study recommendations' });
  }
});

// Get interview preparation suggestions
router.get('/interview-prep', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Define interview-critical topics
    const interviewTopics = [
      'Array', 'String', 'Linked List', 'Binary Tree', 'Graph',
      'Dynamic Programming', 'Backtracking', 'Stack', 'Queue',
      'Heap', 'Hash Table', 'Two Pointers', 'Sliding Window'
    ];

    // Check coverage of interview topics
    const topicCoverage = await Problem.aggregate([
      { $match: { userId: req.user!._id } },
      { $unwind: '$topics' },
      { $match: { topics: { $in: interviewTopics } } },
      {
        $group: {
          _id: '$topics',
          problemCount: { $sum: 1 },
          averageConfidence: { $avg: '$confidenceScore' },
          difficulties: { $push: '$difficulty' }
        }
      }
    ]);

    // Find missing topics
    const coveredTopics = topicCoverage.map(t => t._id);
    const missingTopics = interviewTopics.filter(topic => !coveredTopics.includes(topic));

    // Find weak interview topics
    const weakInterviewTopics = topicCoverage
      .filter(topic => topic.averageConfidence < 8)
      .sort((a, b) => a.averageConfidence - b.averageConfidence);

    // Get problems for each difficulty level in covered topics
    const difficultyBalance = await Problem.aggregate([
      { $match: { userId: req.user!._id, topics: { $in: interviewTopics } } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          averageConfidence: { $avg: '$confidenceScore' }
        }
      }
    ]);

    // Generate interview prep plan
    const interviewPlan = {
      readinessScore: Math.round(
        (coveredTopics.length / interviewTopics.length) * 
        (topicCoverage.reduce((sum, t) => sum + t.averageConfidence, 0) / topicCoverage.length || 0) * 
        10
      ) / 10,
      
      strengths: topicCoverage
        .filter(topic => topic.averageConfidence >= 8)
        .map(topic => ({
          topic: topic._id,
          confidence: Math.round(topic.averageConfidence * 10) / 10,
          problemCount: topic.problemCount
        })),
      
      weaknesses: weakInterviewTopics.map(topic => ({
        topic: topic._id,
        confidence: Math.round(topic.averageConfidence * 10) / 10,
        problemCount: topic.problemCount,
        priority: topic.averageConfidence < 6 ? 'high' : 'medium'
      })),
      
      missingTopics: missingTopics.map(topic => ({
        topic,
        priority: 'high',
        reason: 'No problems solved in this area'
      })),
      
      difficultyBalance,
      
      recommendations: [
        ...missingTopics.length > 0 ? [`Focus on missing topics: ${missingTopics.join(', ')}`] : [],
        ...weakInterviewTopics.length > 0 ? [`Strengthen weak areas: ${weakInterviewTopics.slice(0, 3).map(t => t._id).join(', ')}`] : [],
        'Practice problems of varying difficulties',
        'Focus on explaining your thought process',
        'Time yourself while solving problems'
      ]
    };

    res.json({
      interviewPlan,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generating interview prep suggestions:', error);
    res.status(500).json({ message: 'Failed to generate interview prep suggestions' });
  }
});

export default router;
