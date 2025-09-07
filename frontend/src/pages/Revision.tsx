import React from 'react';

const Revision: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Revision</h1>
        <p className="mt-2 text-gray-600">
          Smart revision queue based on AI recommendations
        </p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No problems due for revision</h3>
          <p className="text-gray-500 mb-4">
            Solve some problems first to build your revision queue
          </p>
          <button className="btn-primary">
            Go to Problems
          </button>
        </div>
      </div>
    </div>
  );
};

export default Revision;
