import React, { createContext, useContext, useState } from 'react';

type AuthContextType = {
    user: any;
    handleLoginUser: (login: string, password: string) => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<any>>;
} | null;

const AuthContext = createContext<AuthContextType>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);

    const handleLoginUser = async (login: string, password: string) => {
        // ...your login logic here...
        // setUser({ ...userData, isAuthenticated: true });
    };

    const value: AuthContextType = { user, handleLoginUser, setUser };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export default function useAuth() {
    return useContext(AuthContext);
}
