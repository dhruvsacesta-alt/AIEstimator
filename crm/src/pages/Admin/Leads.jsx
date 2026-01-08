import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input } from '../../components/ui';
import {
    Filter,
    ArrowRight,
    UserPlus,
    Eye,
    MapPin,
    Truck,
    Calendar,
    X,
    Plus,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLeads, createManualLead, updateLeadStatus, getUsers, assignLead } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_FLOW = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CONTACTED', 'PROPOSAL_SENT', 'BOOKED', 'HANDOVER', 'COMPLETED', 'CANCELLED'];

const AdminLeads = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Leads');
    const [showManualModal, setShowManualModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newLead, setNewLead] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        move_type: 'Residential', move_date: '',
        origin_address: '', origin_pincode: '',
        destination_address: '', destination_pincode: '',
        property_type: 'Apartment',
        pickup_floor: 0, pickup_lift: 'No',
        drop_floor: 0, drop_lift: 'No'
    });

    const fetchLeads = async () => {
        try {
            const data = await getLeads();
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
        if (currentUser.role === 'ADMIN') {
            getUsers().then(setUsers).catch(console.error);
        }
    }, [currentUser]);

    const handleQuickStatusUpdate = async (leadId, currentStatus, newStatus) => {
        if (newStatus === currentStatus) return;

        // Sales follows strict pipeline check in frontend, same as details page
        if (currentUser.role === 'SALES') {
            const currentIndex = STATUS_FLOW.indexOf(currentStatus);
            const nextIndex = STATUS_FLOW.indexOf(newStatus);
            if (newStatus !== 'CANCELLED' && nextIndex !== currentIndex + 1) {
                alert(`Policy: You must progress leads sequentially to ${STATUS_FLOW[currentIndex + 1]}.`);
                return;
            }
        }

        try {
            await updateLeadStatus(leadId, newStatus, 'Quick update from list');
            fetchLeads();
        } catch (err) {
            alert(err.response?.data?.error || 'Status update failed');
        }
    };

    const handleQuickAssign = async (leadId, userId) => {
        try {
            await assignLead(leadId, userId);
            fetchLeads();
        } catch (err) {
            alert('Assignment failed');
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createManualLead(newLead);
            setShowManualModal(false);
            setNewLead({
                first_name: '', last_name: '', email: '', phone: '',
                move_type: 'Residential', move_date: '',
                origin_address: '', origin_pincode: '',
                destination_address: '', destination_pincode: '',
                property_type: 'Apartment',
                pickup_floor: 0, pickup_lift: 'No',
                drop_floor: 0, drop_lift: 'No'
            });
            fetchLeads();
        } catch (err) {
            alert('Failed to create lead');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm);

        if (!matchesSearch) return false;

        if (activeTab === 'All Leads') return lead.status !== 'CANCELLED';
        if (activeTab === 'New') return lead.status === 'NEW';
        if (activeTab === 'In Pipeline') return ['ASSIGNED', 'IN_PROGRESS', 'CONTACTED', 'PROPOSAL_SENT', 'HANDOVER'].includes(lead.status);
        if (activeTab === 'Booked') return (lead.status === 'BOOKED' || lead.status === 'COMPLETED') && lead.status !== 'CANCELLED';
        if (activeTab === 'Cancelled') return lead.status === 'CANCELLED';
        return true;
    });

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Synchronizing Lead Database...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            {/* Modal Overlay */}
            {showManualModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '1rem' }}>
                    <Card style={{ width: '100%', maxWidth: '700px', padding: 'clamp(1.5rem, 5vw, 2.5rem)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => setShowManualModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#64748b', zIndex: 10 }}>
                            <X size={18} />
                        </button>

                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Manual Lead Entry</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Create a new moving assessment manually for a walk-in or phone customer.</p>
                        </div>

                        <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1rem' }}>
                                <Input label="First Name" required value={newLead.first_name} onChange={e => setNewLead({ ...newLead, first_name: e.target.value })} />
                                <Input label="Last Name" required value={newLead.last_name} onChange={e => setNewLead({ ...newLead, last_name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1rem' }}>
                                <Input label="Email Address" type="email" required value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} />
                                <Input label="Phone Number" required value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Move Type</label>
                                    <select
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                                        value={newLead.move_type}
                                        onChange={e => setNewLead({ ...newLead, move_type: e.target.value })}
                                    >
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                    </select>
                                </div>
                                <Input label="Preferred Move Date" type="date" required value={newLead.move_date} onChange={e => setNewLead({ ...newLead, move_date: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Property Type</label>
                                    <select
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                                        value={newLead.property_type}
                                        onChange={e => setNewLead({ ...newLead, property_type: e.target.value })}
                                    >
                                        <option value="Apartment">Apartment</option>
                                        <option value="Independent House">Independent House</option>
                                        <option value="Office">Office</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2" style={{ gap: '8px' }}>
                                    <Input label="Pickup Floor" type="number" min="0" value={newLead.pickup_floor} onChange={e => setNewLead({ ...newLead, pickup_floor: e.target.value })} />
                                    <Input label="Drop Floor" type="number" min="0" value={newLead.drop_floor} onChange={e => setNewLead({ ...newLead, drop_floor: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Lift at Pickup?</label>
                                    <select
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                                        value={newLead.pickup_lift}
                                        onChange={e => setNewLead({ ...newLead, pickup_lift: e.target.value })}
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Lift at Drop?</label>
                                    <select
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                                        value={newLead.drop_lift}
                                        onChange={e => setNewLead({ ...newLead, drop_lift: e.target.value })}
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-1" style={{ gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Input label="Pickup Address" required value={newLead.origin_address} onChange={e => setNewLead({ ...newLead, origin_address: e.target.value })} />
                                    <div style={{ width: '100px', flexShrink: 0 }}><Input label="Pincode" required value={newLead.origin_pincode} onChange={e => setNewLead({ ...newLead, origin_pincode: e.target.value })} /></div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Input label="Drop Address" required value={newLead.destination_address} onChange={e => setNewLead({ ...newLead, destination_address: e.target.value })} />
                                    <div style={{ width: '100px', flexShrink: 0 }}><Input label="Pincode" required value={newLead.destination_pincode} onChange={e => setNewLead({ ...newLead, destination_pincode: e.target.value })} /></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }} className="mobile-stack">
                                <Button type="button" variant="outline" style={{ flex: 1 }} onClick={() => setShowManualModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={submitting} style={{ flex: 2 }}>
                                    {submitting ? 'Creating Lead...' : 'Create Assessment & Open'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mobile-stack">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', flexWrap: 'wrap' }} className="mobile-stack">
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px 8px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', outline: 'none' }}
                        />
                    </div>

                    <div className="overflow-x-auto" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '100%' }}>
                        {['All Leads', 'New', 'In Pipeline', 'Booked', 'Cancelled'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '8px 18px',
                                    border: 'none',
                                    background: activeTab === tab ? 'white' : 'transparent',
                                    borderRadius: '10px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    color: activeTab === tab ? '#1d4ed8' : '#64748b',
                                    boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <Button style={{ background: '#0f172a', whiteSpace: 'nowrap' }} onClick={() => setShowManualModal(true)}><Plus size={18} /> Manual Lead Entry</Button>
            </div>

            <Card noPadding>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f1f5f9', textAlign: 'left', background: '#f8fafc' }}>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer & Contact</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Move Logistics</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ownership</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Quote</th>
                                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No leads found in this category.</td>
                                </tr>
                            ) : filteredLeads.map((lead, i) => (
                                <tr key={lead._id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fcfdff'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>{lead.first_name} {lead.last_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>{lead.phone}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={14} color="#1d4ed8" /> {lead.origin_pincode} → {lead.destination_pincode}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {lead.move_date}</span>
                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#e2e8f0' }} />
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> {lead.move_type}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <select
                                            value={lead.status}
                                            onChange={(e) => handleQuickStatusUpdate(lead._id, lead.status, e.target.value)}
                                            style={{
                                                padding: '4px 12px',
                                                borderRadius: '99px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '0.75rem',
                                                fontWeight: '800',
                                                background: '#f8fafc',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                color: '#1d4ed8'
                                            }}
                                        >
                                            {STATUS_FLOW.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        {currentUser.role === 'ADMIN' ? (
                                            <select
                                                value={lead.assigned_to?._id || lead.assigned_to || ''}
                                                onChange={(e) => handleQuickAssign(lead._id, e.target.value)}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '0.85rem',
                                                    background: 'white',
                                                    outline: 'none',
                                                    fontWeight: '600',
                                                    width: '180px'
                                                }}
                                            >
                                                <option value="">Unassigned</option>
                                                {users.map(u => (
                                                    <option key={u._id} value={u._id}>{u.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            lead.assigned_to ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', fontSize: '0.75rem', display: 'grid', placeItems: 'center', color: '#1d4ed8', fontWeight: '800', border: '1px solid #dbeafe' }}>
                                                        {lead.assigned_to.name?.charAt(0)}
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#475569' }}>{lead.assigned_to.name}</div>
                                                </div>
                                            ) : (
                                                <Badge variant="danger">UNASSIGNED</Badge>
                                            )
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>₹{lead.final_price || lead.ai_estimated_price || 0}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>{lead.ai_estimated_volume || 'TBD'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${lead._id}`)} style={{ borderColor: '#e2e8f0', fontWeight: '700' }}>
                                            View Details <ArrowRight size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>
                    Showing <span style={{ color: '#0f172a', fontWeight: '800' }}>{filteredLeads.length}</span> of {leads.length} leads
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" size="sm" disabled style={{ opacity: 0.5 }}>Previous</Button>
                    <Button variant="primary" size="sm">1</Button>
                    <Button variant="outline" size="sm" disabled style={{ opacity: 0.5 }}>Next</Button>
                </div>
            </div>
        </div>
    );
};

export default AdminLeads;
