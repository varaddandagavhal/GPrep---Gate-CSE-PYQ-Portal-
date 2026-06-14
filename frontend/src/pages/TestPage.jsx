import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { testAPI } from '../services/api.js';
import { useTestStore } from '../store/stores.js';
import { useProctoring, useTestTimer, useAutoSave } from '../hooks/useProctoring.js';
import { formatTime } from '../utils/helpers.js';

const TestOverlay = ({ onStart }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: '#4A3728' }}>
    <div className="clay-card p-12 max-w-lg text-center">
      <h1 className="text-3xl font-bold mb-4" style={{ color: '#4A3728' }}>Proctored Test</h1>
      <p className="mb-8" style={{ color: '#8B6F5E' }}>
        This test is proctored. You will be put in fullscreen mode.
        Exiting fullscreen or switching tabs will be recorded as violations.
        After 2 violations, the test will be auto-submitted.
      </p>
      <button onClick={onStart} className="clay-btn px-10 py-3 text-lg">
        Start Test
      </button>
    </div>
  </div>
);

export const TestPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const {
    questions,
    currentQuestionIndex,
    answers,
    saveAnswer,
    goToQuestion,
    markedForReview,
    toggleMarkForReview,
    resetTest,
  } = useTestStore();

  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [started, setStarted] = useState(false);

  const goToResults = useCallback(() => {
    resetTest();
    navigate(`/student/results/${testId}`, { replace: true });
  }, [testId, navigate, resetTest]);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const response = await testAPI.getTestDetails(testId);
        const status = response.data.data.status;

        if (status !== 'in-progress') {
          goToResults();
          return;
        }

        setTimeLeft(180 * 60);
        setIsLoading(false);
      } catch {
        toast.error('Test not found');
        navigate('/student', { replace: true });
      }
    };
    loadTest();
  }, [testId, goToResults, navigate]);

  const violations = useProctoring(started ? testId : null, useCallback(() => {
    setTestEnded(true);
    goToResults();
  }, [goToResults]));

  const remainingTime = useTestTimer(started ? testId : null, 180 * 60, useCallback(() => {
    if (!testEnded) handleSubmitTest('time_up');
  }, [testEnded]));

  useEffect(() => {
    setTimeLeft(remainingTime);
  }, [remainingTime]);

  useAutoSave(started ? testId : null, answers, null, markedForReview);

  const handleStart = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    setStarted(true);
  };

  const handleAnswerSelect = (optionIndex) => {
    if (testEnded) return;
    const q = questions[currentQuestionIndex];
    if (!q) return;
    saveAnswer(q._id, optionIndex);
    testAPI.saveAnswer(testId, q._id, optionIndex, 0, false).catch(() => {});
  };

  const handleSubmitTest = async (reason = 'manual') => {
    if (testEnded) return;
    setIsSubmitting(true);
    try {
      await testAPI.submitTest(testId, reason);
      setTestEnded(true);
      goToResults();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit test');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#4A3728' }}>
        <p style={{ color: '#F5EDE3' }}>Loading test...</p>
      </div>
    );
  }

  if (!started) {
    return <TestOverlay onStart={handleStart} />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">GatePrep Test</h1>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-400">Time Left</p>
            <p className="text-2xl font-bold text-red-500">{formatTime(timeLeft)}</p>
          </div>
          {violations > 0 && (
            <div className="text-right px-4 py-2 bg-red-900 rounded-lg">
              <p className="text-sm text-red-300">Violations</p>
              <p className="text-xl font-bold text-red-400">{violations}/2</p>
            </div>
          )}
        </div>
      </header>

      <div className="flex h-screen" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="flex-1 bg-gray-900 p-8 overflow-auto">
          <div className="max-w-3xl">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
                <span className="text-sm text-gray-400">Marks: {currentQuestion.marks}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
              <p className="text-lg leading-relaxed mb-8">{currentQuestion.questionText}</p>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button key={index} onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition ${
                      answers[currentQuestion._id] === index
                        ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}>
                    <span className="font-bold mr-3">{String.fromCharCode(65 + index)})</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => toggleMarkForReview(currentQuestion._id)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  markedForReview.has(currentQuestion._id)
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}>
                {markedForReview.has(currentQuestion._id) ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-auto flex flex-col">
          <h3 className="font-bold text-lg mb-4">Question Palette</h3>
          <div className="grid grid-cols-5 gap-2 mb-8 flex-1 overflow-auto">
            {questions.map((q, index) => (
              <button key={q._id} onClick={() => goToQuestion(index)}
                className={`aspect-square rounded-lg font-bold transition ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 border-2 border-blue-400'
                    : answers[q._id] !== undefined
                    ? 'bg-green-600'
                    : markedForReview.has(q._id)
                    ? 'bg-yellow-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}>
                {index + 1}
              </button>
            ))}
          </div>

          <div className="bg-gray-700 p-4 rounded-lg mb-6 space-y-2 text-sm">
            <p><span className="inline-block w-4 h-4 bg-green-600 rounded mr-2"></span>Answered: {answeredCount}</p>
            <p><span className="inline-block w-4 h-4 bg-yellow-600 rounded mr-2"></span>Marked: {markedCount}</p>
            <p><span className="inline-block w-4 h-4 bg-gray-600 rounded mr-2"></span>Not Visited: {questions.length - answeredCount - markedCount}</p>
          </div>

          <button onClick={() => handleSubmitTest('manual')} disabled={isSubmitting}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-lg transition">
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    </div>
  );
};
