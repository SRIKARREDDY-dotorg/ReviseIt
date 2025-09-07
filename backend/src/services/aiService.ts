export interface AIAnalysisResult {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  patterns: string[];
  timeComplexity: string;
  spaceComplexity: string;
  optimizationSuggestions: string[];
  conceptsUsed: string[];
  similarProblems: string[];
}

class AIService {
  async analyzeProblem(solutionCode: string, leetcodeUrl: string): Promise<AIAnalysisResult> {
    try {
      // For now, we'll implement a basic pattern recognition system
      // In a real implementation, you would integrate with OpenAI API or similar
      
      const analysis = this.analyzeCodePatterns(solutionCode);
      const difficulty = this.estimateDifficulty(solutionCode, analysis.patterns);
      
      return {
        difficulty,
        topics: analysis.topics,
        patterns: analysis.patterns,
        timeComplexity: analysis.timeComplexity,
        spaceComplexity: analysis.spaceComplexity,
        optimizationSuggestions: analysis.optimizationSuggestions,
        conceptsUsed: analysis.conceptsUsed,
        similarProblems: [] // Would be populated by similarity matching
      };
    } catch (error) {
      console.error('Error analyzing problem:', error);
      
      // Return default analysis
      return {
        difficulty: 'Medium',
        topics: ['Unknown'],
        patterns: ['Unknown'],
        timeComplexity: 'O(?)',
        spaceComplexity: 'O(?)',
        optimizationSuggestions: [],
        conceptsUsed: [],
        similarProblems: []
      };
    }
  }

  private analyzeCodePatterns(code: string): {
    topics: string[];
    patterns: string[];
    timeComplexity: string;
    spaceComplexity: string;
    optimizationSuggestions: string[];
    conceptsUsed: string[];
  } {
    const topics: string[] = [];
    const patterns: string[] = [];
    const conceptsUsed: string[] = [];
    const optimizationSuggestions: string[] = [];
    
    const lowerCode = code.toLowerCase();

    // Data Structure Detection
    if (lowerCode.includes('listnode') || lowerCode.includes('linked')) {
      topics.push('Linked List');
      conceptsUsed.push('Linked List Traversal');
    }
    
    if (lowerCode.includes('treenode') || lowerCode.includes('tree')) {
      topics.push('Binary Tree');
      conceptsUsed.push('Tree Traversal');
    }
    
    if (lowerCode.includes('graph') || lowerCode.includes('adjacency')) {
      topics.push('Graph');
      conceptsUsed.push('Graph Traversal');
    }
    
    if (lowerCode.includes('stack') || lowerCode.includes('push') && lowerCode.includes('pop')) {
      topics.push('Stack');
      conceptsUsed.push('Stack Operations');
    }
    
    if (lowerCode.includes('queue') || lowerCode.includes('deque')) {
      topics.push('Queue');
      conceptsUsed.push('Queue Operations');
    }
    
    if (lowerCode.includes('heap') || lowerCode.includes('priority')) {
      topics.push('Heap');
      conceptsUsed.push('Heap Operations');
    }

    // Algorithm Pattern Detection
    if (lowerCode.includes('dp') || lowerCode.includes('memo') || 
        (lowerCode.includes('for') && lowerCode.includes('range') && lowerCode.includes('+'))) {
      patterns.push('Dynamic Programming');
      conceptsUsed.push('Memoization');
    }
    
    if (lowerCode.includes('left') && lowerCode.includes('right') && 
        (lowerCode.includes('while') || lowerCode.includes('for'))) {
      patterns.push('Two Pointers');
      conceptsUsed.push('Two Pointer Technique');
    }
    
    if (lowerCode.includes('sliding') || 
        (lowerCode.includes('window') && lowerCode.includes('left') && lowerCode.includes('right'))) {
      patterns.push('Sliding Window');
      conceptsUsed.push('Sliding Window Technique');
    }
    
    if (lowerCode.includes('dfs') || lowerCode.includes('recursion') || 
        lowerCode.includes('def') && lowerCode.includes('return')) {
      patterns.push('Depth-First Search');
      conceptsUsed.push('Recursion');
    }
    
    if (lowerCode.includes('bfs') || lowerCode.includes('queue') && lowerCode.includes('level')) {
      patterns.push('Breadth-First Search');
      conceptsUsed.push('Level-order Traversal');
    }
    
    if (lowerCode.includes('binary search') || 
        (lowerCode.includes('mid') && lowerCode.includes('left') && lowerCode.includes('right'))) {
      patterns.push('Binary Search');
      conceptsUsed.push('Binary Search');
    }
    
    if (lowerCode.includes('backtrack') || 
        (lowerCode.includes('recursion') && lowerCode.includes('remove'))) {
      patterns.push('Backtracking');
      conceptsUsed.push('Backtracking');
    }
    
    if (lowerCode.includes('greedy') || lowerCode.includes('sort') && lowerCode.includes('max')) {
      patterns.push('Greedy');
      conceptsUsed.push('Greedy Algorithm');
    }

    // Complexity Analysis
    let timeComplexity = 'O(n)';
    let spaceComplexity = 'O(1)';
    
    if (lowerCode.includes('for') && lowerCode.includes('for')) {
      timeComplexity = 'O(n²)';
    } else if (lowerCode.includes('sort')) {
      timeComplexity = 'O(n log n)';
    } else if (lowerCode.includes('binary search') || lowerCode.includes('log')) {
      timeComplexity = 'O(log n)';
    }
    
    if (lowerCode.includes('recursion') || lowerCode.includes('stack') || 
        lowerCode.includes('queue') || lowerCode.includes('dp')) {
      spaceComplexity = 'O(n)';
    }

    // Optimization Suggestions
    if (lowerCode.includes('for') && lowerCode.includes('for') && !lowerCode.includes('dp')) {
      optimizationSuggestions.push('Consider using a hash map to reduce time complexity');
    }
    
    if (lowerCode.includes('sort') && !lowerCode.includes('binary search')) {
      optimizationSuggestions.push('Consider if sorting is necessary or if a different approach exists');
    }
    
    if (lowerCode.includes('recursion') && !lowerCode.includes('memo')) {
      optimizationSuggestions.push('Consider memoization to avoid redundant calculations');
    }

    return {
      topics: topics.length > 0 ? topics : ['Array'],
      patterns: patterns.length > 0 ? patterns : ['Iteration'],
      timeComplexity,
      spaceComplexity,
      optimizationSuggestions,
      conceptsUsed: conceptsUsed.length > 0 ? conceptsUsed : ['Basic Programming']
    };
  }

