import React from 'react';

export const Input = ({ label, error, style = {}, ...props }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>{label}</label>}
        <input
            style={{
                background: '#ffffff',
                border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#1e293b',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.2s',
                ...style
            }}
            onFocus={(e) => {
                e.target.style.borderColor = '#1d4ed8';
                e.target.style.boxShadow = '0 0 0 3px rgba(29, 78, 216, 0.1)';
            }}
            onBlur={(e) => {
                e.target.style.borderColor = error ? '#ef4444' : '#e2e8f0';
                e.target.style.boxShadow = 'none';
            }}
            {...props}
        />
        {error && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</span>}
    </div>
);
