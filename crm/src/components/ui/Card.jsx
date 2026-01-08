import React from 'react';

export const Card = ({ children, title, subtitle, footer, noPadding = false, style = {} }) => (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', ...style }}>
        {(title || subtitle) && (
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                {title && <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>{title}</h3>}
                {subtitle && <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '2px' }}>{subtitle}</p>}
            </div>
        )}
        <div style={{ padding: noPadding ? '0' : '1.5rem' }}>
            {children}
        </div>
        {footer && (
            <div style={{ padding: '1rem 1.5rem', background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
                {footer}
            </div>
        )}
    </div>
);
