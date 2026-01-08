import React from 'react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', style = {}, ...props }) => {
    const baseStyle = {
        padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 28px' : '10px 20px',
        borderRadius: '10px',
        fontWeight: '600',
        fontSize: size === 'sm' ? '0.875rem' : '1rem',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        border: 'none',
        cursor: 'pointer',
        justifyContent: 'center',
        fontFamily: 'inherit'
    };

    const variants = {
        primary: {
            background: '#1d4ed8',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(29, 78, 216, 0.2)',
        },
        secondary: {
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #dbeafe',
        },
        outline: {
            background: 'transparent',
            border: '1px solid #e2e8f0',
            color: '#475569',
        },
        ghost: {
            background: 'transparent',
            color: '#64748b',
        }
    };

    const currentVariant = variants[variant] || variants.primary;

    return (
        <button
            style={{ ...baseStyle, ...currentVariant, ...style }}
            className={className}
            onMouseOver={(e) => {
                e.currentTarget.style.filter = 'brightness(1.05)';
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
            {...props}
        >
            {children}
        </button>
    );
};
