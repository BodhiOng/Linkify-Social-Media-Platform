import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    _id: string;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
    isLoading: true
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const initializeAuth = () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            console.log('Initializing Auth:', { storedUser, storedToken });

            if (storedToken && storedUser) {
                try {
                    const parsedUser: User = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setToken(storedToken);
                    setIsAuthenticated(true);
                    console.log('User ID from local storage:', parsedUser._id);
                } catch (error) {
                    console.error("Error parsing user data:", error);
                    logout();
                }
            } else {
                logout();
            }
            setIsLoading(false);
        };

        if (typeof window !== 'undefined') {
            initializeAuth();
        }
    }, []);

    const login = (userData: any, userToken: string) => {
        try {
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', userToken);
            setUser(userData);
            setToken(userToken);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};