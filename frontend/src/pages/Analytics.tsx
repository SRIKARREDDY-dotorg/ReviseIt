import React from 'react';

const Analytics: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Detailed insights into your problem-solving progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Trends</h2>
          <p className="text-gray-500">No data available yet</p>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Topic Distribution</h2>
          <p className="text-gray-500">No data available yet</p>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Difficulty Breakdown</h2>
          <p className="text-gray-500">No data available yet</p>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Improvement Areas</h2>
          <p className="text-gray-500">No data available yet</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
