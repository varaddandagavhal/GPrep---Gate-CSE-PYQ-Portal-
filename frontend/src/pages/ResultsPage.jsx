import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StudentLayout } from '../layouts/Layout.jsx';
import { testAPI } from '../services/api.js';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ResultsPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await testAPI.getTestResults(testId);
        setResults(response.data.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load results');
        navigate('/student', { replace: true });
      }
    };
    loadResults();
  }, [testId, navigate]);

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#8B6F5E' }}>Loading results...</p>
        </div>
      </StudentLayout>
    );
  }

  if (!results) {
    return (
      <StudentLayout>
        <div className="text-center py-16">
          <p className="text-lg" style={{ color: '#8B6F5E' }}>Results not found</p>
          <button onClick={() => navigate('/student')} className="clay-btn mt-4 px-6 py-2">
            Back to Dashboard
          </button>
        </div>
      </StudentLayout>
    );
  }

  const isZeroed = results.status === 'zeroed_due_to_violation';
  const correctCount = results.correctAnswers || 0;
  const totalQuestions = results.totalQuestions || 0;
  const incorrectCount = totalQuestions - correctCount;
  const maxScore = results.maxScore || 1;
  const timeTaken = results.timeTaken || 0;

  const accuracyData = [
    { name: 'Correct', value: Math.max(correctCount, 0) },
    { name: 'Incorrect', value: Math.max(incorrectCount, 0) },
  ];

  const COLORS = ['#8FAB7A', '#C87A5A'];
  const hasChartData = correctCount > 0 || incorrectCount > 0;

  const visibleQuestions = showAll ? results.questions : results.questions.slice(0, 10);

  return (
    <StudentLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-3xl font-bold" style={{ color: '#4A3728' }}>
            {isZeroed ? 'Test Results (Violation)' : 'Test Results'}
          </h1>
          <div className="flex gap-3">
            {results.questions?.length > 0 && (
              <button onClick={() => setShowReview(!showReview)} className="clay-btn-secondary px-5 py-2 text-sm">
                {showReview ? 'Hide Answers' : 'Review Answers'}
              </button>
            )}
            <button onClick={() => navigate('/student')} className="clay-btn px-5 py-2 text-sm">
              Dashboard
            </button>
          </div>
        </div>

        {isZeroed && (
          <div className="clay-card-flat p-6 rounded-xl border-l-4" style={{ borderLeftColor: '#dc2626' }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: '#991b1b' }}>Test Zeroed Due to Violations</h3>
            <p style={{ color: '#5A4A3A' }}>
              Your test was automatically submitted because proctoring rules were violated.
              Please ensure you stay in the test window and avoid tab switches during future tests.
            </p>
            <p className="font-semibold mt-1" style={{ color: '#dc2626' }}>Violations detected: {results.violations}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="clay-stat p-5 border-l-4" style={{ borderLeftColor: '#C87A5A' }}>
            <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Total Score</p>
            <p className="text-3xl font-bold" style={{ color: '#C87A5A' }}>{results.totalScore}/{maxScore}</p>
          </div>
          <div className="clay-stat p-5 border-l-4" style={{ borderLeftColor: '#8FAB7A' }}>
            <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Correct</p>
            <p className="text-3xl font-bold" style={{ color: '#8FAB7A' }}>{correctCount}/{totalQuestions}</p>
          </div>
          <div className="clay-stat p-5 border-l-4" style={{ borderLeftColor: '#E8B86D' }}>
            <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Accuracy</p>
            <p className="text-3xl font-bold" style={{ color: '#E8B86D' }}>{results.accuracy || 0}%</p>
          </div>
          <div className="clay-stat p-5 border-l-4" style={{ borderLeftColor: '#4A3728' }}>
            <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Time</p>
            <p className="text-3xl font-bold" style={{ color: '#4A3728' }}>{Math.floor(timeTaken / 60)} min</p>
          </div>
        </div>

        {hasChartData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="clay-card p-6">
              <h3 className="font-bold text-lg mb-4" style={{ color: '#4A3728' }}>Answer Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={accuracyData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {accuracyData.map((_, index) => <Cell key={index} fill={COLORS[index % 2]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {showReview && results.questions?.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold" style={{ color: '#4A3728' }}>Detailed Review</h2>
              {results.questions.length > 10 && (
                <button onClick={() => setShowAll(!showAll)} className="font-semibold text-sm" style={{ color: '#C87A5A' }}>
                  {showAll ? 'Show Less' : `Show All (${results.questions.length})`}
                </button>
              )}
            </div>

            {visibleQuestions.map((q, index) => (
              <div key={index} className="clay-card p-6 border-l-4" style={{ borderLeftColor: q.isCorrect ? '#8FAB7A' : '#dc2626' }}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg" style={{ color: '#4A3728' }}>
                    Q{index + 1}: {q.isCorrect ? 'Correct' : 'Incorrect'}
                  </h3>
                  <span className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Marks: {q.marks}</span>
                </div>
                <p className="mb-4" style={{ color: '#4A3728' }}>{q.questionText}</p>

                <div className="space-y-2 mb-4">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`p-3 rounded-xl ${
                      oi === q.correctOption ? 'bg-green-100 border-2 border-green-500' :
                      oi === q.selectedOption && !q.isCorrect ? 'bg-red-100 border-2 border-red-500' :
                      'clay-card-flat'
                    }`}>
                      <span className="font-bold" style={{ color: '#4A3728' }}>{String.fromCharCode(65 + oi)})</span>{' '}
                      <span style={{ color: '#5A4A3A' }}>{opt}</span>
                      {oi === q.correctOption && <span className="ml-2 font-bold" style={{ color: '#16a34a' }}>(Correct)</span>}
                      {oi === q.selectedOption && !q.isCorrect && <span className="ml-2 font-bold" style={{ color: '#dc2626' }}>(Your Answer)</span>}
                    </div>
                  ))}
                </div>

                <div className="clay-card-flat p-4 rounded-xl border-l-4" style={{ borderLeftColor: '#C87A5A' }}>
                  <h4 className="font-bold mb-1" style={{ color: '#4A3728' }}>Explanation</h4>
                  <p style={{ color: '#5A4A3A' }}>{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};
