import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing authentication on app load
        const checkAuth = () => {
            try {
                const authStatus = localStorage.getItem('isAuthenticated');
                const userData = localStorage.getItem('userData');

                if (authStatus === 'true' && userData) {
                    const user = JSON.parse(userData);
                    if (user.isAuthenticated) {
                        setUser(user);
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userData');
        localStorage.removeItem('isAuthenticated');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
