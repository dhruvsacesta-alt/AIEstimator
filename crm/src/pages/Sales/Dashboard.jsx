import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/ui';
import {
    ClipboardList,
    CheckCircle2,
    PhoneCall,
    Clock,
    ArrowRight,
    TrendingUp,
    Target,
    DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLeads } from '../../utils/api';

const SalesDashboard = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const data = await getLeads();
                const activeLeads = data.filter(l => l.status !== 'CANCELLED');
                setLeads(activeLeads);
            } catch (error) {
                console.error('Failed to fetch leads', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const stats = [
        { label: 'Total Leads', value: leads.length.toString(), icon: <ClipboardList size={22} />, color: '#1d4ed8' },
        { label: 'New Leads', value: leads.filter(l => l.status === 'ASSIGNED').length.toString(), icon: <Target size={22} />, color: '#f59e0b' },
        { label: 'Proposals Sent', value: leads.filter(l => l.status === 'PROPOSAL_SENT').length.toString(), icon: <DollarSign size={22} />, color: '#8b5cf6' },
        { label: 'Bookings', value: leads.filter(l => l.status === 'BOOKED').length.toString(), icon: <CheckCircle2 size={22} />, color: '#10b981' }
    ];

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Your Leads...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }} className="md:grid-cols-1">
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
                            gap: '1.25rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'default',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        {/* Decorative Background Element */}
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            width: '60px',
                            height: '60px',
                            background: `${s.color}08`,
                            borderRadius: '50%',
                            zIndex: 0
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <div style={{
                                background: `${s.color}15`,
                                padding: '12px',
                                borderRadius: '12px',
                                color: s.color,
                                border: `1px solid ${s.color}25`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {s.icon}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #f1f5f9',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                color: '#64748b'
                            }}>
                                <TrendingUp size={12} color="#10b981" />
                                <span>Active</span>
                            </div>
                        </div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '4px' }}>
                                {s.label}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>
                                {s.value}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                            Live Statistics
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <Card title="My Assigned Leads" subtitle="Leads requiring your immediate attention.">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {leads.length === 0 ? (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No leads assigned yet.</p>
                        ) : leads.map((lead, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'grid', placeItems: 'center', fontWeight: '700' }}>
                                        {lead.first_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>{lead.first_name} {lead.last_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>#{lead._id.slice(-6).toUpperCase()} • {lead.origin_address.split(',')[0]}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Badge>{lead.status}</Badge>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${lead._id}`)}><ArrowRight size={16} /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full" style={{ marginTop: '1.5rem', color: '#4f46e5' }}>Refresh All Leads</Button>
                </Card>

                <Card title="Upcoming Follow-ups">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {(() => {
                            const allFollowUps = leads.reduce((acc, lead) => {
                                const pendings = (lead.follow_ups || [])
                                    .filter(f => f.status === 'PENDING')
                                    .map(f => ({ ...f, leadName: `${lead.first_name} ${lead.last_name}`, leadId: lead._id }));
                                return [...acc, ...pendings];
                            }, []);

                            const sorted = allFollowUps.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).slice(0, 5);

                            if (sorted.length === 0) return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No pending follow-ups.</p>;

                            return sorted.map((f, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => navigate(`/leads/${f.leadId}`)}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'grid', placeItems: 'center', color: '#1d4ed8' }}>
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{f.leadName}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{f.note}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '700', marginTop: '2px' }}>{new Date(f.dateTime).toLocaleString()}</div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                    <Button variant="outline" style={{ width: '100%', marginTop: '2.5rem' }} onClick={() => navigate('/leads')}><Clock size={18} /> View All Leads</Button>
                </Card>
            </div>
        </div>
    );
};

export default SalesDashboard;
