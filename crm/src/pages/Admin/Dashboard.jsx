import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/ui';
import {
    Users,
    TrendingUp,
    DollarSign,
    Calendar,
    Clock,
    Plus,
    ArrowRight,
    FileText,
    UserPlus
} from 'lucide-react';
import { getLeads, getUsers } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [leads, setLeads] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([getLeads(), getUsers()]).then(([leadsData, usersData]) => {
            // Dashboard only shows non-cancelled leads
            const filtered = leadsData.filter(l => l.status !== 'CANCELLED');
            setLeads(filtered);
            setUserCount(usersData.length);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const stats = [
        { label: 'Total Leads', value: leads.length, trend: '↑ 12% from last month', icon: <FileText size={20} />, color: '#1d4ed8' },
        { label: 'Pending Leads', value: leads.filter(l => l.status === 'NEW').length, trend: '23', icon: <Clock size={20} />, color: '#1d4ed8' },
        { label: 'Sales Persons', value: userCount, trend: 'Registered Consultants', icon: <Users size={20} />, color: '#1d4ed8' },
        { label: 'Active Bookings', value: leads.filter(l => l.status === 'BOOKED').length, trend: '↑ 8% from last month', icon: <Calendar size={20} />, color: '#1d4ed8' }
    ];

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading System Overview...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-4 lg:grid-cols-2 md:grid-cols-1" style={{ gap: '1.5rem' }}>
                {stats.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'default',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{
                                background: `${s.color}15`,
                                padding: '12px',
                                borderRadius: '12px',
                                color: s.color,
                                border: `1px solid ${s.color}30`
                            }}>
                                {s.icon}
                            </div>
                            <div style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: '#f0fdf4',
                                color: '#10b981',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                border: '1px solid #d1fae5'
                            }}>
                                {s.trend.startsWith('↑') ? 'Growing' : 'Steady'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '2px', letterSpacing: '-0.025em' }}>{s.value}</div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>{s.label}</div>
                        </div>
                        <div style={{ height: '1px', background: '#f1f5f9', width: '100%' }} />
                        <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp size={12} /> {s.trend}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-1" style={{ gap: '1.5rem' }}>
                {/* Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 1' }}>
                    <Card title="Quick Actions">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Button
                                variant="outline"
                                style={{ justifyContent: 'flex-start', padding: '12px 16px', background: 'white' }}
                                onClick={() => navigate('/sales-team')}
                            >
                                <Plus size={18} /> Add Sales Person
                            </Button>
                            <Button variant="outline" style={{ justifyContent: 'flex-start', padding: '12px 16px', background: 'white' }} onClick={() => navigate('/leads')}>
                                <FileText size={18} /> View All Leads
                            </Button>
                        </div>
                    </Card>

                    <Card title="System Follow-ups">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {(() => {
                                const allF = leads.reduce((acc, lead) => {
                                    const p = (lead.follow_ups || [])
                                        .filter(f => f.status === 'PENDING')
                                        .map(f => ({ ...f, lName: `${lead.first_name} ${lead.last_name}`, lId: lead._id }));
                                    return [...acc, ...p];
                                }, []);

                                const s = allF.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).slice(0, 4);
                                if (s.length === 0) return <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No active follow-ups.</p>;

                                return s.map((f, i) => (
                                    <div key={i} style={{ padding: '8px', borderLeft: '3px solid #1d4ed8', background: '#f8fafc', borderRadius: '4px', cursor: 'pointer' }} onClick={() => navigate(`/leads/${f.lId}`)}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{f.lName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{f.note}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: '800', marginTop: '4px' }}>{new Date(f.dateTime).toLocaleDateString()} {new Date(f.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </Card>
                </div>

                {/* Recent Leads Table */}
                <div style={{ gridColumn: 'span 2' }} className="md:grid-cols-1">
                    <Card title="Recent Leads" footer={
                        <Button variant="ghost" size="sm" style={{ width: '100%', color: '#1d4ed8' }} onClick={() => navigate('/leads')}>
                            View All <ArrowRight size={14} />
                        </Button>
                    }>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Lead ID</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Customer</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.slice(0, 5).map((lead, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }} onClick={() => navigate(`/leads/${lead._id}`)}>
                                            <td style={{ padding: '16px', fontSize: '0.875rem', fontWeight: '700', color: '#1d4ed8' }}>LD-{lead._id.slice(-3).toUpperCase()}</td>
                                            <td style={{ padding: '16px', fontSize: '0.875rem', fontWeight: '600' }}>{lead.first_name} {lead.last_name}</td>
                                            <td style={{ padding: '16px' }}><Badge>{lead.status}</Badge></td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
