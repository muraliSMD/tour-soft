"use client";

import React, { useState, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore'; // Adjust path if needed
import UserModal from '@/components/dashboard/UserModal'; // Adjust path
import api from '@/lib/axios'; // Adjust path
import Card from '@/components/ui/Card'; // Custom Card Component
import Button from '@/components/ui/Button'; // Custom Button Component
import { Plus, Edit2, Trash2, Search, Eye, EyeOff } from 'lucide-react';

const UsersPage = () => {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setIsLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setError("Failed to load users");
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const [deleteId, setDeleteId] = useState(null);

    const handleDeleteClick = (userId) => {
        setDeleteId(userId);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/users/${deleteId}`);
            setUsers(users.filter(u => u._id !== deleteId));
            setDeleteId(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const toggleStatus = async (user) => {
        const newStatus = user.isActive === false ? true : false;
        try {
            await api.put(`/users/${user._id}`, { isActive: newStatus });
            // Optimistic update
            setUsers(users.map(u => u._id === user._id ? { ...u, isActive: newStatus } : u));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update user status");
        }
    };

    const handleSaveUser = async (userData) => {
        try {
            if (selectedUser) {
                // Edit
                const response = await api.put(`/users/${selectedUser._id}`, userData);
                setUsers(users.map(u => u._id === selectedUser._id ? response.data : u));
            } else {
                // Add
                const response = await api.post('/users', userData);
                setUsers([...users, response.data]);
            }
            setIsModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save user');
        }
    };

    if (isLoading) return <div className="p-8 text-white">Loading users...</div>;

    return (
        <div className="space-y-6 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-text-muted">Manage system users, roles, and permissions</p>
                </div>
                
                <button 
                    onClick={handleAddUser}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus size={20} />
                    {currentUser?.role === 'admin' ? 'Add Internal User' : 'Add New User'}
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-surface border border-white/5 rounded-xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-white font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.name}</div>
                                                    <div className="text-sm text-text-muted">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`
                                                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${user.role === 'owner' ? 'bg-purple-500/10 text-purple-400' : ''}
                                                ${user.role === 'admin' ? 'bg-blue-500/10 text-blue-400' : ''}
                                                ${user.role === 'referee' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                                                ${user.role === 'player' ? 'bg-green-500/10 text-green-400' : ''}
                                            `}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => toggleStatus(user)}
                                                className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                                    user.isActive !== false 
                                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                }`}
                                                title={user.isActive !== false ? "Click to Disable" : "Click to Enable"}
                                            >
                                                {user.isActive !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                                                {user.isActive !== false ? 'Active' : 'Disabled'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(user._id)}
                                                    className="p-2 text-text-muted hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-text-muted">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                user={selectedUser}
                currentUserRole={currentUser?.role}
            />

            {/* Custom Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                    <Card className="w-full max-w-md p-6 border-red-500/30">
                        <h3 className="text-xl font-bold text-white mb-4">Delete User?</h3>
                        <p className="text-text-muted mb-6">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setDeleteId(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={confirmDelete}>
                                Yes, Delete
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
