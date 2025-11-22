import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { problemsAPI } from '../services/api';
import type { Problem } from '../types';

interface ProblemModalProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProblem: Problem) => void;
}

const ProblemModal: React.FC<ProblemModalProps> = ({ problem, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    confidenceScore: 5,
    notes: '',
    timeComplexity: '',
    spaceComplexity: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (problem) {
      setFormData({
        confidenceScore: problem.confidenceScore,
        notes: problem.notes || '',
        timeComplexity: problem.timeComplexity || '',
        spaceComplexity: problem.spaceComplexity || ''
      });
    }
  }, [problem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;

    try {
      setLoading(true);
      const response = await problemsAPI.updateProblem(problem.id, formData);
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating problem:', error);
      alert('Failed to update problem');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !problem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Problem</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{problem.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {problem.difficulty}
            </span>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence Score: {formData.confidenceScore}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.confidenceScore}
              onChange={(e) => setFormData(prev => ({ ...prev, confidenceScore: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Complexity
            </label>
            <input
              type="text"
              value={formData.timeComplexity}
              onChange={(e) => setFormData(prev => ({ ...prev, timeComplexity: e.target.value }))}
              placeholder="e.g., O(n), O(log n)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Space Complexity
            </label>
            <input
              type="text"
              value={formData.spaceComplexity}
              onChange={(e) => setFormData(prev => ({ ...prev, spaceComplexity: e.target.value }))}
              placeholder="e.g., O(1), O(n)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Add your notes, insights, or reminders..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemModal;