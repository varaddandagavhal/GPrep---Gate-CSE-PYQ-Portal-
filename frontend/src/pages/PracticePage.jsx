import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StudentLayout } from '../layouts/Layout.jsx';
import { questionAPI, testAPI } from '../services/api.js';
import { usePracticeStore } from '../store/stores.js';

export const PracticePage = () => {
  const navigate = useNavigate();
  const {
    selectedSubject,
    selectedTopic,
    selectedYear,
    questions,
    isLoading,
    setSelectedSubject,
    setSelectedTopic,
    setSelectedYear,
    setQuestions,
    setLoading,
    setError,
  } = usePracticeStore();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await questionAPI.getSubjects();
        setSubjects(response.data.data);
      } catch (error) {
        toast.error('Failed to load subjects');
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      const loadTopics = async () => {
        try {
          const response = await questionAPI.getTopicsBySubject(selectedSubject._id);
          setTopics(response.data.data);
        } catch (error) {
          toast.error('Failed to load topics');
        }
      };
      loadTopics();
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedSubject) {
      const loadQuestions = async () => {
        setLoading(true);
        try {
          const filters = {
            subjectId: selectedSubject._id,
            ...(selectedTopic && { topicId: selectedTopic._id }),
            ...(selectedYear && { year: selectedYear }),
          };
          const response = await questionAPI.getQuestions(filters);
          setQuestions(response.data.data.questions);
          setCurrentQuestionIndex(0);
          setSelectedAnswer(null);
          setShowFeedback(false);
        } catch (error) {
          setError('Failed to load questions');
          toast.error('Failed to load questions');
        } finally {
          setLoading(false);
        }
      };
      loadQuestions();
    }
  }, [selectedSubject, selectedTopic, selectedYear, setQuestions, setLoading, setError]);

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  if (!selectedSubject) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold" style={{ color: '#4A3728' }}>Practice Questions</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <button key={subject._id} onClick={() => setSelectedSubject(subject)}
                className="clay-card-flat p-6 rounded-xl text-left transition hover:-translate-y-0.5">
                <h3 className="font-bold text-lg" style={{ color: '#4A3728' }}>{subject.name}</h3>
                <p className="text-sm font-semibold" style={{ color: '#C87A5A' }}>{subject.code}</p>
              </button>
            ))}
          </div>
        </div>
      </StudentLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-3xl font-bold" style={{ color: '#4A3728' }}>
            {selectedSubject.name} - Practice
          </h1>
          <button onClick={() => setSelectedSubject(null)} className="clay-btn-secondary px-4 py-2 text-sm">
            Change Subject
          </button>
        </div>

        <div className="clay-card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-sm" style={{ color: '#4A3728' }}>Topic</label>
            <select value={selectedTopic?._id || ''}
              onChange={(e) => {
                const topic = topics.find((t) => t._id === e.target.value);
                setSelectedTopic(topic || null);
              }}
              className="clay-input">
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>{topic.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2 text-sm" style={{ color: '#4A3728' }}>Year</label>
            <select value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="clay-input">
              <option value="">All Years</option>
              {[2023, 2022, 2021, 2020, 2019].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12"><p style={{ color: '#8B6F5E' }}>Loading questions...</p></div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12"><p style={{ color: '#8B6F5E' }}>No questions found</p></div>
        ) : (
          <div className="clay-card p-8">
            <div className="mb-6">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h3 className="text-lg font-semibold" style={{ color: '#4A3728' }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <span className="text-sm font-semibold" style={{ color: '#C87A5A' }}>
                  Marks: {currentQuestion.marks} | Negative: {currentQuestion.negativeMarks}
                </span>
              </div>
              <div className="mt-3 w-full rounded-full h-2" style={{ backgroundColor: '#E0CEB8' }}>
                <div style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, backgroundColor: '#C87A5A', height: '0.5rem', borderRadius: '999px' }}></div>
              </div>
            </div>

            <p className="text-xl font-semibold mb-6" style={{ color: '#4A3728' }}>
              {currentQuestion.questionText}
            </p>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button key={index} onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-xl transition border-2 ${
                    selectedAnswer === index
                      ? index === currentQuestion.correctOption && showFeedback
                        ? 'border-green-500 bg-green-50'
                        : index !== currentQuestion.correctOption && showFeedback
                        ? 'border-red-500 bg-red-50'
                        : 'clay-card-flat'
                      : 'clay-card-flat'
                  }`}>
                  {String.fromCharCode(65 + index)}) {option}
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className="clay-card-flat p-5 rounded-xl mb-6 border-l-4" style={{ borderLeftColor: '#C87A5A' }}>
                <h4 className="font-semibold mb-2" style={{ color: '#4A3728' }}>Explanation</h4>
                <p style={{ color: '#5A4A3A' }}>{currentQuestion.explanation}</p>
                {selectedAnswer === currentQuestion.correctOption ? (
                  <p className="font-semibold mt-2" style={{ color: '#16a34a' }}>Correct</p>
                ) : (
                  <p className="font-semibold mt-2" style={{ color: '#dc2626' }}>Incorrect</p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}
                className="clay-btn-secondary px-6 py-2 disabled:opacity-50">Previous</button>
              <button onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1}
                className="clay-btn px-6 py-2 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};
