import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

const UserModal = ({ isOpen, onClose, onSave, user, currentUserRole }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'player',
        sports: [],
        academyName: '',
        phone: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India' // Default
    });
    const [showPassword, setShowPassword] = useState(false);

    // Simple option lists for demo
    const countries = ["India", "USA", "UK", "Canada", "Australia"];
    const states = ["Karnataka", "Maharashtra", "Telangana", "Tamil Nadu", "Delhi", "Kerala", "Other"];
    const cities = ["Bangalore", "Mumbai", "Hyderabad", "Chennai", "Delhi", "Pune", "Other"];

    useEffect(() => {
        const defaultRole = currentUserRole === 'admin' ? 'referee' : 'player';
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || defaultRole,
                sports: user.sports || [],
                academyName: user.academyName || '',
                phone: user.phone || '',
                pincode: user.pincode || '',
                city: user.city || '',
                state: user.state || '',
                country: user.country || 'India',
                password: '' // Don't populate password
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                role: defaultRole,
                sports: [],
                academyName: '',
                phone: '',
                pincode: '',
                city: '',
                state: '',
                country: 'India'
            });
        }
    }, [user, isOpen, currentUserRole]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-white/10 rounded-xl w-full max-w-md shadow-xl animate-scale-in">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">
                        {user ? 'Edit User' : (currentUserRole === 'admin' ? 'Add Referee' : 'Add New User')}
                    </h2>
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Size and other inputs remain same */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="email@example.com"
                            required
                            disabled={!!user && currentUserRole !== 'owner'}
                        />

                    </div>

                    {/* Extended Fields for Admin/Owner Creation */}
                    {(currentUserRole === 'owner' || formData.role === 'admin' || formData.role === 'owner') && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Academy Name</label>
                                <input
                                    type="text"
                                    name="academyName"
                                    value={formData.academyName}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Academy Name"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="+91 9876543210"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="560001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Country</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">State</label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">City</label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">
                            {user ? 'New Password (leave blank to keep current)' : 'Password'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder={user ? "********" : "Enter password"}
                                required={!user}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        >
                            {/* Admin sees Referee first, and Player. Owner sees all. */}
                            {currentUserRole === 'admin' ? (
                                <>
                                    <option value="referee">Referee (Internal User)</option>
                                </>
                            ) : (
                                <>
                                    <option value="player">Player</option>
                                    <option value="referee">Referee</option>
                                    <option value="admin">Admin</option>
                                    <option value="owner">Owner</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-text-muted hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            {user ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
