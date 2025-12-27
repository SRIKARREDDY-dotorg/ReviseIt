import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Problem from '../models/Problem';
import RevisionSession from '../models/RevisionSession';

const router = express.Router();

// Get revision queue for authenticated user
router.get('/queue', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get problems for revision based on different criteria
    const revisionProblems: Array<{
      problem: any;
      priority: number;
      reason: 'weekly' | 'biweekly' | 'low_confidence' | 'interview_topic';
      dueDate: Date;
    }> = [];

    // 1. Problems solved 7 days ago (weekly revision)
    const weeklyProblems = await Problem.find({
      userId,
      lastRevised: {
        $gte: fourteenDaysAgo,
        $lte: sevenDaysAgo
      }
    }).limit(10);

    weeklyProblems.forEach(problem => {
      revisionProblems.push({
        problem,
        priority: 3,
        reason: 'weekly' as const,
        dueDate: new Date(problem.lastRevised.getTime() + 7 * 24 * 60 * 60 * 1000)
      });
    });

    // 2. Problems solved 14 days ago (biweekly revision)
    const biweeklyProblems = await Problem.find({
      userId,
      lastRevised: {
        $lte: fourteenDaysAgo
      }
    }).limit(5);

    biweeklyProblems.forEach(problem => {
      revisionProblems.push({
        problem,
        priority: 2,
        reason: 'biweekly' as const,
        dueDate: new Date(problem.lastRevised.getTime() + 14 * 24 * 60 * 60 * 1000)
      });
    });

    // 3. Problems with low confidence scores
    const lowConfidenceProblems = await Problem.find({
      userId,
      confidenceScore: { $lt: 7 }
    }).limit(8);

    lowConfidenceProblems.forEach(problem => {
      revisionProblems.push({
        problem,
        priority: 4,
        reason: 'low_confidence' as const,
        dueDate: now
      });
    });

    // 4. Interview-critical topics (graphs, trees, DP)
    const interviewTopics = ['Graph', 'Binary Tree', 'Dynamic Programming', 'Backtracking'];
    const interviewProblems = await Problem.find({
      userId,
      topics: { $in: interviewTopics },
      lastRevised: { $lte: sevenDaysAgo }
    }).limit(5);

    interviewProblems.forEach(problem => {
      revisionProblems.push({
        problem,
        priority: 5,
        reason: 'interview_topic' as const,
        dueDate: new Date(problem.lastRevised.getTime() + 5 * 24 * 60 * 60 * 1000)
      });
    });

    // Remove duplicates and sort by priority
    const uniqueProblems = revisionProblems.filter((item, index, self) =>
      index === self.findIndex(t => t.problem._id.toString() === item.problem._id.toString())
    );

    uniqueProblems.sort((a, b) => b.priority - a.priority);

    res.json({
      queue: uniqueProblems.slice(0, 20), // Limit to 20 problems
      generatedAt: now
    });
  } catch (error) {
    console.error('Error generating revision queue:', error);
    res.status(500).json({ message: 'Failed to generate revision queue' });
  }
});

// Complete a revision session
router.post('/complete', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      problemId,
      performanceScore,
      timeTaken,
      notes,
      wasCorrect,
      difficultyRating
    } = req.body;

    console.log(req.body);
    if (!problemId || performanceScore === undefined || timeTaken === undefined || 
        wasCorrect === undefined || difficultyRating === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify problem belongs to user
    const problem = await Problem.findOne({
      _id: problemId,
      userId: req.user!.id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Create revision session
    const revisionSession = new RevisionSession({
      problemId,
      userId: req.user!.id,
      performanceScore,
      timeTaken,
      notes: notes || '',
      wasCorrect,
      difficultyRating
    });

    await revisionSession.save();

    // Update problem's revision data
    problem.lastRevised = new Date();
    problem.revisionCount += 1;
    
    // Update confidence score based on performance
    const confidenceAdjustment = wasCorrect ? 
      Math.min(2, (performanceScore - 5) * 0.5) : 
      Math.max(-2, (performanceScore - 5) * 0.5);
    
    problem.confidenceScore = Math.max(1, Math.min(10, 
      problem.confidenceScore + confidenceAdjustment
    ));

    await problem.save();

    res.json({
      message: 'Revision session completed',
      revisionSession,
      updatedProblem: {
        id: problem.id,
        confidenceScore: problem.confidenceScore,
        revisionCount: problem.revisionCount,
        lastRevised: problem.lastRevised
      }
    });
  } catch (error) {
    console.error('Error completing revision session:', error);
    res.status(500).json({ message: 'Failed to complete revision session' });
  }
});

// Get revision history for a problem
router.get('/history/:problemId', authenticateToken, async (req: AuthRequest, res) => {
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

    const revisionHistory = await RevisionSession.find({
      problemId,
      userId: req.user!.id
    }).sort({ createdAt: -1 });

    res.json({
      problem: {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        confidenceScore: problem.confidenceScore,
        revisionCount: problem.revisionCount
      },
      revisionHistory
    });
  } catch (error) {
    console.error('Error fetching revision history:', error);
    res.status(500).json({ message: 'Failed to fetch revision history' });
  }
});

// Get revision statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get revision sessions from last 30 days
    const recentSessions = await RevisionSession.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Calculate statistics
    const totalSessions = recentSessions.length;
    const correctSessions = recentSessions.filter(s => s.wasCorrect).length;
    const averagePerformance = totalSessions > 0 ? 
      recentSessions.reduce((sum, s) => sum + s.performanceScore, 0) / totalSessions : 0;
    const averageTime = totalSessions > 0 ?
      recentSessions.reduce((sum, s) => sum + s.timeTaken, 0) / totalSessions : 0;

    // Get problems by difficulty
    const problemStats = await Problem.aggregate([
      { $match: { userId: req.user!._id } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          averageConfidence: { $avg: '$confidenceScore' }
        }
      }
    ]);

    // Get topic distribution
    const topicStats = await Problem.aggregate([
      { $match: { userId: req.user!._id } },
      { $unwind: '$topics' },
      {
        $group: {
          _id: '$topics',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      revisionStats: {
        totalSessions,
        correctSessions,
        accuracyRate: totalSessions > 0 ? (correctSessions / totalSessions) * 100 : 0,
        averagePerformance: Math.round(averagePerformance * 100) / 100,
        averageTime: Math.round(averageTime)
      },
      problemStats,
      topicStats
    });
  } catch (error) {
    console.error('Error fetching revision stats:', error);
    res.status(500).json({ message: 'Failed to fetch revision statistics' });
  }
});

export default router;
