import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api.js';
import { useAuthStore } from '../store/stores.js';
import { MainLayout } from '../layouts/Layout.jsx';

/**
 * Login Page Component
 */
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const     handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      const data = response.data.data;

      login({
        userId: data.userId,
        email: data.email,
        role: data.role,
        name: data.name,
      }, data.token);

      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="clay-card p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#4A3728' }}>
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2 text-sm" style={{ color: '#4A3728' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                className="clay-input" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm" style={{ color: '#4A3728' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required
                className="clay-input" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="clay-btn w-full py-3 text-base disabled:opacity-60">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#8B6F5E' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#C87A5A' }}>Register here</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

/**
 * Register Page Component
 */
export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const     handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(
        formData.name,
        formData.email,
        formData.password
      );
      const data = response.data.data;

      login({
        userId: data.userId,
        email: data.email,
        role: data.role,
        name: data.name || formData.name,
      }, data.token);

      navigate('/student');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="clay-card p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#4A3728' }}>
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2 text-sm" style={{ color: '#4A3728' }}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                className="clay-input" placeholder="John Doe" />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm" style={{ color: '#4A3728' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                className="clay-input" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm" style={{ color: '#4A3728' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required
                className="clay-input" placeholder="••••••••" />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-sm" style={{ color: '#4A3728' }}>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                className="clay-input" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="clay-btn w-full py-3 text-base disabled:opacity-60">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: '#8B6F5E' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#C87A5A' }}>Login here</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
