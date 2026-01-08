import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('crm_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (role, token, userData) => {
        const newUser = {
            ...userData,
            token,
            role
        };
        setUser(newUser);
        localStorage.setItem('crm_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('crm_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
