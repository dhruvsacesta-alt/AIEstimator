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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                {stats.map((s, i) => (
                    <Card key={i}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ background: `${s.color}10`, color: s.color, width: '45px', height: '45px', borderRadius: '12px', display: 'grid', placeItems: 'center' }}>
                                {s.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{s.label}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{s.value}</div>
                            </div>
                        </div>
                    </Card>
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
