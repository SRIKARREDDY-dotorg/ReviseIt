import axios from 'axios';

export interface GitHubFile {
  path: string;
  content: string;
  sha: string;
  url: string;
}

export interface ProblemData {
  leetcodeUrl: string;
  title?: string;
  solutionCode: string;
}

class GitHubService {
  async getRepositoryFiles(accessToken: string, repository: string): Promise<GitHubFile[]> {
    try {
      // Get repository contents recursively
      const response = await axios.get(
        `https://api.github.com/repos/${repository}/git/trees/main?recursive=1`,
        {
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const files: GitHubFile[] = [];
      
      // Filter for code files (common extensions)
      const codeExtensions = ['.py', '.js', '.java', '.cpp', '.c', '.ts', '.go', '.rs', '.rb'];
      
      for (const item of response.data.tree) {
        if (item.type === 'blob' && codeExtensions.some(ext => item.path.endsWith(ext))) {
          try {
            // Get file content
            const fileResponse = await axios.get(item.url, {
              headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            });

            if (fileResponse.data.content) {
              const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
              
              files.push({
                path: item.path,
                content,
                sha: item.sha,
                url: item.url
              });
            }
          } catch (fileError) {
            console.error(`Error fetching file ${item.path}:`, fileError);
          }
        }
      }

      return files;
    } catch (error) {
      console.error('Error fetching repository files:', error);
      throw new Error('Failed to fetch repository files');
    }
  }

  async parseProblemFile(content: string): Promise<ProblemData | null> {
    try {
      const lines = content.split('\n');
      
      // Look for LeetCode URL in the first few lines
      let leetcodeUrl = '';
      let title = '';
      
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        
        // Check for LeetCode URL
        if (line.includes('leetcode.com/problems/')) {
          const urlMatch = line.match(/https?:\/\/leetcode\.com\/problems\/[^\s)]+/);
          if (urlMatch) {
            leetcodeUrl = urlMatch[0];
            
            // Try to extract title from URL
            const titleMatch = leetcodeUrl.match(/\/problems\/([^\/]+)/);
            if (titleMatch) {
              title = titleMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            break;
          }
        }
      }

      if (!leetcodeUrl) {
        return null; // Not a LeetCode problem file
      }

      // Extract solution code (everything after the URL line)
      const urlLineIndex = lines.findIndex(line => line.includes(leetcodeUrl));
      const solutionCode = lines.slice(urlLineIndex + 1).join('\n').trim();

      if (!solutionCode) {
        return null; // No solution code found
      }

      return {
        leetcodeUrl,
        title,
        solutionCode
      };
    } catch (error) {
      console.error('Error parsing problem file:', error);
      return null;
    }
  }

  async getLeetCodeProblemInfo(problemUrl: string): Promise<any> {
    try {
      // Extract problem slug from URL
      const slugMatch = problemUrl.match(/\/problems\/([^\/]+)/);
      if (!slugMatch) {
        throw new Error('Invalid LeetCode URL');
      }

      const slug = slugMatch[1];

      // Note: LeetCode doesn't have a public API, so we'll use a mock response
      // In a real implementation, you might use web scraping or a third-party service
      return {
        titleSlug: slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        difficulty: 'Medium', // Default difficulty
        topicTags: []
      };
    } catch (error) {
      console.error('Error fetching LeetCode problem info:', error);
      return null;
    }
  }
}

export const githubService = new GitHubService();
