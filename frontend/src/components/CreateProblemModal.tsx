import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (problemData: {
    title: string;
    leetcodeUrl: string;
    solutionCode: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }) => void;
}

const CreateProblemModal: React.FC<CreateProblemModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    leetcodeUrl: '',
    solutionCode: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.leetcodeUrl || !formData.solutionCode) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await onCreate(formData);
      setFormData({
        title: '',
        leetcodeUrl: '',
        solutionCode: '',
        difficulty: 'Medium'
      });
      onClose();
    } catch (error) {
      console.error('Error creating problem:', error);
      alert('Failed to create problem');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add New Problem</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Two Sum"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LeetCode URL *
            </label>
            <input
              type="url"
              value={formData.leetcodeUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, leetcodeUrl: e.target.value }))}
              placeholder="https://leetcode.com/problems/two-sum/"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solution Code *
            </label>
            <textarea
              value={formData.solutionCode}
              onChange={(e) => setFormData(prev => ({ ...prev, solutionCode: e.target.value }))}
              rows={10}
              placeholder="Paste your solution code here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
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
              {loading ? 'Creating...' : 'Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProblemModal;