import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions (React StrictMode runs effects twice)
    if (hasProcessed.current) return;

    const handleCallback = async () => {
      hasProcessed.current = true;
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('GitHub OAuth error:', error);
        navigate('/login');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        navigate('/login');
        return;
      }

      try {
        const response = await authAPI.githubCallback(code);
        login(response.data.token, response.data.user);
        navigate('/');
      } catch (error) {
        console.error('Error during GitHub callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
