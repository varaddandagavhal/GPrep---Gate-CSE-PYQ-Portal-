import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StudentLayout } from '../layouts/Layout.jsx';
import { testAPI, questionAPI } from '../services/api.js';
import { useTestStore } from '../store/stores.js';
import { formatDate } from '../utils/helpers.js';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startTest } = useTestStore();
  const [testHistory, setTestHistory] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const testSectionRef = useRef(null);
  const historyRef = useRef(null);

  const isHistoryPage = location.pathname === '/student/history';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [historyRes, subjectsRes] = await Promise.all([
          testAPI.getUserTestHistory(1, 50),
          questionAPI.getSubjects(),
        ]);
        setTestHistory(historyRes.data.data.testAttempts);
        setSubjects(subjectsRes.data.data);
        setIsLoadingHistory(false);
      } catch (error) {
        toast.error('Failed to load data');
        setIsLoadingHistory(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isHistoryPage && !isLoadingHistory && historyRef.current) {
      setTimeout(() => historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [isHistoryPage, isLoadingHistory]);

  const handleStartTest = async (subjectId) => {
    try {
      const response = await questionAPI.getQuestions({ subjectId, limit: 50 });
      const questionIds = response.data.data.questions.map((q) => q._id);
      const testResponse = await testAPI.startTest(questionIds);
      const testId = testResponse.data.data.testId;
      startTest(testId, response.data.data.questions, new Date());
      navigate(`/student/test/${testId}`);
    } catch (error) {
      toast.error('Failed to start test. Try again.');
    }
  };

  const scrollTo = (ref) => (e) => {
    e.preventDefault();
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <StudentLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#4A3728' }}>Welcome to GatePrep!</h1>
          <p style={{ color: '#8B6F5E' }}>Prepare for GATE CSE with curated questions and proctored mock tests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/student/practice" className="clay-card p-8 block text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl mx-auto mb-4"
              style={{ backgroundColor: '#8FAB7A', boxShadow: '4px 4px 10px rgba(74,55,40,0.15)' }}>
              P
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: '#4A3728' }}>Practice</h3>
            <p className="text-sm" style={{ color: '#8B6F5E' }}>Questions with instant feedback</p>
          </Link>

          <a href="/student" onClick={scrollTo(testSectionRef)} className="clay-card p-8 block text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl mx-auto mb-4"
              style={{ backgroundColor: '#C87A5A', boxShadow: '4px 4px 10px rgba(74,55,40,0.15)' }}>
              T
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: '#4A3728' }}>Take Test</h3>
            <p className="text-sm" style={{ color: '#8B6F5E' }}>Proctored mock tests</p>
          </a>

          <a href="/student/history" onClick={scrollTo(historyRef)} className="clay-card p-8 block text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl mx-auto mb-4"
              style={{ backgroundColor: '#E8B86D', boxShadow: '4px 4px 10px rgba(74,55,40,0.15)' }}>
              R
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ color: '#4A3728' }}>My Results</h3>
            <p className="text-sm" style={{ color: '#8B6F5E' }}>View test history and analytics</p>
          </a>
        </div>

        <div ref={testSectionRef} className="clay-card p-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#4A3728' }}>Start a Test</h2>
          {subjects.length === 0 ? (
            <p style={{ color: '#8B6F5E' }}>Loading subjects...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <button key={subject._id} onClick={() => handleStartTest(subject._id)}
                  className="clay-card-flat p-5 rounded-xl text-left transition hover:-translate-y-0.5">
                  <h3 className="font-bold text-base" style={{ color: '#4A3728' }}>{subject.name}</h3>
                  <p className="text-xs font-semibold mt-1" style={{ color: '#C87A5A' }}>{subject.code}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={historyRef} className="clay-card p-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#4A3728' }}>
            {isHistoryPage ? 'Test History' : 'Recent Tests'}
          </h2>

          {isLoadingHistory ? (
            <p style={{ color: '#8B6F5E' }}>Loading history...</p>
          ) : testHistory.length === 0 ? (
            <div className="text-center py-10 clay-card-flat rounded-xl">
              <p className="text-lg" style={{ color: '#8B6F5E' }}>No tests taken yet.</p>
              <p className="text-sm mt-1" style={{ color: '#A09080' }}>Start your first test above to track progress!</p>
            </div>
          ) : (
            <div className="clay-table">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {testHistory.map((test) => (
                    <tr key={test._id}>
                      <td>{formatDate(test.createdAt)}</td>
                      <td className="font-bold">{test.totalScore}/{test.maxScore}</td>
                      <td><span className="clay-pill">{test.status === 'zeroed_due_to_violation' ? 'Zeroed' : test.status === 'completed' ? 'Completed' : test.status}</span></td>
                      <td><Link to={`/student/results/${test._id}`} className="font-semibold text-sm" style={{ color: '#C87A5A' }}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};
