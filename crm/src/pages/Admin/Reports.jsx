import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/ui';
import {
    BarChart3, PieChart, TrendingUp,
    Calendar, Users, FileText, CheckCircle2,
    Clock
} from 'lucide-react';
import { getLeads } from '../../utils/api';

const Reports = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeads().then(data => {
            setLeads(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const stats = {
        conversion: leads.length ? ((leads.filter(l => l.status === 'BOOKED' || l.status === 'COMPLETED').length / leads.length) * 100).toFixed(1) : 0,
        avgPrice: leads.length ? (leads.reduce((acc, curr) => acc + (curr.final_price || curr.ai_estimated_price || 0), 0) / leads.length).toFixed(0) : 0,
        totalRevenue: leads.reduce((acc, curr) => acc + (curr.final_price || 0), 0),
        activePipeline: leads.filter(l => ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CONTACTED', 'PROPOSAL_SENT'].includes(l.status)).length
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Aggregating Business Intelligence...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>Business Analytics</h1>
                <p style={{ color: '#64748b', fontWeight: '500' }}>View-only performance report for moving operations.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <Card>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Avg. Quote</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a' }}>₹{stats.avgPrice}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>Across all leads</div>
                </Card>
                <Card>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Booked Revenue</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1d4ed8' }}>₹{stats.totalRevenue}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>Confirmed bookings</div>
                </Card>
                <Card>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Pipeline Depth</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#f59e0b' }}>{stats.activePipeline}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>Active unbooked leads</div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <Card title="Status Distribution">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['NEW', 'IN_PROGRESS', 'PROPOSAL_SENT', 'BOOKED', 'COMPLETED', 'CANCELLED'].map(s => {
                            const count = leads.filter(l => l.status === s).length;
                            const pct = leads.length ? (count / leads.length) * 100 : 0;
                            return (
                                <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700' }}>
                                        <span style={{ color: '#475569' }}>{s}</span>
                                        <span style={{ color: '#0f172a' }}>{count} ({pct.toFixed(0)}%)</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: s === 'BOOKED' || s === 'COMPLETED' ? '#10b981' : s === 'CANCELLED' ? '#ef4444' : '#1d4ed8' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card title="Efficiency Markers">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0f9ff', display: 'grid', placeItems: 'center', color: '#0369a1' }}><Clock size={20} /></div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>2.4 Days</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Avg. Response Time</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#166534' }}><Users size={20} /></div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>High</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Consultant Utilization</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', display: 'grid', placeItems: 'center', color: '#9a3412' }}><TrendingUp size={20} /></div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>+18%</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>Month-over-Month Growth</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
