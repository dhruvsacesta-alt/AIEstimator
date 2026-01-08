import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', style = {}, ...props }) => {
    const baseStyle = {
        padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '9px 18px',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: size === 'sm' ? '0.8rem' : '0.9rem',
        transition: 'all 0.15s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        border: '1px solid transparent',
        cursor: 'pointer',
        justifyContent: 'center',
        fontFamily: 'inherit'
    };

    const variants = {
        primary: { background: '#1d4ed8', color: 'white' },
        secondary: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' },
        outline: { background: 'white', border: '1px solid #e2e8f0', color: '#475569' },
        danger: { background: '#ef4444', color: 'white' },
        ghost: { background: 'transparent', color: '#64748b' }
    };

    const currentVariant = variants[variant] || variants.primary;

    return (
        <button
            style={{ ...baseStyle, ...currentVariant, ...style }}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
};
