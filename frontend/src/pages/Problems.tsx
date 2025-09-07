import React from 'react';

const Problems: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Problems</h1>
        <p className="mt-2 text-gray-600">
          Manage and sync your LeetCode solutions
        </p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No problems synced yet</h3>
          <p className="text-gray-500 mb-4">
            Connect your GitHub repository to start syncing your LeetCode solutions
          </p>
          <button className="btn-primary">
            Sync from GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Problems;