  private estimateDifficulty(code: string, patterns: string[]): 'Easy' | 'Medium' | 'Hard' {
    let difficultyScore = 0;
    
    // Base difficulty factors
    if (patterns.includes('Dynamic Programming')) difficultyScore += 3;
    if (patterns.includes('Backtracking')) difficultyScore += 3;
    if (patterns.includes('Graph')) difficultyScore += 2;
    if (patterns.includes('Binary Tree')) difficultyScore += 2;
    if (patterns.includes('Two Pointers')) difficultyScore += 1;
    if (patterns.includes('Sliding Window')) difficultyScore += 1;
    
    // Code complexity factors
    const lines = code.split('\n').length;
    if (lines > 50) difficultyScore += 2;
    else if (lines > 25) difficultyScore += 1;
    
    if (code.includes('recursion') && code.includes('for')) difficultyScore += 1;
    
    if (difficultyScore >= 4) return 'Hard';
    if (difficultyScore >= 2) return 'Medium';
    return 'Easy';
  }

  async findSimilarProblems(problemId: string, patterns: string[], topics: string[]): Promise<string[]> {
    // This would implement similarity matching logic
    // For now, return empty array
    return [];
  }

  async generateOptimizationSuggestions(code: string): Promise<string[]> {
    // This would use AI to generate specific optimization suggestions
    // For now, return basic suggestions based on patterns
    const suggestions: string[] = [];
    
    if (code.includes('nested loop')) {
      suggestions.push('Consider using a hash map to eliminate nested loops');
    }
    
    if (code.includes('sort') && code.includes('linear search')) {
      suggestions.push('Use binary search after sorting for better performance');
    }
    
    return suggestions;
  }
}

export const aiService = new AIService();
