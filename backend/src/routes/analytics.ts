import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Problem from '../models/Problem';
import RevisionSession from '../models/RevisionSession';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total problems count
    const totalProblems = await Problem.countDocuments({ userId });

    // Problems by difficulty
    const difficultyStats = await Problem.aggregate([
      { $match: { userId: req.user!._id } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          averageConfidence: { $avg: '$confidenceScore' }
        }
      }
    ]);

    // Recent activity (last 7 days)
    const recentSessions = await RevisionSession.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentActivity = {
      totalSessions: recentSessions.length,
      correctSessions: recentSessions.filter(s => s.wasCorrect).length,
      averagePerformance: recentSessions.length > 0 ? 
        recentSessions.reduce((sum, s) => sum + s.performanceScore, 0) / recentSessions.length : 0
    };

    // Problems due for revision
    const problemsDueForRevision = await Problem.countDocuments({
      userId,
      $or: [
        { lastRevised: { $lte: sevenDaysAgo } },
        { confidenceScore: { $lt: 7 } }
      ]
    });

    // Top weak areas (topics with low confidence)
    const weakAreas = await Problem.aggregate([
      { $match: { userId: req.user!._id, confidenceScore: { $lt: 7 } } },
      { $unwind: '$topics' },
      {
        $group: {
          _id: '$topics',
          count: { $sum: 1 },
          averageConfidence: { $avg: '$confidenceScore' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Monthly progress (last 30 days)
    const monthlyProgress = await RevisionSession.aggregate([
      { 
        $match: { 
          userId: req.user!._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          sessions: { $sum: 1 },
          correctSessions: {
            $sum: { $cond: ['$wasCorrect', 1, 0] }
          },
          averagePerformance: { $avg: '$performanceScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        totalProblems,
        problemsDueForRevision,
        recentActivity
      },
      difficultyStats,
      weakAreas,
      monthlyProgress
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard analytics' });
  }
});

// Get detailed problem analytics
router.get('/problems', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Topic distribution
    const topicDistribution = await Problem.aggregate([
      { $match: { userId: req.user!._id } },
      { $unwind: '$topics' },
      {
        $group: {
          _id: '$topics',
          count: { $sum: 1 },
          averageConfidence: { $avg: '$confidenceScore' },
          averageRevisions: { $avg: '$revisionCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Pattern distribution
    const patternDistribution = await Problem.aggregate([
      { $match: { userId: req.user!._id } },
      { $unwind: '$patterns' },
      {
        $group: {
          _id: '$patterns',
          count: { $sum: 1 },
          averageConfidence: { $avg: '$confidenceScore' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Confidence score distribution
    const confidenceDistribution = await Problem.aggregate([
      { $match: { userId: req.user!._id } },
      {
        $bucket: {
          groupBy: '$confidenceScore',
          boundaries: [1, 3, 5, 7, 9, 11],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            problems: { $push: '$title' }
          }
        }
      }
    ]);

    // Most revised problems
    const mostRevisedProblems = await Problem.find({ userId })
      .sort({ revisionCount: -1 })
      .limit(10)
      .select('title difficulty revisionCount confidenceScore topics');

    // Least confident problems
    const leastConfidentProblems = await Problem.find({ userId })
      .sort({ confidenceScore: 1 })
      .limit(10)
      .select('title difficulty confidenceScore topics lastRevised');

    res.json({
      topicDistribution,
      patternDistribution,
      confidenceDistribution,
      mostRevisedProblems,
      leastConfidentProblems
    });
  } catch (error) {
    console.error('Error fetching problem analytics:', error);
    res.status(500).json({ message: 'Failed to fetch problem analytics' });
  }
});

// Get performance trends
router.get('/performance', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;
    
    const daysBack = parseInt(period as string);
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Performance over time
    const performanceTrend = await RevisionSession.aggregate([
      { 
        $match: { 
          userId: req.user!._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          averagePerformance: { $avg: '$performanceScore' },
          averageTime: { $avg: '$timeTaken' },
          accuracyRate: {
            $avg: { $cond: ['$wasCorrect', 1, 0] }
          },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Performance by difficulty
    const performanceByDifficulty = await RevisionSession.aggregate([
      { 
        $match: { 
          userId: req.user!._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$problem.difficulty',
          averagePerformance: { $avg: '$performanceScore' },
          averageTime: { $avg: '$timeTaken' },
          accuracyRate: {
            $avg: { $cond: ['$wasCorrect', 1, 0] }
          },
          sessionCount: { $sum: 1 }
        }
      }
    ]);

    // Performance by topic
    const performanceByTopic = await RevisionSession.aggregate([
      { 
        $match: { 
          userId: req.user!._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      { $unwind: '$problem.topics' },
      {
        $group: {
          _id: '$problem.topics',
          averagePerformance: { $avg: '$performanceScore' },
          averageTime: { $avg: '$timeTaken' },
          accuracyRate: {
            $avg: { $cond: ['$wasCorrect', 1, 0] }
          },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { sessionCount: -1 } },
      { $limit: 10 }
    ]);

    // Improvement trends (confidence score changes)
    const improvementTrends = await Problem.aggregate([
      { $match: { userId: req.user!._id, revisionCount: { $gt: 0 } } },
      {
        $lookup: {
          from: 'revisionsessions',
          localField: '_id',
          foreignField: 'problemId',
          as: 'sessions'
        }
      },
      {
        $project: {
          title: 1,
          difficulty: 1,
          currentConfidence: '$confidenceScore',
          revisionCount: 1,
          firstSession: { $arrayElemAt: ['$sessions', -1] },
          lastSession: { $arrayElemAt: ['$sessions', 0] }
        }
      },
      {
        $project: {
          title: 1,
          difficulty: 1,
          currentConfidence: 1,
          revisionCount: 1,
          improvement: {
            $subtract: ['$lastSession.performanceScore', '$firstSession.performanceScore']
          }
        }
      },
      { $sort: { improvement: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      performanceTrend,
      performanceByDifficulty,
      performanceByTopic,
      improvementTrends
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ message: 'Failed to fetch performance analytics' });
  }
});

export default router;
