import React, { useState, useEffect } from 'react';
import { Plus, Search, Github, Trash2, Edit3 } from 'lucide-react';
import { problemsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ProblemModal from '../components/ProblemModal';
import CreateProblemModal from '../components/CreateProblemModal';
import type { Problem } from '../types';

const Problems: React.FC = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, [pagination.page, difficultyFilter]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await problemsAPI.getProblems({
        page: pagination.page,
        limit: pagination.limit,
        difficulty: difficultyFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setProblems(response.data.problems);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedRepo) return;
    
    try {
      setSyncing(true);
      const response = await problemsAPI.syncProblems(selectedRepo);
      alert(`Synced ${response.data.syncedCount} problems successfully!`);
      fetchProblems();
    } catch (error) {
      console.error('Error syncing problems:', error);
      alert('Failed to sync problems. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      await problemsAPI.deleteProblem(problemId);
      setProblems(problems.filter(p => p.id !== problemId));
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert('Failed to delete problem.');
    }
  };

  const handleEdit = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsModalOpen(true);
  };

  const handleUpdateProblem = (updatedProblem: Problem) => {
    setProblems(problems.map(p => p.id === updatedProblem.id ? updatedProblem : p));
  };

  const handleCreateProblem = async (problemData: {
    title: string;
    leetcodeUrl: string;
    solutionCode: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }) => {
    try {
      const response = await problemsAPI.createProblem(problemData);
      setProblems([response.data, ...problems]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
    } catch (error) {
      console.error('Error creating problem:', error);
      throw error;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Problems</h1>
        <p className="mt-2 text-gray-600">
          Manage and sync your LeetCode solutions
        </p>
      </div>

      {/* Actions Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Manual Create */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Problem
            </h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Problem
            </button>
          </div>

          {/* GitHub Sync */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Github className="h-5 w-5 mr-2" />
              Sync from GitHub
            </h2>
            <div className="flex gap-4">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a repository</option>
                {user?.repositories?.map(repo => (
                  <option key={repo} value={repo}>{repo}</option>
                ))}
              </select>
              <button
                onClick={handleSync}
                disabled={!selectedRepo || syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {syncing ? 'Syncing...' : 'Sync Problems'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading problems...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
            <p className="text-gray-500 mb-4">
              {problems.length === 0 
                ? 'Sync your GitHub repository to get started'
                : 'Try adjusting your search or filters'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProblems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {problem.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          <a 
                            href={problem.leetcodeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View on LeetCode
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {problem.topics.slice(0, 3).map((topic, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {topic}
                          </span>
                        ))}
                        {problem.topics.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{problem.topics.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(problem.confidenceScore / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{problem.confidenceScore}/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(problem)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit problem"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(problem.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete problem"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} problems
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Problem Edit Modal */}
      <ProblemModal
        problem={selectedProblem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProblem(null);
        }}
        onUpdate={handleUpdateProblem}
      />

      {/* Create Problem Modal */}
      <CreateProblemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProblem}
      />
    </div>
  );
};

export default Problems;
