import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/stores.js';

export const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen clay-bg">
      <nav className="clay-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold" style={{ color: '#C87A5A' }}>GatePrep</Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="font-medium" style={{ color: '#4A3728' }}>
                    {user.name}
                    <span className="ml-2 clay-pill">{user.role}</span>
                  </span>
                  <button onClick={handleLogout} className="clay-btn-danger px-4 py-2 rounded-lg text-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="font-semibold text-sm transition" style={{ color: '#4A3728' }}>Log in</Link>
                  <Link to="/register" className="clay-btn px-4 py-2 rounded-lg text-sm">Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};

export const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const menuItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Questions', path: '/admin/questions' },
    { label: 'Users', path: '/admin/users' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen clay-bg">
      <div className="w-64 clay-sidebar p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8" style={{ color: '#C87A5A' }}>GatePrep</h2>
        <p className="text-xs font-semibold mb-4 uppercase tracking-wider" style={{ color: '#8B6F5E' }}>Admin Panel</p>
        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}
              className="block px-4 py-2.5 rounded-xl font-medium transition"
              style={{ color: '#EDE0D1' }}
              onMouseOver={e => e.target.style.backgroundColor = 'rgba(200,122,90,0.15)'}
              onMouseOut={e => e.target.style.backgroundColor = 'transparent'}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} className="clay-btn-danger w-full px-4 py-2.5 rounded-xl text-sm">Logout</button>
      </div>
      <div className="flex-1 overflow-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const menuItems = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Practice', path: '/student/practice' },
    { label: 'History', path: '/student/history' },
    { label: 'Profile', path: '/student/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen clay-bg">
      <nav className="clay-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/student" className="text-2xl font-bold" style={{ color: '#C87A5A' }}>GatePrep</Link>
            <div className="flex items-center gap-6">
              {menuItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className="font-medium text-sm transition"
                  style={{ color: '#4A3728' }}>
                  {item.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="clay-btn-danger px-4 py-2 rounded-lg text-sm">Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};
