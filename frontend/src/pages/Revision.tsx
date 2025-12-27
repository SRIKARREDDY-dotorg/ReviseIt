import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { revisionAPI } from '../services/api';
import { Clock, Target, Brain, Calendar, CheckCircle, XCircle, ArrowRight, ExternalLink } from 'lucide-react';
import type { RevisionQueueItem } from '../types';

const Revision: React.FC = () => {
  const [queue, setQueue] = useState<RevisionQueueItem[]>([]);
  const [currentProblem, setCurrentProblem] = useState<RevisionQueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  
  // Session form state
  const [performanceScore, setPerformanceScore] = useState(5);
  const [timeTaken, setTimeTaken] = useState(30);
  const [wasCorrect, setWasCorrect] = useState(true);
  const [difficultyRating, setDifficultyRating] = useState(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRevisionQueue();
  }, []);

  const fetchRevisionQueue = async () => {
    try {
      setLoading(true);
      const response = await revisionAPI.getRevisionQueue();
      setQueue(response.data.queue);
    } catch (error) {
      console.error('Error fetching revision queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRevision = (item: RevisionQueueItem) => {
    setCurrentProblem(item);
    setShowSessionForm(false);
    // Reset form
    setPerformanceScore(5);
    setTimeTaken(30);
    setWasCorrect(true);
    setDifficultyRating(5);
    setNotes('');
  };

  const completeRevision = async () => {
    if (!currentProblem) return;

    try {
      setSubmitting(true);
      await revisionAPI.completeRevision({
        problemId: currentProblem.problem._id,
        performanceScore,
        timeTaken,
        wasCorrect,
        difficultyRating,
        notes
      });

      // Remove completed problem from queue
      setQueue(prev => prev.filter(item => 
        (item.problem._id) !== (currentProblem.problem._id)
      ));
      setCurrentProblem(null);
      setShowSessionForm(false);
    } catch (error) {
      console.error('Error completing revision:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-100 text-red-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'interview_topic': return 'Interview Critical';
      case 'low_confidence': return 'Low Confidence';
      case 'weekly': return 'Weekly Review';
      case 'biweekly': return 'Biweekly Review';
      default: return reason;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Problem solving interface
  if (currentProblem && !showSessionForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => setCurrentProblem(null)}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back to Queue
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentProblem.problem.title}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(currentProblem.priority)}`}>
              {getReasonText(currentProblem.reason)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Problem Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    currentProblem.problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    currentProblem.problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentProblem.problem.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{currentProblem.problem.confidenceScore}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revisions:</span>
                  <span className="font-medium">{currentProblem.problem.revisionCount}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <a
                  href={currentProblem.problem.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in LeetCode
                </a>
              </div>
            </div>

            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-4">Your Previous Solution</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{currentProblem.problem.solutionCode}</code>
              </pre>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {currentProblem.problem.topics.map((topic, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Patterns</h3>
              <div className="flex flex-wrap gap-2">
                {currentProblem.problem.patterns.map((pattern, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <button
                onClick={() => setShowSessionForm(true)}
                className="w-full btn-primary"
              >
                Complete Revision
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Session completion form
  if (showSessionForm && currentProblem) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Complete Revision Session</h2>
          <p className="text-gray-600 mb-6">How did you perform on: {currentProblem.problem.title}?</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Did you solve it correctly?
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setWasCorrect(true)}
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    wasCorrect ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Yes
                </button>
                <button
                  onClick={() => setWasCorrect(false)}
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    !wasCorrect ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-300'
                  }`}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  No
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Score (1-10): {performanceScore}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={performanceScore}
                onChange={(e) => setPerformanceScore(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Taken (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={timeTaken}
                onChange={(e) => setTimeTaken(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Rating (1-10): {difficultyRating}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={difficultyRating}
                onChange={(e) => setDifficultyRating(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Easy</span>
                <span>Very Hard</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any insights, mistakes, or observations..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowSessionForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={completeRevision}
                disabled={submitting}
                className="flex-1 btn-primary"
              >
                {submitting ? 'Saving...' : 'Complete Session'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main revision queue
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Revision Queue</h1>
        <p className="mt-2 text-gray-600">
          AI-generated revision queue based on spaced repetition and confidence scores
        </p>
      </div>

      {queue.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No problems due for revision</h3>
            <p className="text-gray-500 mb-4">
              Solve some problems first to build your revision queue
            </p>
            <Link to="/problems" className="btn-primary">
              Go to Problems
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div key={item.problem._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.problem.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {getReasonText(item.reason)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      item.problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.problem.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Brain className="w-4 h-4 mr-1" />
                      Confidence: {item.problem.confidenceScore}/10
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Revisions: {item.problem.revisionCount}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Last: {new Date(item.problem.lastRevised).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.problem.topics.slice(0, 3).map((topic, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {topic}
                      </span>
                    ))}
                    {item.problem.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{item.problem.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => startRevision(item)}
                  className="btn-primary flex items-center ml-4"
                >
                  Start Revision
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Revision;