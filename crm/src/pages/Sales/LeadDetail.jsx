import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input } from '../../components/ui';
import {
    ArrowLeft, MapPin, Calendar, Phone, Mail, Package,
    AlertCircle, Clock, CheckCircle2, Trash2, Plus, X,
    MessageSquare, Send, DollarSign, Edit3, Image as ImageIcon,
    Truck, UserCheck, ShieldAlert, History, Info, ClipboardList,
    Layers, TruckIcon, ArrowRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    getLeadDetail, updateLeadStatus, updateInventory,
    finalizePrice, addLeadNote,
    BACKEND_URL
} from '../../utils/api';

const STATUS_FLOW = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CONTACTED', 'PROPOSAL_SENT', 'BOOKED', 'HANDOVER', 'COMPLETED'];

const SalesLeadDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [reason, setReason] = useState('');
    const [newItem, setNewItem] = useState({ item_name: '', quantity: 1, price: 0, category: 'Misc', is_fragile: false });
    const [editingPrice, setEditingPrice] = useState(false);
    const [tempPrice, setTempPrice] = useState(0);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [followUpData, setFollowUpData] = useState({ dateTime: '', note: '' });

    const handleAddFollowUp = async () => {
        if (!followUpData.dateTime || !followUpData.note) return;
        try {
            await addLeadFollowUp(id, followUpData);
            setFollowUpData({ dateTime: '', note: '' });
            refreshData();
        } catch (err) { alert('Failed to schedule follow-up'); }
    };

    const handleCompleteFollowUp = async (fId) => {
        try {
            await completeLeadFollowUp(id, fId);
            refreshData();
        } catch (err) { alert('Failed to complete follow-up'); }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            await addLeadNote(id, newNote);
            setNewNote('');
            refreshData();
        } catch (err) { alert('Failed to add note'); }
    };

    const refreshData = async () => {
        try {
            const data = await getLeadDetail(id);
            setLead(data);
            setTempPrice(data.final_price || data.ai_estimated_price);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 403) {
                alert('Access Denied: You are not assigned to this lead.');
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refreshData(); }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        // Sales follows strict pipeline check in backend, but we can alert here too
        const currentIndex = STATUS_FLOW.indexOf(lead.status);
        const nextIndex = STATUS_FLOW.indexOf(newStatus);

        if (newStatus !== 'CANCELLED' && nextIndex !== currentIndex + 1) {
            alert(`Sales Flow Policy: You must progress the lead to the next stage (${STATUS_FLOW[currentIndex + 1]}) sequentially.`);
            return;
        }

        try {
            await updateLeadStatus(id, newStatus, reason);
            setReason('');
            refreshData();
        } catch (err) { alert(err.response?.data?.error || 'Status update failed'); }
    };

    const addItem = async () => {
        if (!newItem.item_name) return;
        const updatedItems = [...lead.items, { ...newItem, source: 'MANUAL' }];
        try {
            await updateInventory(id, updatedItems);
            setNewItem({ item_name: '', quantity: 1, price: 0, category: 'Misc', is_fragile: false });
            refreshData();
        } catch (err) { alert('Failed to update inventory'); }
    };

    const removeItem = async (index) => {
        const updatedItems = lead.items.filter((_, i) => i !== index);
        try {
            await updateInventory(id, updatedItems);
            refreshData();
        } catch (err) { alert('Failed to remove item'); }
    };

    const savePrice = async () => {
        // Security: sales should provide a reason for any price change
        if (!reason && Math.abs(tempPrice - (lead.final_price || lead.ai_estimated_price)) > 1) {
            alert('Consultant Note Required: Please explain the reason for this manual price adjustment.');
            return;
        }
        try {
            await finalizePrice(id, tempPrice, reason || 'Sales consultant verified');
            setEditingPrice(false);
            setReason('');
            refreshData();
        } catch (err) { alert('Failed to update price'); }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Consulting Lead File...</div>;
    if (!lead) return <div style={{ padding: '4rem', textAlign: 'center' }}>Lead not found</div>;

    const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(lead.status) + 1];

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: <Info size={16} /> },
        { id: 'photos', label: 'Photos & Media', icon: <ImageIcon size={16} /> },
        { id: 'inventory', label: 'Inventory (AI)', icon: <ClipboardList size={16} /> },
        { id: 'logistics', label: 'Logistics Options', icon: <TruckIcon size={16} /> },
        { id: 'followups', label: 'Follow-ups', icon: <Clock size={16} /> },
        { id: 'history', label: 'Activity Log', icon: <History size={16} /> },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }} className="mobile-stack">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', display: 'grid', placeItems: 'center', color: '#64748b', cursor: 'pointer' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h1 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', fontWeight: '800', color: '#1e293b' }}>{lead.first_name} {lead.last_name}</h1>
                            <Badge>{lead.status}</Badge>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Lead ID: LD-{id.slice(-6).toUpperCase()}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {lead.status !== 'CANCELLED' && lead.status !== 'COMPLETED' && (
                        <Button variant="outline" style={{ color: '#ef4444', borderColor: '#fee2e2' }} onClick={() => {
                            if (!reason) { alert('Policy: Please enter a reason for cancellation in the notes box.'); return; }
                            handleStatusUpdate('CANCELLED');
                        }}>
                            Cancel Lead
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-3 lg:grid-cols-1" style={{ gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: Tabbed Interface - Takes 2 cols on large screen */}
                <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Navigation Tabs */}
                        <div className="overflow-x-auto" style={{ display: 'flex', background: '#fff', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        whiteSpace: 'nowrap',
                                        gap: '8px',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        background: activeTab === tab.id ? '#1d4ed8' : 'transparent',
                                        color: activeTab === tab.id ? '#fff' : '#64748b',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <Card style={{ minHeight: '500px' }}>
                            {activeTab === 'personal' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <UserCheck size={18} color="#1d4ed8" /> Customer Information
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#94a3b8', fontWeight: '600' }}>Full Name:</span>
                                                    <span style={{ fontWeight: '700' }}>{lead.first_name} {lead.last_name}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#94a3b8', fontWeight: '600' }}>Email:</span>
                                                    <span style={{ fontWeight: '700' }}>{lead.email}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#94a3b8', fontWeight: '600' }}>Mobile:</span>
                                                    <span style={{ fontWeight: '700' }}>{lead.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Truck size={18} color="#10b981" /> Move Overview
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#94a3b8', fontWeight: '600' }}>Move Type:</span>
                                                    <Badge variant="secondary">{lead.move_type}</Badge>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#94a3b8', fontWeight: '600' }}>Date:</span>
                                                    <span style={{ fontWeight: '700' }}>{lead.move_date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ height: '1px', background: '#f1f5f9' }} />

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Starting Point</div>
                                            <div style={{ fontWeight: '700', color: '#1e293b', display: 'flex', gap: '8px' }}>
                                                <MapPin size={18} color="#1d4ed8" style={{ flexShrink: 0 }} />
                                                {lead.origin_address}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', marginLeft: '26px' }}>Pincode: {lead.origin_pincode}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Destination</div>
                                            <div style={{ fontWeight: '700', color: '#1e293b', display: 'flex', gap: '8px' }}>
                                                <MapPin size={18} color="#10b981" style={{ flexShrink: 0 }} />
                                                {lead.destination_address}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', marginLeft: '26px' }}>Pincode: {lead.destination_pincode}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'photos' && (
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem' }}>Media Gallery</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                        {(lead.media || []).map((m, i) => (
                                            <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', height: '160px', background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', position: 'relative' }} onClick={() => window.open(`${BACKEND_URL}/${m.file_path}`, '_blank')}>
                                                <img src={`${BACKEND_URL}/${m.file_path}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Media" />
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '0.7rem', backdropFilter: 'blur(4px)' }}>
                                                    {m.file_type?.split('/')[1]?.toUpperCase() || 'IMAGE'}
                                                </div>
                                            </div>
                                        ))}
                                        {(!lead.media || lead.media.length === 0) && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>No media files uploaded.</div>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inventory' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>Inventory List</h3>
                                        <Badge variant="primary">{lead.items.length} Items Detected</Badge>
                                    </div>
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#f8fafc' }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Item Name</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Category</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Qty</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Unit Price</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Total</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Source</th>
                                                    <th style={{ padding: '12px 16px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lead.items.map((it, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1e293b' }}>{it.item_name}</td>
                                                        <td style={{ padding: '12px 16px' }}><Badge variant="secondary">{it.category}</Badge></td>
                                                        <td style={{ padding: '12px 16px', fontWeight: '800' }}>{it.quantity}</td>
                                                        <td style={{ padding: '12px 16px', color: '#64748b' }}>₹{it.price || 0}</td>
                                                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#1e293b' }}>₹{(it.price || 0) * (it.quantity || 1)}</td>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <Badge variant={it.source === 'AI' ? 'primary' : 'outline'}>{it.source}</Badge>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                            <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr style={{ background: '#fdfdfd', borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '12px 16px' }}><input placeholder="Manual item..." value={newItem.item_name} onChange={e => setNewItem({ ...newItem, item_name: e.target.value })} style={{ border: 'none', background: 'none', outline: 'none', fontWeight: '600', width: '100%' }} /></td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} style={{ border: 'none', background: 'none', outline: 'none' }}>
                                                            <option value="Furniture">Furniture</option>
                                                            <option value="Electronics">Electronics</option>
                                                            <option value="Fragile">Fragile</option>
                                                            <option value="Misc">Misc</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '12px 16px' }}><input type="number" min="1" placeholder="Qty" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} style={{ border: 'none', background: 'none', outline: 'none', width: '40px' }} /></td>
                                                    <td style={{ padding: '12px 16px' }}><input type="number" min="0" placeholder="₹" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })} style={{ border: 'none', background: 'none', outline: 'none', width: '60px' }} /></td>
                                                    <td style={{ padding: '12px 16px' }}>-</td>
                                                    <td style={{ padding: '12px 16px' }}></td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}><button onClick={addItem} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer' }}><Plus size={20} /></button></td>
                                                </tr>
                                                <tr style={{ background: '#f8fafc' }}>
                                                    <td colSpan="4" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', fontSize: '0.8rem' }}>Total Item Cost</td>
                                                    <td colSpan="3" style={{ padding: '12px 16px', fontWeight: '900', color: '#1e293b', fontSize: '1rem' }}>
                                                        ₹{lead.items.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'logistics' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>Pick-up Specifics</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#64748b' }}>Floor Level:</span>
                                                    <span style={{ fontWeight: '700' }}>{lead.pickup_floor}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#64748b' }}>Lift Available:</span>
                                                    <Badge variant={lead.pickup_lift === 'Yes' ? 'success' : 'danger'}>{lead.pickup_lift}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>Drop-off Specifics</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#64748b' }}>Floor Level:</span>
                                                    <span style={{ fontWeight: '700' }}>{lead.drop_floor}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                    <span style={{ color: '#64748b' }}>Lift Available:</span>
                                                    <Badge variant={lead.drop_lift === 'Yes' ? 'success' : 'danger'}>{lead.drop_lift}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ height: '1px', background: '#f1f5f9' }} />
                                    <div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.25rem' }}>Operational Assignment</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Assigned Crew</div>
                                                <div style={{ fontWeight: '700', color: '#475569' }}>{lead.assigned_crew || 'TBD'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Vehicle Ref</div>
                                                <div style={{ fontWeight: '700', color: '#475569' }}>{lead.assigned_vehicle || 'TBD'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Handoff Condition</div>
                                                <div style={{ fontWeight: '700', color: '#475569' }}>Standard</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'followups' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={18} color="#1d4ed8" /> Schedule Follow-up
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>Date & Time</label>
                                                <input
                                                    type="datetime-local"
                                                    value={followUpData.dateTime}
                                                    onChange={e => setFollowUpData({ ...followUpData, dateTime: e.target.value })}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>What needs to be done?</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Call back to finalize price"
                                                    value={followUpData.note}
                                                    onChange={e => setFollowUpData({ ...followUpData, note: e.target.value })}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', outline: 'none' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button onClick={handleAddFollowUp} disabled={!followUpData.dateTime || !followUpData.note}>
                                                <Plus size={16} /> Schedule Reminder
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.25rem' }}>Tasks & Reminders</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {(lead.follow_ups || []).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).map((f, i) => (
                                                <div key={i} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '1.25rem',
                                                    background: f.status === 'COMPLETED' ? '#f8fafc' : 'white',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    opacity: f.status === 'COMPLETED' ? 0.6 : 1
                                                }}>
                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '10px',
                                                            background: f.status === 'COMPLETED' ? '#f1f5f9' : '#fff7ed',
                                                            display: 'grid',
                                                            placeItems: 'center',
                                                            color: f.status === 'COMPLETED' ? '#94a3b8' : '#f59e0b'
                                                        }}>
                                                            <Clock size={20} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '700', color: '#1e293b', textDecoration: f.status === 'COMPLETED' ? 'line-through' : 'none' }}>{f.note}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                                                                {new Date(f.dateTime).toLocaleString()} • {f.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {f.status === 'PENDING' && (
                                                        <Button variant="outline" size="sm" onClick={() => handleCompleteFollowUp(f._id)}>
                                                            Mark Done
                                                        </Button>
                                                    )}
                                                    {f.status === 'COMPLETED' && (
                                                        <CheckCircle2 size={24} color="#10b981" />
                                                    )}
                                                </div>
                                            ))}
                                            {(!lead.follow_ups || lead.follow_ups.length === 0) && (
                                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                                    <Calendar size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                    <p>No follow-ups scheduled for this lead yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MessageSquare size={18} color="#1d4ed8" /> Add Internal Note
                                        </h4>
                                        <textarea
                                            placeholder="Type a note for the team or yourself..."
                                            value={newNote}
                                            onChange={e => setNewNote(e.target.value)}
                                            style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '0.9rem', outline: 'none', minHeight: '80px', marginBottom: '12px' }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                                                <Send size={14} /> Post Note
                                            </Button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        {(lead.history || []).map((h, i) => (
                                            <div key={i} style={{
                                                padding: '1rem',
                                                background: h.action === 'NOTE_ADDED' ? '#fffbeb' : '#f8fafc',
                                                borderRadius: '12px',
                                                borderLeft: `4px solid ${h.action === 'NOTE_ADDED' ? '#f59e0b' : (i === 0 ? '#1d4ed8' : '#e2e8f0')}`,
                                                position: 'relative',
                                                border: h.action === 'NOTE_ADDED' ? '1px solid #fef3c7' : '1px solid transparent',
                                                borderLeftWidth: '4px'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {h.action === 'NOTE_ADDED' && <MessageSquare size={14} color="#f59e0b" />}
                                                        {h.action.replace(/_/g, ' ')}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>{new Date(h.timestamp).toLocaleString()}</span>
                                                </div>
                                                {h.reason && <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500', lineHeight: '1.5' }}>{h.reason}</p>}
                                                {!h.reason && <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No additional context.</p>}
                                            </div>
                                        ))}
                                        {(!lead.history || lead.history.length === 0) && (
                                            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                                <History size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                                <p>No accessible history for this assignment yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Right: Actions & Numbers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '0px', alignSelf: 'start' }}>

                    {/* Financial Summary */}
                    <Card title="Financial Profile">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: '#64748b', fontWeight: '600' }}>AI Estimate:</span>
                                <span style={{ fontWeight: '700' }}>₹{lead.ai_estimated_price}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '10px' }}>
                                <span style={{ color: '#64748b', fontWeight: '600' }}>Volume Total:</span>
                                <span style={{ fontWeight: '700' }}>{lead.ai_estimated_volume}</span>
                            </div>

                            <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #dbeafe', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '4px' }}>Final Quoted Price</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    {editingPrice ? (
                                        <input type="number" value={tempPrice} autoFocus onChange={e => setTempPrice(e.target.value)} style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b', background: 'none', border: 'none', outline: 'none', width: '120px', textAlign: 'center' }} />
                                    ) : (
                                        <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>₹{lead.final_price || lead.ai_estimated_price}</div>
                                    )}
                                    <button onClick={() => editingPrice ? savePrice() : setEditingPrice(true)} style={{ color: '#1d4ed8', background: '#fff', border: '1px solid #dbeafe', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                                        {editingPrice ? <CheckCircle2 size={18} /> : <Edit3 size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Progress Control */}
                    <Card title="Pipeline Progress" subtitle="Current stage of the move process.">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'grid', placeItems: 'center', color: '#1d4ed8' }}>
                                    <Clock size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Current Status</div>
                                    <Badge>{lead.status}</Badge>
                                </div>
                            </div>
                            <Button style={{ width: '100%', gap: '8px' }} onClick={() => setShowStatusModal(true)}>
                                <Layers size={16} /> Update Lead Status
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
            {/* Status Update Modal */}
            {showStatusModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '2rem' }}>
                    <Card style={{ width: '100%', maxWidth: '450px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Update Stage</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Progress this lead to the next operational phase.</p>
                            </div>
                            <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', justifyContent: 'center' }}>
                                <Badge variant="outline">{lead.status}</Badge>
                                <ArrowRight size={16} color="#94a3b8" />
                                <Badge>{nextStatus || 'FINAL STAGE'}</Badge>
                            </div>

                            <textarea
                                placeholder="Add optional consultant notes for this transition..."
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', fontSize: '0.9rem', outline: 'none', minHeight: '120px' }}
                            />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button variant="outline" style={{ flex: 1 }} onClick={() => setShowStatusModal(false)}>Cancel</Button>
                                {nextStatus && (
                                    <Button style={{ flex: 2, gap: '8px' }} onClick={async () => {
                                        await handleStatusUpdate(nextStatus);
                                        setShowStatusModal(false);
                                    }}>
                                        Move to {nextStatus} <CheckCircle2 size={18} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SalesLeadDetail;
