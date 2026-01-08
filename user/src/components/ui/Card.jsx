import React from 'react';

export const Card = ({ children, style = {}, className = '' }) => (
    <div
        className={className}
        style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            ...style
        }}
    >
        {children}
    </div>
);
