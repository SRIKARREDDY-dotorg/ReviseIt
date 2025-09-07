import React, { useState } from 'react';
import { Github } from 'lucide-react';
import { authAPI } from '../services/api';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getGitHubUrl();
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error getting GitHub URL:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to ReviseIt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your intelligent LeetCode revision platform
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Github className="h-5 w-5 text-gray-300 group-hover:text-gray-200" />
              </span>
              {loading ? 'Connecting...' : 'Sign in with GitHub'}
            </button>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">
              We need access to your GitHub repositories to sync your LeetCode solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
