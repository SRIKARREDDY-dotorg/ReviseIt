import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { analyticsAPI, revisionAPI } from '../services/api';
import { Calendar, TrendingUp, Target, Clock } from 'lucide-react';

interface DashboardData {
  overview: {
    totalProblems: number;
    problemsDueForRevision: number;
    recentActivity: {
      totalSessions: number;
      correctSessions: number;
      averagePerformance: number;
    };
  };
  weakAreas: Array<{
    _id: string;
    count: number;
    averageConfidence: number;
  }>;
  monthlyProgress: Array<{
    _id: string;
    sessions: number;
    correctSessions: number;
    averagePerformance: number;
  }>;
  revisionStats: {
    accuracyRate: number;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, revisionStatsRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          revisionAPI.getRevisionStats()
        ]);

        setData({
          overview: dashboardRes.data.overview,
          weakAreas: dashboardRes.data.weakAreas,
          monthlyProgress: dashboardRes.data.monthlyProgress,
          revisionStats: revisionStatsRes.data.revisionStats
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set empty data on error
        setData({
          overview: {
            totalProblems: 0,
            problemsDueForRevision: 0,
            recentActivity: {
              totalSessions: 0,
              correctSessions: 0,
              averagePerformance: 0
            }
          },
          weakAreas: [],
          monthlyProgress: [],
          revisionStats: { accuracyRate: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Problems',
      value: data?.overview.totalProblems || 0,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Due for Revision',
      value: data?.overview.problemsDueForRevision || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'This Week',
      value: data?.overview.recentActivity.totalSessions || 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Accuracy',
      value: `${Math.round((data?.revisionStats.accuracyRate || 0) * 100)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-1 sm:mt-2 text-gray-600">
          Here's your LeetCode revision overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Progress</h2>
          {data?.monthlyProgress && data.monthlyProgress.length > 0 ? (
            <div className="space-y-3">
              {data.monthlyProgress.slice(-5).map((progress, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{progress._id}</p>
                    <p className="text-sm text-gray-500">{progress.sessions} sessions</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      progress.correctSessions > progress.sessions / 2
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round((progress.correctSessions / progress.sessions) * 100)}% correct
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {Math.round(progress.averagePerformance)}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>
        
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Weak Areas</h2>
          {data?.weakAreas && data.weakAreas.length > 0 ? (
            <div className="space-y-3">
              {data.weakAreas.slice(0, 5).map((area, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{area._id}</p>
                    <p className="text-sm text-gray-500">{area.count} problems</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${Math.max(10, area.averageConfidence * 10)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round(area.averageConfidence)}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Start solving problems to see insights</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;