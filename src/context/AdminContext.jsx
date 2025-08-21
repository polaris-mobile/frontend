import React, { createContext, useState, useContext } from 'react';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const [impersonatedUserId, setImpersonatedUserId] = useState(null);
    const [impersonatedUsername, setImpersonatedUsername] = useState('');
    const value = { 
        impersonatedUserId, 
        setImpersonatedUserId,
        impersonatedUsername,
        setImpersonatedUsername
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};