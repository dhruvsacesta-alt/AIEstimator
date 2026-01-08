import React from 'react';

export const Badge = ({ children, status = 'default' }) => {
    const styles = {
        NEW: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' },
        ASSIGNED: { background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7' },
        IN_PROGRESS: { background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5' },
        CONTACTED: { background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ede9fe' },
        PROPOSAL_SENT: { background: '#ecfdf5', color: '#047857', border: '1px solid #d1fae5' },
        BOOKED: { background: '#f0fdf4', color: '#15803d', border: '1px solid #dcfce7' },
        HANDOVER: { background: '#f0f9ff', color: '#0369a1', border: '1px solid #e0f2fe' },
        COMPLETED: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
        CANCELLED: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2' },
        default: { background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb' }
    };

    const style = styles[children] || styles.default;

    return (
        <span style={{
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            ...style
        }}>
            {children}
        </span>
    );
};
