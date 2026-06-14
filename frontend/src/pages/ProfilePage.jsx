import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { StudentLayout } from '../layouts/Layout.jsx';
import { authAPI } from '../services/api.js';
import { useAuthStore } from '../store/stores.js';

export const ProfilePage = () => {
  const { user, login } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    setIsUpdatingName(true);
    try {
      const res = await authAPI.updateProfile(name.trim());
      const data = res.data.data;
      login({ userId: data.userId, email: data.email, role: data.role, name: data.name },
        useAuthStore.getState().token);
      toast.success('Name updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update name');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold" style={{ color: '#4A3728' }}>Profile</h1>

        <div className="clay-card p-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#4A3728' }}>Name</h2>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block font-semibold text-sm mb-2" style={{ color: '#4A3728' }}>Email</label>
              <input type="email" value={user?.email || ''} disabled className="clay-input opacity-60" />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-2" style={{ color: '#4A3728' }}>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                required minLength={2} className="clay-input" />
            </div>
            <button type="submit" disabled={isUpdatingName} className="clay-btn px-6 py-2.5 text-sm">
              {isUpdatingName ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>

        <div className="clay-card p-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#4A3728' }}>Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block font-semibold text-sm mb-2" style={{ color: '#4A3728' }}>Current Password</label>
              <input type="password" value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} required className="clay-input" />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-2" style={{ color: '#4A3728' }}>New Password</label>
              <input type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="clay-input" />
            </div>
            <div>
              <label className="block font-semibold text-sm mb-2" style={{ color: '#4A3728' }}>Confirm New Password</label>
              <input type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} required className="clay-input" />
            </div>
            <button type="submit" disabled={isChangingPassword} className="clay-btn px-6 py-2.5 text-sm">
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
};
