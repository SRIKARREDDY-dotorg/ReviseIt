import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Problem from '../models/Problem';
import { githubService } from '../services/githubService';
import { aiService } from '../services/aiService';

const router = express.Router();

// Get all problems for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, difficulty, topics, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filter: any = { userId: req.user!.id };
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (topics) {
      const topicsArray = Array.isArray(topics) ? topics : [topics];
      filter.topics = { $in: topicsArray };
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const problems = await Problem.find(filter)
      .sort(sort)
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Problem.countDocuments(filter);

    res.json({
      problems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ message: 'Failed to fetch problems' });
  }
});

// Get single problem
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const problem = await Problem.findOne({ 
      _id: req.params.id, 
      userId: req.user!.id 
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ message: 'Failed to fetch problem' });
  }
});

// Sync problems from GitHub
router.post('/sync', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { repository } = req.body;

    if (!repository) {
      return res.status(400).json({ message: 'Repository name required' });
    }

    // Get files from GitHub repository
    const files = await githubService.getRepositoryFiles(req.user!.accessToken, repository);
    
    let syncedCount = 0;
    let errors: string[] = [];

    for (const file of files) {
      try {
        // Parse the file content to extract problem data
        const problemData = await githubService.parseProblemFile(file.content);
        
        if (problemData) {
          // Check if problem already exists
          const existingProblem = await Problem.findOne({
            userId: req.user!.id,
            githubFilePath: file.path
          });

          if (existingProblem) {
            // Update existing problem
            existingProblem.solutionCode = problemData.solutionCode;
            existingProblem.leetcodeUrl = problemData.leetcodeUrl;
            await existingProblem.save();
          } else {
            // Get AI analysis for the problem
            const aiAnalysis = await aiService.analyzeProblem(problemData.solutionCode, problemData.leetcodeUrl);
            
            // Create new problem
            const newProblem = new Problem({
              userId: req.user!.id,
              leetcodeUrl: problemData.leetcodeUrl,
              title: problemData.title || 'Unknown Problem',
              solutionCode: problemData.solutionCode,
              difficulty: aiAnalysis.difficulty || 'Medium',
              topics: aiAnalysis.topics || [],
              patterns: aiAnalysis.patterns || [],
              githubFilePath: file.path,
              timeComplexity: aiAnalysis.timeComplexity,
              spaceComplexity: aiAnalysis.spaceComplexity
            });

            await newProblem.save();
            syncedCount++;
          }
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.path}:`, fileError);
        errors.push(`Failed to process ${file.path}`);
      }
    }

    res.json({
      message: `Synced ${syncedCount} problems`,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error syncing problems:', error);
    res.status(500).json({ message: 'Failed to sync problems' });
  }
});

// Update problem
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { confidenceScore, notes, timeComplexity, spaceComplexity } = req.body;

    const problem = await Problem.findOne({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (confidenceScore !== undefined) problem.confidenceScore = confidenceScore;
    if (notes !== undefined) problem.notes = notes;
    if (timeComplexity !== undefined) problem.timeComplexity = timeComplexity;
    if (spaceComplexity !== undefined) problem.spaceComplexity = spaceComplexity;

    await problem.save();

    res.json(problem);
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ message: 'Failed to update problem' });
  }
});

// Create problem manually
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, leetcodeUrl, solutionCode, difficulty } = req.body;

    if (!title || !leetcodeUrl || !solutionCode || !difficulty) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get AI analysis for the problem
    const aiAnalysis = await aiService.analyzeProblem(solutionCode, leetcodeUrl);
    
    // Create new problem
    const newProblem = new Problem({
      userId: req.user!.id,
      leetcodeUrl,
      title,
      solutionCode,
      difficulty,
      topics: aiAnalysis.topics || [],
      patterns: aiAnalysis.patterns || [],
      githubFilePath: 'manual', // Mark as manually created
      timeComplexity: aiAnalysis.timeComplexity,
      spaceComplexity: aiAnalysis.spaceComplexity
    });

    await newProblem.save();
    res.status(201).json(newProblem);
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ message: 'Failed to create problem' });
  }
});

// Delete problem
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const problem = await Problem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ message: 'Failed to delete problem' });
  }
});

// Clear all problems
router.delete('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await Problem.deleteMany({ userId: req.user!.id });
    res.json({ message: `Deleted ${result.deletedCount} problems` });
  } catch (error) {
    console.error('Error clearing problems:', error);
    res.status(500).json({ message: 'Failed to clear problems' });
  }
});

export default router;
