import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../layouts/Layout.jsx';
import { adminAPI } from '../services/api.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getPlatformAnalytics(),
        ]);
        setStats(statsRes.data.data);
        setAnalytics(analyticsRes.data.data);
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) return <AdminLayout><div className="flex items-center justify-center h-64"><p style={{ color: '#8B6F5E' }}>Loading dashboard...</p></div></AdminLayout>;
  if (!stats || !analytics) return <AdminLayout><p style={{ color: '#8B6F5E' }}>Failed to load dashboard</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold" style={{ color: '#4A3728' }}>Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="clay-stat p-6 border-l-4" style={{ borderLeftColor: '#C87A5A' }}>
            <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Total Users</p>
            <p className="text-3xl font-bold" style={{ color: '#C87A5A' }}>{stats.totalUsers}</p>
          </div>
          <div className="clay-stat p-6 border-l-4" style={{ borderLeftColor: '#8FAB7A' }}>
            <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Questions</p>
            <p className="text-3xl font-bold" style={{ color: '#8FAB7A' }}>{stats.totalQuestions}</p>
          </div>
          <div className="clay-stat p-6 border-l-4" style={{ borderLeftColor: '#E8B86D' }}>
            <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Tests Taken</p>
            <p className="text-3xl font-bold" style={{ color: '#E8B86D' }}>{stats.totalTestAttempts}</p>
          </div>
          <div className="clay-stat p-6 border-l-4" style={{ borderLeftColor: '#8B6F5E' }}>
            <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Avg Score</p>
            <p className="text-3xl font-bold" style={{ color: '#4A3728' }}>{analytics.averageScore}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="clay-card p-6">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#4A3728' }}>User Statistics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Users', value: stats.totalUsers },
                { name: 'Students', value: stats.totalStudents },
                { name: 'Admins', value: stats.totalAdmins },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0CEB8" />
                <XAxis dataKey="name" tick={{ fill: '#8B6F5E' }} />
                <YAxis tick={{ fill: '#8B6F5E' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#C87A5A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="clay-card p-6">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#4A3728' }}>Platform Analytics</h3>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Average Accuracy</p>
                <p className="text-2xl font-bold" style={{ color: '#8FAB7A' }}>{analytics.averageAccuracy}%</p>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Total Violations</p>
                <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{analytics.totalViolations}</p>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#8B6F5E' }}>Zeroed Tests</p>
                <p className="text-2xl font-bold" style={{ color: '#E8B86D' }}>{analytics.abortedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="clay-card p-8">
          <h3 className="font-bold text-xl mb-6" style={{ color: '#4A3728' }}>Recent Test Attempts</h3>
          {stats.recentAttempts.length === 0 ? (
            <p style={{ color: '#8B6F5E' }}>No test attempts yet.</p>
          ) : (
            <div className="clay-table">
              <table className="w-full">
                <thead><tr><th>Student</th><th>Score</th><th>Violations</th><th>Status</th></tr></thead>
                <tbody>
                  {stats.recentAttempts.map((attempt) => (
                    <tr key={attempt._id}>
                      <td>
                        <p className="font-semibold" style={{ color: '#4A3728' }}>{attempt.userId?.name || 'Unknown'}</p>
                        <p className="text-xs" style={{ color: '#8B6F5E' }}>{attempt.userId?.email || ''}</p>
                      </td>
                      <td className="font-bold">{attempt.totalScore}/{attempt.maxScore}</td>
                      <td><span style={{ color: attempt.violations > 0 ? '#dc2626' : '#8B6F5E' }}>{attempt.violations}</span></td>
                      <td><span className="clay-pill">{attempt.status === 'zeroed_due_to_violation' ? 'Zeroed' : attempt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
