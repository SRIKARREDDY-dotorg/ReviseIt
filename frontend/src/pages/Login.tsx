import React, { useState } from 'react';
import { Github, Brain, BarChart3, Calendar, Zap } from 'lucide-react';
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

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Get intelligent insights on your coding patterns and optimization suggestions'
    },
    {
      icon: Calendar,
      title: 'Smart Revision',
      description: 'Automated scheduling based on spaced repetition and confidence levels'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Comprehensive analytics to identify weak areas and track improvement'
    },
    {
      icon: Zap,
      title: 'GitHub Integration',
      description: 'Seamlessly sync your LeetCode solutions from your repositories'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RI</span>
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900">ReviseIt</span>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Left side - Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Master LeetCode with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI Intelligence</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Transform your coding practice with intelligent revision scheduling, 
              AI-powered analysis, and comprehensive progress tracking.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Login */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="max-w-md w-full">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ReviseIt</h1>
              <p className="text-gray-600">Your intelligent LeetCode revision platform</p>
            </div>

            {/* Login card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
                <p className="text-gray-600">Sign in to unlock your coding potential</p>
              </div>

              <button
                onClick={handleGitHubLogin}
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="h-5 w-5 mr-3" />
                    Continue with GitHub
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  We'll access your public repositories to sync your LeetCode solutions.
                  <br />
                  <span className="font-medium">Your code stays private and secure.</span>
                </p>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Secure OAuth
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    No Code Access
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    Free Forever
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;