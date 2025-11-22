import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;

  private getOpenAI(): OpenAI | null {
    if (!process.env.OPENAI_API_KEY) return null;
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.openai;
  }

  private getGemini(): GoogleGenerativeAI | null {
    if (!process.env.GEMINI_API_KEY) return null;
    if (!this.gemini) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return this.gemini;
  }

  async analyzeProblem(solutionCode: string, leetcodeUrl: string): Promise<AIAnalysisResult> {
    try {
      const gemini = this.getGemini();
      if (gemini) {
        const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `Analyze this LeetCode solution and return ONLY valid JSON:

Code:
${solutionCode}

URL: ${leetcodeUrl}

Return this exact JSON format:
{
  "difficulty": "Easy|Medium|Hard",
  "topics": ["topic1", "topic2"],
  "patterns": ["pattern1", "pattern2"],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "optimizationSuggestions": ["suggestion1", "suggestion2"],
  "conceptsUsed": ["concept1", "concept2"],
  "similarProblems": ["problem1", "problem2"]
}`;
        
        const result = await model.generateContent(prompt);
        const content = result.response.text();
        const jsonContent = this.extractJSON(content);
        const analysis = JSON.parse(jsonContent) as AIAnalysisResult;
        return this.validateAnalysis(analysis);
      }

      const openai = this.getOpenAI();
      if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Analyze this LeetCode solution and return ONLY valid JSON:\n\nCode:\n${solutionCode}\n\nReturn exact format: {"difficulty":"Easy|Medium|Hard","topics":[],"patterns":[],"timeComplexity":"","spaceComplexity":"","optimizationSuggestions":[],"conceptsUsed":[],"similarProblems":[]}` }],
          temperature: 0.3,
          max_tokens: 1000
        });
        const content = response.choices[0]?.message?.content;
        if (content) {
          const analysis = JSON.parse(content) as AIAnalysisResult;
          return this.validateAnalysis(analysis);
        }
      }

      console.warn('No AI API keys found, using fallback analysis');
      return this.fallbackAnalysis(solutionCode);
    } catch (error) {
      console.error('Error analyzing problem with AI:', error);
      return this.fallbackAnalysis(solutionCode);
    }
  }

  private extractJSON(content: string): string {
    // Remove markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }
    return content.trim();
  }

  private validateAnalysis(analysis: any): AIAnalysisResult {
    return {
      difficulty: ['Easy', 'Medium', 'Hard'].includes(analysis.difficulty) ? analysis.difficulty : 'Medium',
      topics: Array.isArray(analysis.topics) ? analysis.topics : ['Unknown'],
      patterns: Array.isArray(analysis.patterns) ? analysis.patterns : ['Unknown'],
      timeComplexity: analysis.timeComplexity || 'O(?)',
      spaceComplexity: analysis.spaceComplexity || 'O(?)',
      optimizationSuggestions: Array.isArray(analysis.optimizationSuggestions) ? analysis.optimizationSuggestions : [],
      conceptsUsed: Array.isArray(analysis.conceptsUsed) ? analysis.conceptsUsed : [],
      similarProblems: Array.isArray(analysis.similarProblems) ? analysis.similarProblems : []
    };
  }

  private fallbackAnalysis(code: string): AIAnalysisResult {
    const analysis = this.analyzeCodePatterns(code);
    return {
      difficulty: this.estimateDifficulty(code, analysis.patterns),
      topics: analysis.topics,
      patterns: analysis.patterns,
      timeComplexity: analysis.timeComplexity,
      spaceComplexity: analysis.spaceComplexity,
      optimizationSuggestions: analysis.optimizationSuggestions,
      conceptsUsed: analysis.conceptsUsed,
      similarProblems: []
    };
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
    try {
      const openai = this.getOpenAI();
      if (!openai) return [];

      const prompt = `Given these algorithm patterns: ${patterns.join(', ')} and topics: ${topics.join(', ')}, suggest 3-5 similar LeetCode problems that use the same concepts. Return only problem names, one per line.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      return content ? content.split('\n').filter(line => line.trim()) : [];
    } catch (error) {
      console.error('Error finding similar problems:', error);
      return [];
    }
  }

  async generateOptimizationSuggestions(code: string): Promise<string[]> {
    try {
      const openai = this.getOpenAI();
      if (!openai) return this.basicOptimizationSuggestions(code);

      const prompt = `Analyze this code and provide 2-3 specific optimization suggestions:\n\n${code}\n\nFocus on time/space complexity improvements, algorithmic optimizations, and code efficiency.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      });

      const content = response.choices[0]?.message?.content;
      return content ? content.split('\n').filter(line => line.trim()) : [];
    } catch (error) {
      console.error('Error generating optimization suggestions:', error);
      return this.basicOptimizationSuggestions(code);
    }
  }

  private basicOptimizationSuggestions(code: string): string[] {
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
