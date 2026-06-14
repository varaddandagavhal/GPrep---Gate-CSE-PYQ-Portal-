import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../layouts/Layout.jsx';
import { adminAPI } from '../services/api.js';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data.users);
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to load users');
      setIsLoading(false);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      await adminAPI.toggleBlockUser(userId);
      toast.success('User status updated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted');
        loadUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const q = searchTerm.toLowerCase();
    return (user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)) &&
      (!roleFilter || user.role === roleFilter);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold" style={{ color: '#4A3728' }}>User Management</h1>

        <div className="clay-card p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block font-semibold text-sm mb-2" style={{ color: '#4A3728' }}>Search</label>
            <input type="text" placeholder="Search by name or email..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="clay-input" />
          </div>
          <div>
            <label className="block font-semibold text-sm mb-2" style={{ color: '#4A3728' }}>Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="clay-input">
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="clay-table">
          {isLoading ? (
            <div className="p-6"><p style={{ color: '#8B6F5E' }}>Loading users...</p></div>
          ) : (
            <table className="w-full">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="font-semibold">{user.name}</td>
                    <td style={{ color: '#8B6F5E' }}>{user.email}</td>
                    <td><span className="clay-pill">{user.role}</span></td>
                    <td><span className="clay-pill" style={{ backgroundColor: user.isBlocked ? '#fef2f2' : '#f0fdf4', color: user.isBlocked ? '#dc2626' : '#16a34a' }}>{user.isBlocked ? 'Blocked' : 'Active'}</span></td>
                    <td className="space-x-2">
                      <button onClick={() => handleToggleBlock(user._id)}
                        className="clay-btn-secondary px-3 py-1.5 text-xs">{user.isBlocked ? 'Unblock' : 'Block'}</button>
                      <button onClick={() => handleDeleteUser(user._id)}
                        className="clay-btn-danger px-3 py-1.5 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-8" style={{ color: '#8B6F5E' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
