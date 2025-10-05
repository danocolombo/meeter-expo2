import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const handleLoginUser = async (login, password) => {
        // ...your login logic here...
        // setUser({ ...userData, isAuthenticated: true });
    };

    const value = { user, handleLoginUser, setUser };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export default function useAuth() {
    return useContext(AuthContext);
}
