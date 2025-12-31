import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const UserManager = ({ user }) => {
    const { t } = useTranslation();
    const ATTRIBUTE_OPTIONS = {
        'access_page': ['documents', 'users', 'chat', 'settings'],
        'action': ['manage_users', 'manage_documents', 'delete_file', 'view_vectors'],
        'department': ['sales', 'engineering', 'hr', 'marketing'],
        'clearance': ['top_secret', 'secret', 'confidential', 'unclassified']
    };
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    // New attribute form state
    const [newKey, setNewKey] = useState('access_page');
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users?username=${user.username}`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setMessage({ type: 'error', text: 'Failed to simple load users. Permission denied.' });
        }
    };

    const handleAttributeAction = async (targetUserId, action, key, value) => {
        if (action === 'remove' && !window.confirm(`Remove attribute ${key}=${value}?`)) return;

        try {
            await axios.post(`http://localhost:5000/api/users/${targetUserId}/attributes?username=${user.username}`, {
                action,
                key,
                value
            });
            setMessage({ type: 'success', text: `Attribute ${action}ed successfully` });
            fetchUsers(); // Refresh list to see changes
        } catch (error) {
            console.error("Attribute action error:", error);
            setMessage({ type: 'error', text: 'Failed to update attribute' });
        }
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        if (!editingUser || !newKey || !newValue) return;
        handleAttributeAction(editingUser.id, 'add', newKey, newValue);
        setNewValue(''); // Reset value input
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#262626', fontWeight: '300' }}>
                {t('users.title')}
            </h2>

            {message && (
                <div style={{ marginBottom: '1rem', color: message.type === 'error' ? '#ed4956' : '#0095f6' }}>
                    {message.text}
                </div>
            )}

            <div className="insta-card" style={{ padding: '0', alignItems: 'stretch' }}>
                {users.map(u => (
                    <div key={u.id} style={{ padding: '1.5rem', borderBottom: '1px solid #dbdbdb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div>
                                <span style={{ fontWeight: '600', fontSize: '16px' }}>{u.username}</span>
                                <span style={{ color: '#8e8e8e', marginLeft: '10px' }}>{u.name}</span>
                            </div>
                            <button
                                onClick={() => setEditingUser(editingUser?.id === u.id ? null : u)}
                                className="insta-btn"
                                style={{ margin: 0, background: editingUser?.id === u.id ? '#fafafa' : '#0095f6', color: editingUser?.id === u.id ? '#262626' : 'white', border: '1px solid #dbdbdb' }}
                            >
                                {editingUser?.id === u.id ? t('users.btn_close_edit') : t('users.btn_edit')}
                            </button>
                        </div>

                        {/* Attribute List */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {Object.entries(u.attributes).length > 0 ? (
                                Object.entries(u.attributes).map(([key, values]) => (
                                    values.map((val, idx) => (
                                        <div key={`${key}-${idx}`} style={{
                                            background: '#fafafa', border: '1px solid #dbdbdb', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <span style={{ fontWeight: '600', color: '#262626' }}>{key}:</span>
                                            <span style={{ color: '#555' }}>{val}</span>
                                            {/* Only allow editing if we are editing this user */}
                                            {editingUser?.id === u.id && (
                                                <button
                                                    onClick={() => handleAttributeAction(u.id, 'remove', key, val)}
                                                    style={{ border: 'none', background: 'none', color: '#ed4956', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ))
                            ) : (
                                <span style={{ color: '#8e8e8e', fontSize: '12px' }}>{t('users.no_attributes')}</span>
                            )}
                        </div>

                        {/* Edit Form */}
                        {editingUser?.id === u.id && (
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #efefef' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>{t('users.add_attribute')}</h4>
                                <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <select
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #dbdbdb' }}
                                    >
                                        <option value="access_page">access_page</option>
                                        <option value="action">action</option>
                                        <option value="department">department</option>
                                        <option value="clearance">clearance</option>
                                        {/* Add more presets or make it a text input if fully generic is needed */}
                                    </select>
                                    {ATTRIBUTE_OPTIONS[newKey] ? (
                                        <select
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #dbdbdb' }}
                                        >
                                            <option value="">Select Value</option>
                                            {ATTRIBUTE_OPTIONS[newKey].map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder={t('users.placeholder_value')}
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #dbdbdb' }}
                                        />
                                    )}
                                    <button type="submit" className="insta-btn" style={{ margin: 0 }}>{t('users.btn_add')}</button>
                                </form>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserManager;
