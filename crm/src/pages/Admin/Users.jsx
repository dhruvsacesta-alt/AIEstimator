import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input } from '../../components/ui';
import {
    UserPlus, Mail, Shield,
    Lock, Eye, EyeOff, Trash2,
    UserCheck, UserX, Search
} from 'lucide-react';
import { getUsers, createSalesUser } from '../../utils/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createSalesUser(newUser);
            setNewUser({ name: '', email: '', password: '' });
            setShowAddForm(false);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Sales Personnel...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>Sales Team Management</h1>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Manage access for your moving consultants.</p>
                </div>
                <Button onClick={() => setShowAddForm(true)}><UserPlus size={18} /> Add Sales Person</Button>
            </div>

            {showAddForm && (
                <Card title="Register New Sales Person">
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: '1rem', alignItems: 'flex-end' }}>
                        <Input label="Full Name" placeholder="Emma Wilson" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                        <Input label="Email Address" type="email" placeholder="emma@aiestimator.com" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                        <Input label="Initial Password" type="password" placeholder="••••••••" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Account'}</Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card noPadding>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Consultant</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => (
                            <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ fontWeight: '800', color: '#0f172a' }}>{u.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Mail size={12} /> {u.email}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <Badge variant={u.role === 'ADMIN' ? 'primary' : 'secondary'}>{u.role}</Badge>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default Users;
